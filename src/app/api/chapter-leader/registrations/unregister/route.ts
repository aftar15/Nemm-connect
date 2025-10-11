// API Route: Unregister a participant from an event (Chapter Leader only)

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(request: Request) {
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
          { error: 'You can only unregister participants from your own chapter' },
          { status: 403 }
        )
      }
    }

    // Unregister the participant
    const { error: deleteError } = await supabase
      .from('event_registrations')
      .delete()
      .eq('user_id', user_id)
      .eq('event_id', event_id)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({ 
      success: true,
      message: 'Participant unregistered successfully'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

