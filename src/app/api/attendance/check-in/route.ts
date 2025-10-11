// =====================================================
// API Route: QR Code Check-In
// =====================================================

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { QRCheckInResponse } from '@/types/attendance.types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json<QRCheckInResponse>(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get event_id and secret from request body
    const { event_id, secret } = await request.json()

    if (!event_id || !secret) {
      return NextResponse.json<QRCheckInResponse>(
        { success: false, error: 'Event ID and secret are required' },
        { status: 400 }
      )
    }

    // Call the check_in_with_qr database function
    const { data, error } = await supabase
      .rpc('check_in_with_qr', {
        p_event_id: event_id,
        p_qr_secret: secret
      })

    if (error) {
      console.error('QR check-in error:', error)
      return NextResponse.json<QRCheckInResponse>(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // The function returns a JSON object
    const result = data as QRCheckInResponse

    if (!result.success) {
      return NextResponse.json<QRCheckInResponse>(
        result,
        { status: 400 }
      )
    }

    return NextResponse.json<QRCheckInResponse>(result)

  } catch (error: any) {
    console.error('QR check-in error:', error)
    return NextResponse.json<QRCheckInResponse>(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

