-- =====================================================
-- Committee Directory Migration
-- =====================================================
-- This migration creates the committee directory system
-- for displaying key committee heads and their roles

-- Create committee_members table
CREATE TABLE IF NOT EXISTS public.committee_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  position TEXT NOT NULL,
  committee TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  photo_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create index for faster queries
CREATE INDEX idx_committee_members_committee ON public.committee_members(committee);
CREATE INDEX idx_committee_members_display_order ON public.committee_members(display_order);
CREATE INDEX idx_committee_members_visible ON public.committee_members(is_visible);

-- Enable RLS
ALTER TABLE public.committee_members ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS Policies for Committee Members
-- =====================================================

-- Everyone can view visible committee members
CREATE POLICY "Anyone can view visible committee members"
  ON public.committee_members
  FOR SELECT
  TO authenticated
  USING (is_visible = true);

-- Admins can manage all committee members
CREATE POLICY "Admins can manage committee members"
  ON public.committee_members
  FOR ALL
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- =====================================================
-- Venue Information Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.venue_info (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('General', 'Parade Route', 'Emergency', 'Facilities', 'Transportation')),
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create index
CREATE INDEX idx_venue_info_category ON public.venue_info(category);
CREATE INDEX idx_venue_info_display_order ON public.venue_info(display_order);
CREATE INDEX idx_venue_info_visible ON public.venue_info(is_visible);

-- Enable RLS
ALTER TABLE public.venue_info ENABLE ROW LEVEL SECURITY;

-- Everyone can view visible venue info
CREATE POLICY "Anyone can view visible venue info"
  ON public.venue_info
  FOR SELECT
  TO authenticated
  USING (is_visible = true);

-- Admins can manage venue info
CREATE POLICY "Admins can manage venue info"
  ON public.venue_info
  FOR ALL
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- =====================================================
-- Seed Data for Committee Members (Examples)
-- =====================================================

INSERT INTO public.committee_members (full_name, position, committee, email, display_order, is_visible)
VALUES
  ('To Be Announced', 'Chairperson', 'Overall Convention', 'tba@nemm.org', 1, true),
  ('To Be Announced', 'Head', 'Sports Committee', 'sports@nemm.org', 2, true),
  ('To Be Announced', 'Head', 'Security Committee', 'security@nemm.org', 3, true),
  ('To Be Announced', 'Head', 'Medical Responders', 'medical@nemm.org', 4, true),
  ('To Be Announced', 'Head', 'Program Committee', 'program@nemm.org', 5, true),
  ('To Be Announced', 'Head', 'Registration Committee', 'registration@nemm.org', 6, true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- Seed Data for Venue Info (Examples)
-- =====================================================

INSERT INTO public.venue_info (title, content, category, icon, display_order, is_visible)
VALUES
  (
    'Convention Venue',
    'The NeMM Convention will be held at [Venue Name]. The venue features multiple halls, outdoor spaces, and facilities to accommodate all convention activities.',
    'General',
    'building',
    1,
    true
  ),
  (
    'Parade Route',
    'The parade will start at [Starting Point] and proceed through [Route Details]. Please gather at the assembly area by [Time].',
    'Parade Route',
    'route',
    2,
    true
  ),
  (
    'Emergency Contacts',
    'In case of emergency, contact:\n• Medical Team: [Phone]\n• Security: [Phone]\n• Convention Hotline: [Phone]',
    'Emergency',
    'phone',
    3,
    true
  ),
  (
    'Restroom Facilities',
    'Restrooms are located at [Locations]. Additional portable facilities are available near the outdoor areas.',
    'Facilities',
    'bath',
    4,
    true
  ),
  (
    'Transportation',
    'Shuttle services will be available from [Pickup Points] starting at [Time]. Please wear your convention ID for identification.',
    'Transportation',
    'bus',
    5,
    true
  )
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.committee_members IS 'Directory of key committee heads and their contact information';
COMMENT ON TABLE public.venue_info IS 'Venue logistics and information for attendees';

