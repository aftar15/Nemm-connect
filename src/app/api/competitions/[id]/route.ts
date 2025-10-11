// API Route: Get competition with matches (Public)

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const competitionId = params.id

    // Fetch competition
    const { data: competition, error: compError } = await supabase
      .from('competition_events')
      .select('*')
      .eq('id', competitionId)
      .single()

    if (compError) {
      throw compError
    }

    // Fetch all matches with tribe details
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select(`
        *,
        tribe_1:tribe_1_id(id, name, color),
        tribe_2:tribe_2_id(id, name, color),
        winner_tribe:winner_tribe_id(id, name, color)
      `)
      .eq('competition_event_id', competitionId)
      .order('round_number', { ascending: true })
      .order('match_number', { ascending: true })

    if (matchesError) {
      throw matchesError
    }

    return NextResponse.json({
      success: true,
      competition: {
        ...competition,
        matches: matches || []
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

