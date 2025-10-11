// =====================================================
// API Route: Get Chapter Members and Leader (Admin)
// =====================================================

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  try {
    const supabase = await createClient()
    const { chapterId } = await params
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get chapter details
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('id, name, created_at')
      .eq('id', chapterId)
      .single()

    if (chapterError) {
      console.error('Error fetching chapter:', chapterError)
      return NextResponse.json(
        { error: 'Failed to fetch chapter' },
        { status: 500 }
      )
    }

    // Fetch all members of the specified chapter (including leader)
    const { data: members, error: membersError } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        email,
        role,
        tribe:tribes(
          id,
          name,
          color
        )
      `)
      .eq('chapter_id', chapterId)
      .order('role', { ascending: true }) // Chapter Leader first
      .order('full_name')

    if (membersError) {
      console.error('Error fetching chapter members:', membersError)
      return NextResponse.json(
        { error: 'Failed to fetch chapter members' },
        { status: 500 }
      )
    }

    // Separate leader and attendees
    const leader = members?.find(m => m.role === 'Chapter Leader') || null
    const attendees = members?.filter(m => m.role === 'Attendee') || []

    return NextResponse.json({
      success: true,
      chapter: {
        ...chapter,
        leader,
        attendees,
        totalMembers: members?.length || 0,
        attendeeCount: attendees.length
      }
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

