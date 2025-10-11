// Authentication Utility Functions

import { createClient } from '@/lib/supabase/server'
import type { User, UserRole } from '@/../types/user.types'

/**
 * Get the current authenticated user's profile
 * This runs on the server and includes role information
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient()
  
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !authUser) {
    return null
  }

  // Fetch user profile from database
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (profileError || !profile) {
    return null
  }

  return profile as User
}

/**
 * Get the current user's role
 */
export async function getUserRole(): Promise<UserRole | null> {
  const user = await getCurrentUser()
  return user?.role || null
}

/**
 * Check if the current user has admin privileges
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole()
  return role === 'Admin'
}

/**
 * Check if the current user is a Chapter Leader
 */
export async function isChapterLeader(): Promise<boolean> {
  const role = await getUserRole()
  return role === 'Chapter Leader'
}

/**
 * Check if the current user is a Committee Head
 */
export async function isCommitteeHead(): Promise<boolean> {
  const role = await getUserRole()
  return role === 'Committee Head'
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}

