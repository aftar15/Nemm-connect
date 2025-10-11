// =====================================================
// API Route: Manual Check-In (Admin Only)
// =====================================================

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { ManualCheckInPayload } from '@/types/attendance.types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
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

    // Get payload from request body
    const payload: ManualCheckInPayload = await request.json()

    if (!payload.event_id || !payload.user_id) {
      return NextResponse.json(
        { error: 'Event ID and User ID are required' },
        { status: 400 }
      )
    }

    // Check if already checked in
    const { data: existing, error: existingError } = await supabase
      .from('attendance')
      .select('id')
      .eq('event_id', payload.event_id)
      .eq('user_id', payload.user_id)
      .maybeSingle()

    if (existingError) {
      console.error('Error checking existing attendance:', existingError)
      return NextResponse.json(
        { error: 'Failed to verify attendance' },
        { status: 500 }
      )
    }

    if (existing) {
      return NextResponse.json(
        { error: 'User already checked in' },
        { status: 400 }
      )
    }

    // Perform manual check-in
    const { data: attendance, error: insertError } = await supabase
      .from('attendance')
      .insert({
        event_id: payload.event_id,
        user_id: payload.user_id,
        check_in_method: 'manual',
        checked_in_by: user.id,
        notes: payload.notes || null
      })
      .select(`
        id,
        event_id,
        user_id,
        check_in_method,
        checked_in_at,
        user:users!attendance_user_id_fkey(
          id,
          full_name,
          email
        ),
        event:schedule_events!attendance_event_id_fkey(
          id,
          title,
          event_date
        )
      `)
      .single()

    if (insertError) {
      console.error('Error performing manual check-in:', insertError)
      return NextResponse.json(
        { error: 'Failed to check in user' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      attendance
    })

  } catch (error: any) {
    console.error('Manual check-in error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

