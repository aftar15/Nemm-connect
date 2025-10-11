// API Route: Create a new user (Admin only)

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check if user is admin
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify admin or chapter leader role
    const { data: profile } = await supabase
      .from('users')
      .select('role, chapter_id')
      .eq('id', currentUser.id)
      .single()

    const isAdmin = profile?.role === 'Admin'
    const isChapterLeader = profile?.role === 'Chapter Leader'

    if (!isAdmin && !isChapterLeader) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin or Chapter Leader access required.' },
        { status: 403 }
      )
    }

    // Get user data from request
    const { email, full_name, role, chapter_id } = await request.json()

    if (!email || !full_name || !role) {
      return NextResponse.json(
        { error: 'Email, full name, and role are required' },
        { status: 400 }
      )
    }

    // Chapter Leaders can only create Attendees
    if (isChapterLeader && role !== 'Attendee') {
      return NextResponse.json(
        { error: 'Chapter Leaders can only create Attendee accounts.' },
        { status: 403 }
      )
    }

    // Chapter Leaders can only add to their own chapter
    if (isChapterLeader && chapter_id !== profile.chapter_id) {
      return NextResponse.json(
        { error: 'Chapter Leaders can only add participants to their own chapter.' },
        { status: 403 }
      )
    }

    // Generate a temporary password
    const tempPassword = `Temp${Math.random().toString(36).slice(-8)}!`

    // Create user using Admin API (bypasses email confirmation)
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true, // ✅ Auto-confirm email (no email needed!)
      user_metadata: {
        full_name,
      },
    })

    if (createError) {
      return NextResponse.json(
        { error: createError.message },
        { status: 400 }
      )
    }

    if (!newUser.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Update the user's profile with role and chapter (using admin client to bypass RLS)
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        role,
        chapter_id: chapter_id || null,
        full_name,
      })
      .eq('id', newUser.user.id)

    if (updateError) {
      console.error('Failed to update user profile:', updateError)
      return NextResponse.json(
        { error: 'User created but failed to assign role' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      user: {
        id: newUser.user.id,
        email,
        full_name,
        role,
      },
      temporaryPassword: tempPassword  // Return password to admin
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

