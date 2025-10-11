// API Route: Get all tribes (Public)

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch all tribes
    const { data: tribes, error: tribesError } = await supabase
      .from('tribes')
      .select('id, name, color, created_at')
      .order('name', { ascending: true })

    if (tribesError) {
      throw tribesError
    }

    return NextResponse.json({
      success: true,
      tribes: tribes || []
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

