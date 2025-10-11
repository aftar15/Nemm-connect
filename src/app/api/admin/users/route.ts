// API Route: Get all users (Admin only)

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify Admin role
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', currentUser.id)
      .single()

    if (profile?.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    // Fetch all users with their chapter and tribe info
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        role,
        chapter_id,
        tribe_id,
        created_at,
        chapter:chapter_id(id, name),
        tribe:tribe_id(id, name, color)
      `)
      .order('created_at', { ascending: false })

    if (usersError) {
      throw usersError
    }

    // Transform the data to flatten nested objects
    const transformedUsers = (users || []).map((user: any) => ({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      chapter_id: user.chapter_id,
      tribe_id: user.tribe_id,
      created_at: user.created_at,
      chapter_name: user.chapter?.name || null,
      tribe_name: user.tribe?.name || null,
      tribe_color: user.tribe?.color || null,
    }))

    return NextResponse.json({
      success: true,
      users: transformedUsers
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

