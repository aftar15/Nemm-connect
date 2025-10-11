-- ============================================================
-- NUCLEAR OPTION: Complete RLS Reset
-- This will completely remove ALL policies and rebuild from scratch
-- ============================================================

-- ============================================================
-- STEP 1: DISABLE RLS temporarily
-- ============================================================
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 2: DROP ALL EXISTING POLICIES (Including hidden ones)
-- ============================================================
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'users' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', pol.policyname);
    END LOOP;
END $$;

-- ============================================================
-- STEP 3: DROP OLD FUNCTIONS (if they exist)
-- ============================================================
DROP FUNCTION IF EXISTS private.get_user_role();
DROP FUNCTION IF EXISTS private.get_user_chapter_id();
DROP FUNCTION IF EXISTS private.is_admin();
DROP FUNCTION IF EXISTS private.is_chapter_leader();

-- ============================================================
-- STEP 4: CREATE PRIVATE SCHEMA (if doesn't exist)
-- ============================================================
CREATE SCHEMA IF NOT EXISTS private;

-- ============================================================
-- STEP 5: CREATE SECURITY DEFINER FUNCTIONS
-- ============================================================

-- Function: Check if current user is Admin
CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Get the role directly without RLS
    SELECT role INTO user_role
    FROM public.users
    WHERE id = auth.uid()
    LIMIT 1;
    
    RETURN COALESCE(user_role = 'Admin', false);
END;
$$;

-- Function: Check if current user is Chapter Leader
CREATE OR REPLACE FUNCTION private.is_chapter_leader()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM public.users
    WHERE id = auth.uid()
    LIMIT 1;
    
    RETURN COALESCE(user_role = 'Chapter Leader', false);
END;
$$;

-- Function: Get current user's chapter_id
CREATE OR REPLACE FUNCTION private.get_user_chapter_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
    user_chapter UUID;
BEGIN
    SELECT chapter_id INTO user_chapter
    FROM public.users
    WHERE id = auth.uid()
    LIMIT 1;
    
    RETURN user_chapter;
END;
$$;

-- Function: Get current user's role
CREATE OR REPLACE FUNCTION private.get_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM public.users
    WHERE id = auth.uid()
    LIMIT 1;
    
    RETURN user_role;
END;
$$;

-- ============================================================
-- STEP 6: GRANT PERMISSIONS
-- ============================================================
GRANT USAGE ON SCHEMA private TO authenticated, anon;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION private.is_chapter_leader() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION private.get_user_chapter_id() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION private.get_user_role() TO authenticated, anon;

-- ============================================================
-- STEP 7: RE-ENABLE RLS
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 8: CREATE SIMPLE, NON-RECURSIVE POLICIES
-- ============================================================

-- Policy 1: Users can ALWAYS view their OWN profile (no function calls)
CREATE POLICY "users_select_own" 
ON public.users
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Admins can view ALL users
CREATE POLICY "admins_select_all" 
ON public.users
FOR SELECT 
TO authenticated
USING (private.is_admin());

-- Policy 3: Chapter Leaders can view their chapter members
CREATE POLICY "chapter_leaders_select_chapter" 
ON public.users
FOR SELECT 
TO authenticated
USING (
  private.is_chapter_leader() 
  AND chapter_id = private.get_user_chapter_id()
);

-- Policy 4: Admins can do everything (INSERT/UPDATE/DELETE)
CREATE POLICY "admins_all" 
ON public.users
FOR ALL
TO authenticated
USING (private.is_admin())
WITH CHECK (private.is_admin());

-- Policy 5: Users can UPDATE their own profile
CREATE POLICY "users_update_own" 
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 6: Chapter Leaders can INSERT into their chapter
CREATE POLICY "chapter_leaders_insert" 
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (
  private.is_chapter_leader()
  AND chapter_id = private.get_user_chapter_id()
);

-- ============================================================
-- STEP 9: CREATE/UPDATE ADMIN PROFILE
-- ============================================================
INSERT INTO public.users (id, email, full_name, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'carlsteinborja3@gmail.com' LIMIT 1),
  'carlsteinborja3@gmail.com',
  'Admin User',
  'Admin'
)
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'Admin',
  email = 'carlsteinborja3@gmail.com',
  updated_at = NOW();

-- ============================================================
-- STEP 10: CREATE AUTO-PROFILE TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'Attendee',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- STEP 11: VERIFY EVERYTHING
-- ============================================================

-- Check functions
SELECT 
  'Functions Created' as status,
  COUNT(*) as count
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'private';

-- Check policies
SELECT 
  'Policies Created' as status,
  COUNT(*) as count
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public';

-- Check admin profile
SELECT 
  'Admin Profile' as status,
  CASE WHEN EXISTS (
    SELECT 1 FROM public.users 
    WHERE email = 'carlsteinborja3@gmail.com' AND role = 'Admin'
  ) THEN 'EXISTS' ELSE 'MISSING' END as result;

-- Check RLS status
SELECT 
  'RLS Status' as status,
  CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as result
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- List all policies
SELECT 
  policyname,
  cmd as operation,
  CASE WHEN permissive = 'PERMISSIVE' THEN 'YES' ELSE 'NO' END as permissive
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public'
ORDER BY policyname;

-- ============================================================
-- DONE! ✅
-- ============================================================
-- After running this:
-- 1. Clear browser cache
-- 2. Logout if logged in
-- 3. Try logging in again
-- 4. Should work without infinite recursion!
-- ============================================================

