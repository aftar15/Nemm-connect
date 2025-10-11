// API Route: Get user profile after login
// This runs server-side and bypasses client RLS issues

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Fetch user profile - this runs with server privileges
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, email, full_name, role, chapter_id, tribe_id')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json(
        { 
          error: 'Profile not found',
          message: 'Your account exists but profile setup is incomplete. Please contact an administrator.',
          details: profileError
        },
        { status: 404 }
      )
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

