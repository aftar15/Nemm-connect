// API Route: Register a participant for an event (Chapter Leader only)

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
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

    // Verify Chapter Leader role
    const { data: profile } = await supabase
      .from('users')
      .select('role, chapter_id')
      .eq('id', currentUser.id)
      .single()

    if (profile?.role !== 'Chapter Leader' && profile?.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Chapter Leader or Admin access required.' },
        { status: 403 }
      )
    }

    // Get request data
    const { user_id, event_id } = await request.json()

    if (!user_id || !event_id) {
      return NextResponse.json(
        { error: 'user_id and event_id are required' },
        { status: 400 }
      )
    }

    // Verify the participant belongs to the chapter leader's chapter
    if (profile.role === 'Chapter Leader') {
      const { data: participant } = await supabase
        .from('users')
        .select('chapter_id')
        .eq('id', user_id)
        .single()

      if (!participant || participant.chapter_id !== profile.chapter_id) {
        return NextResponse.json(
          { error: 'You can only register participants from your own chapter' },
          { status: 403 }
        )
      }
    }

    // Check event capacity
    const { data: capacityData } = await supabase
      .from('event_capacity_view')
      .select('capacity_status, available_spots, max_participants, current_registrations')
      .eq('id', event_id)
      .single()

    if (capacityData && capacityData.capacity_status === 'full') {
      return NextResponse.json(
        { 
          error: 'Event is at full capacity',
          capacity: capacityData
        },
        { status: 400 }
      )
    }

    // Register the participant (RLS policies + trigger will validate)
    const { data: registration, error: insertError } = await supabase
      .from('event_registrations')
      .insert({
        user_id,
        event_id,
      })
      .select()
      .single()

    if (insertError) {
      // Handle unique constraint violation (already registered)
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'Participant is already registered for this event' },
          { status: 400 }
        )
      }

      // Handle capacity trigger error
      if (insertError.message.includes('full capacity')) {
        return NextResponse.json(
          { error: 'Event is at full capacity' },
          { status: 400 }
        )
      }

      throw insertError
    }

    return NextResponse.json({ 
      success: true,
      registration,
      message: 'Participant registered successfully'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

