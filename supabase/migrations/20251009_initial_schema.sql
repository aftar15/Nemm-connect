-- NeMM Convention Connect - Initial Database Schema
-- Created: 2025-10-09

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CHAPTERS TABLE
-- =====================================================
CREATE TABLE public.chapters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =====================================================
-- TRIBES TABLE (12 Tribes of Israel)
-- =====================================================
CREATE TABLE public.tribes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Insert the 12 Tribes
INSERT INTO public.tribes (name, color) VALUES
  ('Reuben', '#FF6B6B'),
  ('Simeon', '#4ECDC4'),
  ('Levi', '#45B7D1'),
  ('Judah', '#FFA07A'),
  ('Dan', '#98D8C8'),
  ('Naphtali', '#F7B731'),
  ('Gad', '#5F27CD'),
  ('Asher', '#00D2D3'),
  ('Issachar', '#FF6348'),
  ('Zebulun', '#1DD1A1'),
  ('Joseph', '#F368E0'),
  ('Benjamin', '#FD79A8');

-- =====================================================
-- USERS TABLE (extends Supabase Auth)
-- =====================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'Attendee' NOT NULL CHECK (role IN ('Admin', 'Chapter Leader', 'Committee Head', 'Attendee')),
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  tribe_id UUID REFERENCES public.tribes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =====================================================
-- SCHEDULE EVENTS TABLE
-- =====================================================
CREATE TABLE public.schedule_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ,
  location TEXT,
  event_type TEXT CHECK (event_type IN ('Plenary', 'Sports', 'Mind Games', 'Workshop', 'Devotional', 'Meals', 'Other')),
  max_participants INTEGER,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =====================================================
-- ANNOUNCEMENTS TABLE
-- =====================================================
CREATE TABLE public.announcements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =====================================================
-- EVENT REGISTRATIONS TABLE
-- =====================================================
CREATE TABLE public.event_registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES public.schedule_events(id) ON DELETE CASCADE NOT NULL,
  registered_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, event_id)
);

-- =====================================================
-- ATTENDANCE TABLE (QR Code Check-ins)
-- =====================================================
CREATE TABLE public.attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES public.schedule_events(id) ON DELETE CASCADE NOT NULL,
  checked_in_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  check_in_method TEXT DEFAULT 'QR Code' CHECK (check_in_method IN ('QR Code', 'Manual')),
  UNIQUE(user_id, event_id)
);

-- =====================================================
-- RESULTS/BRACKETS TABLE
-- =====================================================
CREATE TABLE public.competition_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('Sports', 'Mind Games', 'Creative Arts')),
  bracket_type TEXT CHECK (bracket_type IN ('Single Elimination', 'Double Elimination', 'Round Robin')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  competition_event_id UUID REFERENCES public.competition_events(id) ON DELETE CASCADE NOT NULL,
  round_number INTEGER NOT NULL,
  match_number INTEGER NOT NULL,
  tribe_1_id UUID REFERENCES public.tribes(id) ON DELETE SET NULL,
  tribe_2_id UUID REFERENCES public.tribes(id) ON DELETE SET NULL,
  tribe_1_score INTEGER,
  tribe_2_score INTEGER,
  winner_tribe_id UUID REFERENCES public.tribes(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'In Progress', 'Completed')),
  scheduled_time TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tribes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CHAPTERS POLICIES
-- =====================================================
-- Everyone can view chapters
CREATE POLICY "Anyone can view chapters" ON public.chapters
  FOR SELECT USING (true);

-- Only admins can insert/update chapters
CREATE POLICY "Only admins can manage chapters" ON public.chapters
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- =====================================================
-- TRIBES POLICIES
-- =====================================================
-- Everyone can view tribes
CREATE POLICY "Anyone can view tribes" ON public.tribes
  FOR SELECT USING (true);

-- =====================================================
-- SECURITY DEFINER HELPER FUNCTIONS
-- =====================================================
-- These functions run with creator's privileges, bypassing RLS
-- This prevents infinite recursion when policies check user roles

CREATE SCHEMA IF NOT EXISTS private;

-- Get current user's role
CREATE OR REPLACE FUNCTION private.get_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1);
END;
$$;

-- Get current user's chapter_id
CREATE OR REPLACE FUNCTION private.get_user_chapter_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT chapter_id FROM public.users WHERE id = auth.uid() LIMIT 1);
END;
$$;

-- Check if current user is Admin
CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT role = 'Admin' FROM public.users WHERE id = auth.uid() LIMIT 1);
END;
$$;

-- Check if current user is Chapter Leader
CREATE OR REPLACE FUNCTION private.is_chapter_leader()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT role = 'Chapter Leader' FROM public.users WHERE id = auth.uid() LIMIT 1);
END;
$$;

-- Grant permissions
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION private.get_user_chapter_id() TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_chapter_leader() TO authenticated;

-- =====================================================
-- USERS POLICIES (Using Security Definer - No Recursion!)
-- =====================================================
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT 
  TO authenticated
  USING ((SELECT private.is_admin()) = true);

-- Chapter Leaders can view users in their chapter
CREATE POLICY "Chapter Leaders can view chapter members" ON public.users
  FOR SELECT 
  TO authenticated
  USING (
    (SELECT private.is_chapter_leader()) = true
    AND chapter_id = (SELECT private.get_user_chapter_id())
  );

-- Admins can manage all users
CREATE POLICY "Admins can manage users" ON public.users
  FOR ALL 
  TO authenticated
  USING ((SELECT private.is_admin()) = true)
  WITH CHECK ((SELECT private.is_admin()) = true);

-- Chapter Leaders can insert users into their chapter
CREATE POLICY "Chapter Leaders can add members" ON public.users
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    (SELECT private.is_chapter_leader()) = true
    AND chapter_id = (SELECT private.get_user_chapter_id())
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- SCHEDULE EVENTS POLICIES
-- =====================================================
-- Everyone can view schedule events
CREATE POLICY "Anyone can view schedule" ON public.schedule_events
  FOR SELECT USING (true);

-- Only admins can manage schedule events
CREATE POLICY "Only admins can manage schedule" ON public.schedule_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- =====================================================
-- ANNOUNCEMENTS POLICIES
-- =====================================================
-- Everyone can view announcements
CREATE POLICY "Anyone can view announcements" ON public.announcements
  FOR SELECT USING (true);

-- Only admins can manage announcements
CREATE POLICY "Only admins can manage announcements" ON public.announcements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- =====================================================
-- EVENT REGISTRATIONS POLICIES
-- =====================================================
-- Users can view their own registrations
CREATE POLICY "Users can view own registrations" ON public.event_registrations
  FOR SELECT USING (auth.uid() = user_id);

-- Admins and Chapter Leaders can view registrations
CREATE POLICY "Leaders can view registrations" ON public.event_registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users AS u
      WHERE u.id = auth.uid() 
      AND (
        u.role = 'Admin' 
        OR (u.role = 'Chapter Leader' AND u.chapter_id IN (
          SELECT chapter_id FROM public.users WHERE id = event_registrations.user_id
        ))
      )
    )
  );

-- Chapter Leaders and Admins can register participants
CREATE POLICY "Leaders can register participants" ON public.event_registrations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users AS u
      WHERE u.id = auth.uid() 
      AND (u.role = 'Admin' OR u.role = 'Chapter Leader')
    )
  );

-- =====================================================
-- ATTENDANCE POLICIES
-- =====================================================
-- Users can view their own attendance
CREATE POLICY "Users can view own attendance" ON public.attendance
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all attendance
CREATE POLICY "Admins can view all attendance" ON public.attendance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- Users can check themselves in
CREATE POLICY "Users can check in" ON public.attendance
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins and Committee Heads can manually check in users
CREATE POLICY "Admins can manually check in" ON public.attendance
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('Admin', 'Committee Head')
    )
  );

-- =====================================================
-- COMPETITION & MATCHES POLICIES
-- =====================================================
-- Everyone can view competitions and matches
CREATE POLICY "Anyone can view competitions" ON public.competition_events
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view matches" ON public.matches
  FOR SELECT USING (true);

-- Only admins can create competitions
CREATE POLICY "Admins can manage competitions" ON public.competition_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- Admins and Committee Heads can update match scores
CREATE POLICY "Committee can update matches" ON public.matches
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('Admin', 'Committee Head')
    )
  );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON public.chapters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedule_events_updated_at BEFORE UPDATE ON public.schedule_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- AUTO-CREATE USER PROFILE TRIGGER
-- =====================================================
-- Automatically create a profile in public.users when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'Attendee'  -- Default role for new users
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users to create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_users_chapter ON public.users(chapter_id);
CREATE INDEX idx_users_tribe ON public.users(tribe_id);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_schedule_events_date ON public.schedule_events(event_date);
CREATE INDEX idx_announcements_created_at ON public.announcements(created_at DESC);
CREATE INDEX idx_announcements_pinned ON public.announcements(is_pinned);
CREATE INDEX idx_event_registrations_user ON public.event_registrations(user_id);
CREATE INDEX idx_event_registrations_event ON public.event_registrations(event_id);
CREATE INDEX idx_attendance_user ON public.attendance(user_id);
CREATE INDEX idx_attendance_event ON public.attendance(event_id);
CREATE INDEX idx_matches_competition ON public.matches(competition_event_id);

