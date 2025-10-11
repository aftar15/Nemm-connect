// =====================================================
// API Route: Get Attendance Records for an Event
// =====================================================

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const supabase = await createClient()
    const { eventId } = await params
    
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

    // Get attendance records with user and event details
    const { data: attendanceRecords, error: attendanceError } = await supabase
      .from('attendance')
      .select(`
        id,
        event_id,
        user_id,
        check_in_method,
        checked_in_by,
        checked_in_at,
        notes,
        user:users!attendance_user_id_fkey(
          id,
          full_name,
          email,
          chapter:chapters(
            id,
            name
          )
        ),
        event:schedule_events!attendance_event_id_fkey(
          id,
          title,
          event_date
        )
      `)
      .eq('event_id', eventId)
      .order('checked_in_at', { ascending: false })

    if (attendanceError) {
      console.error('Error fetching attendance:', attendanceError)
      return NextResponse.json(
        { error: 'Failed to fetch attendance records' },
        { status: 500 }
      )
    }

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('schedule_events')
      .select('id, title, event_date, max_participants, qr_enabled')
      .eq('id', eventId)
      .single()

    if (eventError) {
      console.error('Error fetching event:', eventError)
      return NextResponse.json(
        { error: 'Failed to fetch event details' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      event,
      attendance: attendanceRecords,
      summary: {
        total_attendees: attendanceRecords.length,
        qr_scans: attendanceRecords.filter(a => a.check_in_method === 'qr_scan').length,
        manual_checkins: attendanceRecords.filter(a => a.check_in_method === 'manual').length,
        max_participants: event.max_participants
      }
    })

  } catch (error: any) {
    console.error('Get attendance error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

