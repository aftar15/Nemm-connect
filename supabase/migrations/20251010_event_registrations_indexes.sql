-- =====================================================
-- EVENT REGISTRATIONS: INDEXES AND VIEWS
-- =====================================================
-- Migration: Add performance indexes and helper views for event registration system
-- Date: 2025-10-10

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Index for fast event lookup (used in capacity checks)
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id 
ON public.event_registrations(event_id);

-- Index for fast user lookup (used in "my registrations" views)
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id 
ON public.event_registrations(user_id);

-- Composite index for checking if user is registered for event
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_event 
ON public.event_registrations(user_id, event_id);

-- Index for faster registration time queries
CREATE INDEX IF NOT EXISTS idx_event_registrations_created_at 
ON public.event_registrations(created_at DESC);

-- =====================================================
-- HELPER VIEWS
-- =====================================================

-- Event Capacity View
-- Shows current registration count and status for each event
CREATE OR REPLACE VIEW public.event_capacity_view AS
SELECT 
  e.id,
  e.title,
  e.description,
  e.event_date,
  e.location,
  e.event_type,
  e.max_participants,
  COUNT(er.id)::INTEGER as current_registrations,
  CASE 
    WHEN e.max_participants IS NULL THEN 'unlimited'
    WHEN COUNT(er.id) >= e.max_participants THEN 'full'
    WHEN COUNT(er.id) >= (e.max_participants * 0.8)::INTEGER THEN 'nearly_full'
    ELSE 'open'
  END as capacity_status,
  CASE 
    WHEN e.max_participants IS NULL THEN NULL
    ELSE (e.max_participants - COUNT(er.id)::INTEGER)
  END as available_spots
FROM public.schedule_events e
LEFT JOIN public.event_registrations er ON e.id = er.event_id
GROUP BY e.id, e.title, e.description, e.event_date, e.location, e.event_type, e.max_participants
ORDER BY e.event_date, e.title;

-- Grant access to view
GRANT SELECT ON public.event_capacity_view TO authenticated;

-- =====================================================
-- CHAPTER REGISTRATIONS VIEW
-- Shows registration summary by chapter
-- =====================================================
CREATE OR REPLACE VIEW public.chapter_registration_stats AS
SELECT 
  c.id as chapter_id,
  c.name as chapter_name,
  COUNT(DISTINCT u.id) as total_participants,
  COUNT(DISTINCT er.id) as total_registrations,
  COUNT(DISTINCT er.event_id) as events_registered,
  MAX(er.created_at) as last_registration_date
FROM public.chapters c
LEFT JOIN public.users u ON c.id = u.chapter_id AND u.role = 'Attendee'
LEFT JOIN public.event_registrations er ON u.id = er.user_id
GROUP BY c.id, c.name
ORDER BY total_registrations DESC;

-- Grant access to view
GRANT SELECT ON public.chapter_registration_stats TO authenticated;

-- =====================================================
-- EVENT REGISTRATIONS WITH USER DETAILS VIEW
-- Detailed view for admin reports
-- =====================================================
CREATE OR REPLACE VIEW public.event_registrations_detailed AS
SELECT 
  er.id as registration_id,
  er.created_at as registered_at,
  e.id as event_id,
  e.title as event_title,
  e.event_type,
  e.event_date,
  u.id as user_id,
  u.full_name as user_name,
  u.email as user_email,
  c.id as chapter_id,
  c.name as chapter_name
FROM public.event_registrations er
JOIN public.schedule_events e ON er.event_id = e.id
JOIN public.users u ON er.user_id = u.id
LEFT JOIN public.chapters c ON u.chapter_id = c.id
ORDER BY er.created_at DESC;

-- Grant access to view
GRANT SELECT ON public.event_registrations_detailed TO authenticated;

-- =====================================================
-- RLS POLICIES FOR EVENT_REGISTRATIONS
-- =====================================================

-- Enable RLS if not already enabled
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean migration)
DROP POLICY IF EXISTS "Users can view all event registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Chapter Leaders can manage their chapter's registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Admins can manage all registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Users can view their own registrations" ON public.event_registrations;

-- Policy 1: Everyone can view all registrations (read-only for transparency)
CREATE POLICY "Users can view all event registrations" 
ON public.event_registrations
FOR SELECT
TO authenticated
USING (true);

-- Policy 2: Chapter Leaders can insert/update/delete for their chapter participants
CREATE POLICY "Chapter Leaders can manage their chapter's registrations" 
ON public.event_registrations
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND u.role = 'Chapter Leader'
    AND u.chapter_id = (
      SELECT chapter_id FROM public.users WHERE id = event_registrations.user_id
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND u.role = 'Chapter Leader'
    AND u.chapter_id = (
      SELECT chapter_id FROM public.users WHERE id = event_registrations.user_id
    )
  )
);

-- Policy 3: Admins can manage all registrations
CREATE POLICY "Admins can manage all registrations" 
ON public.event_registrations
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'Admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'Admin'
  )
);

-- Policy 4: Users can view their own registrations
CREATE POLICY "Users can view their own registrations" 
ON public.event_registrations
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- =====================================================
-- FUNCTIONS FOR REGISTRATION LOGIC
-- =====================================================

-- Function to check if event has available capacity
CREATE OR REPLACE FUNCTION public.check_event_capacity(p_event_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_max_participants INTEGER;
  v_current_count INTEGER;
BEGIN
  -- Get event max participants
  SELECT max_participants INTO v_max_participants
  FROM public.schedule_events
  WHERE id = p_event_id;
  
  -- If no limit, always return true
  IF v_max_participants IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Count current registrations
  SELECT COUNT(*) INTO v_current_count
  FROM public.event_registrations
  WHERE event_id = p_event_id;
  
  -- Check if space available
  RETURN v_current_count < v_max_participants;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.check_event_capacity(UUID) TO authenticated;

-- =====================================================
-- TRIGGER: Prevent over-capacity registrations
-- =====================================================

CREATE OR REPLACE FUNCTION public.validate_event_capacity()
RETURNS TRIGGER AS $$
DECLARE
  v_has_capacity BOOLEAN;
BEGIN
  -- Check if event has capacity
  SELECT public.check_event_capacity(NEW.event_id) INTO v_has_capacity;
  
  IF NOT v_has_capacity THEN
    RAISE EXCEPTION 'Event is at full capacity';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS check_capacity_before_insert ON public.event_registrations;
CREATE TRIGGER check_capacity_before_insert
  BEFORE INSERT ON public.event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_event_capacity();

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Add comment to track migration
COMMENT ON TABLE public.event_registrations IS 
'Event registrations with optimized indexes, views, and capacity validation (migrated 2025-10-10)';

