// API Route: Get all announcements (Public - no auth required)

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get all announcements with author info
    // Pinned announcements first, then newest first
    const { data: announcements, error: fetchError } = await supabase
      .from('announcements')
      .select(`
        *,
        author:created_by(full_name, email)
      `)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })

    if (fetchError) {
      throw fetchError
    }

    return NextResponse.json({ 
      success: true,
      announcements: announcements || []
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

