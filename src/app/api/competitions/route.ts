// API Route: Get all competitions (Public)

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch all competitions with match counts
    const { data: competitions, error: compsError } = await supabase
      .from('competition_events')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (compsError) {
      throw compsError
    }

    return NextResponse.json({
      success: true,
      competitions: competitions || []
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

