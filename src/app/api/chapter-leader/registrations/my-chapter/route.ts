// API Route: Get all registrations for Chapter Leader's chapter

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

    // Get user profile and verify Chapter Leader role
    const { data: profile } = await supabase
      .from('users')
      .select('role, chapter_id')
      .eq('id', currentUser.id)
      .single()

    if (!profile || (profile.role !== 'Chapter Leader' && profile.role !== 'Admin')) {
      return NextResponse.json(
        { error: 'Unauthorized. Chapter Leader or Admin access required.' },
        { status: 403 }
      )
    }

    if (profile.role === 'Chapter Leader' && !profile.chapter_id) {
      return NextResponse.json(
        { error: 'Chapter Leader must be assigned to a chapter' },
        { status: 400 }
      )
    }

    // Get all participants from the chapter
    const { data: participants, error: participantsError } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('chapter_id', profile.chapter_id)
      .eq('role', 'Attendee')
      .order('full_name', { ascending: true })

    if (participantsError) {
      throw participantsError
    }

    // Get all events with capacity info
    const { data: events, error: eventsError } = await supabase
      .from('event_capacity_view')
      .select('*')
      .order('event_date', { ascending: true })
      .order('title', { ascending: true })

    if (eventsError) {
      throw eventsError
    }

    // Get all registrations for participants in this chapter
    const participantIds = participants?.map(p => p.id) || []
    
    let registrations = []
    if (participantIds.length > 0) {
      const { data: regs, error: regsError } = await supabase
        .from('event_registrations')
        .select('id, user_id, event_id, created_at')
        .in('user_id', participantIds)

      if (regsError) {
        throw regsError
      }

      registrations = regs || []
    }

    // Create a map for quick lookup: user_id -> Set of event_ids
    const registrationMap: Record<string, string[]> = {}
    registrations.forEach(reg => {
      if (!registrationMap[reg.user_id]) {
        registrationMap[reg.user_id] = []
      }
      registrationMap[reg.user_id].push(reg.event_id)
    })

    return NextResponse.json({ 
      success: true,
      data: {
        participants: participants || [],
        events: events || [],
        registrations,
        registrationMap,
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

