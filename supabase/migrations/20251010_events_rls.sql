-- ============================================================
-- Events and Registrations RLS Policies
-- ============================================================

-- ============================================================
-- SCHEDULE_EVENTS POLICIES
-- ============================================================

-- Everyone can view events
CREATE POLICY "Anyone can view events" 
ON public.schedule_events 
FOR SELECT 
TO authenticated
USING (true);

-- Admins can manage all events
CREATE POLICY "Admins can manage events" 
ON public.schedule_events 
FOR ALL 
TO authenticated
USING (private.is_admin())
WITH CHECK (private.is_admin());

-- ============================================================
-- EVENT_REGISTRATIONS POLICIES
-- ============================================================

-- Users can view their own registrations
CREATE POLICY "Users can view own registrations" 
ON public.event_registrations 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Admins can view all registrations
CREATE POLICY "Admins can view all registrations" 
ON public.event_registrations 
FOR SELECT 
TO authenticated
USING (private.is_admin());

-- Chapter Leaders can view their chapter's registrations
CREATE POLICY "Chapter Leaders can view chapter registrations" 
ON public.event_registrations 
FOR SELECT 
TO authenticated
USING (
  private.is_chapter_leader()
  AND user_id IN (
    SELECT id FROM public.users 
    WHERE chapter_id = private.get_user_chapter_id()
  )
);

-- Chapter Leaders can register their chapter members
CREATE POLICY "Chapter Leaders can register members" 
ON public.event_registrations 
FOR INSERT 
TO authenticated
WITH CHECK (
  private.is_chapter_leader()
  AND user_id IN (
    SELECT id FROM public.users 
    WHERE chapter_id = private.get_user_chapter_id()
  )
);

-- Chapter Leaders can delete their chapter's registrations
CREATE POLICY "Chapter Leaders can delete chapter registrations" 
ON public.event_registrations 
FOR DELETE 
TO authenticated
USING (
  private.is_chapter_leader()
  AND user_id IN (
    SELECT id FROM public.users 
    WHERE chapter_id = private.get_user_chapter_id()
  )
);

-- Admins can manage all registrations
CREATE POLICY "Admins can manage all registrations" 
ON public.event_registrations 
FOR ALL 
TO authenticated
USING (private.is_admin())
WITH CHECK (private.is_admin());

