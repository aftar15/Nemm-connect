// =====================================================
// API Route: Generate QR Code for Event (Admin Only)
// =====================================================

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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

    // Get event_id from request body
    const { event_id } = await request.json()

    if (!event_id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    // Generate QR code secret
    const { data: secretData, error: secretError } = await supabase
      .rpc('generate_qr_secret')

    if (secretError) {
      console.error('Error generating QR secret:', secretError)
      return NextResponse.json(
        { error: 'Failed to generate QR code' },
        { status: 500 }
      )
    }

    // Update event with QR code
    const { data: event, error: updateError } = await supabase
      .from('schedule_events')
      .update({
        qr_code_secret: secretData,
        qr_enabled: true
      })
      .eq('id', event_id)
      .select('id, title, event_date, qr_code_secret')
      .single()

    if (updateError) {
      console.error('Error updating event:', updateError)
      return NextResponse.json(
        { error: 'Failed to enable QR code for event' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      qr_code: {
        event_id: event.id,
        secret: event.qr_code_secret,
        title: event.title,
        event_date: event.event_date
      }
    })

  } catch (error: any) {
    console.error('Generate QR error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// Disable QR code for an event
export async function DELETE(request: NextRequest) {
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

    // Get event_id from query params
    const { searchParams } = new URL(request.url)
    const event_id = searchParams.get('event_id')

    if (!event_id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    // Disable QR code for event
    const { error: updateError } = await supabase
      .from('schedule_events')
      .update({
        qr_enabled: false
      })
      .eq('id', event_id)

    if (updateError) {
      console.error('Error disabling QR:', updateError)
      return NextResponse.json(
        { error: 'Failed to disable QR code' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'QR code disabled'
    })

  } catch (error: any) {
    console.error('Disable QR error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

