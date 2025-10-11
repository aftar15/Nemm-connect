-- =====================================================
-- QR Code Attendance System Migration
-- =====================================================
-- This migration creates the attendance tracking system
-- with QR code check-ins and manual override capability

-- Create attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES public.schedule_events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  check_in_method TEXT NOT NULL DEFAULT 'qr_scan' CHECK (check_in_method IN ('qr_scan', 'manual')),
  checked_in_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  checked_in_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  notes TEXT,
  UNIQUE(event_id, user_id)
);

-- Create index for faster queries
CREATE INDEX idx_attendance_event ON public.attendance(event_id);
CREATE INDEX idx_attendance_user ON public.attendance(user_id);
CREATE INDEX idx_attendance_checked_in_at ON public.attendance(checked_in_at);

-- Add qr_code field to schedule_events table
ALTER TABLE public.schedule_events 
ADD COLUMN IF NOT EXISTS qr_code_secret TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS qr_enabled BOOLEAN DEFAULT false;

-- Create function to generate QR code secret
CREATE OR REPLACE FUNCTION generate_qr_secret()
RETURNS TEXT AS $$
BEGIN
  RETURN 'event_' || gen_random_uuid()::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on attendance table
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS Policies for Attendance
-- =====================================================

-- Admins can view all attendance records
CREATE POLICY "Admins can view all attendance"
  ON public.attendance
  FOR SELECT
  TO authenticated
  USING (private.is_admin());

-- Users can view their own attendance
CREATE POLICY "Users can view own attendance"
  ON public.attendance
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can check themselves in via QR scan
CREATE POLICY "Users can check themselves in"
  ON public.attendance
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    check_in_method = 'qr_scan'
  );

-- Admins can perform manual check-ins
CREATE POLICY "Admins can perform manual check-ins"
  ON public.attendance
  FOR INSERT
  TO authenticated
  WITH CHECK (
    private.is_admin() AND
    check_in_method = 'manual'
  );

-- Admins can delete attendance records
CREATE POLICY "Admins can delete attendance"
  ON public.attendance
  FOR DELETE
  TO authenticated
  USING (private.is_admin());

-- =====================================================
-- Helper Views for Attendance Reporting
-- =====================================================

-- View for attendance summary by event
CREATE OR REPLACE VIEW public.attendance_summary AS
SELECT 
  e.id AS event_id,
  e.title AS event_title,
  e.event_date,
  COUNT(a.id) AS total_attendees,
  COUNT(CASE WHEN a.check_in_method = 'qr_scan' THEN 1 END) AS qr_scans,
  COUNT(CASE WHEN a.check_in_method = 'manual' THEN 1 END) AS manual_checkins,
  e.max_participants
FROM public.schedule_events e
LEFT JOIN public.attendance a ON e.id = a.event_id
GROUP BY e.id, e.title, e.event_date, e.max_participants;

-- Grant access to views
GRANT SELECT ON public.attendance_summary TO authenticated;

-- =====================================================
-- Function to validate QR code check-in
-- =====================================================

CREATE OR REPLACE FUNCTION check_in_with_qr(
  p_event_id uuid,
  p_qr_secret text
)
RETURNS jsonb AS $$
DECLARE
  v_event_record public.schedule_events%ROWTYPE;
  v_user_id uuid;
  v_existing_checkin uuid;
  v_result jsonb;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Not authenticated'
    );
  END IF;

  -- Verify QR code matches event
  SELECT * INTO v_event_record
  FROM public.schedule_events
  WHERE id = p_event_id 
    AND qr_code_secret = p_qr_secret
    AND qr_enabled = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid QR code'
    );
  END IF;

  -- Check if already checked in
  SELECT id INTO v_existing_checkin
  FROM public.attendance
  WHERE event_id = p_event_id AND user_id = v_user_id;

  IF v_existing_checkin IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Already checked in'
    );
  END IF;

  -- Perform check-in
  INSERT INTO public.attendance (
    event_id,
    user_id,
    check_in_method,
    checked_in_by
  ) VALUES (
    p_event_id,
    v_user_id,
    'qr_scan',
    v_user_id
  );

  RETURN jsonb_build_object(
    'success', true,
    'event', jsonb_build_object(
      'id', v_event_record.id,
      'title', v_event_record.title,
      'event_date', v_event_record.event_date
    )
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_in_with_qr(uuid, text) TO authenticated;

COMMENT ON TABLE public.attendance IS 'Tracks event attendance via QR code scans or manual check-ins';
COMMENT ON FUNCTION check_in_with_qr IS 'Validates QR code and performs check-in';

