// API Route: Manage individual competition (Admin only)

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Get competition details with matches
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

    // Fetch all matches for this competition with tribe details
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
        matches: matches || [],
        total_matches: matches?.length || 0,
        completed_matches: matches?.filter(m => m.status === 'Completed').length || 0
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

// DELETE - Delete competition
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Verify Admin role
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', currentUser.id)
      .single()

    if (profile?.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const competitionId = params.id

    // Delete competition (matches will be cascaded)
    const { error: deleteError } = await supabase
      .from('competition_events')
      .delete()
      .eq('id', competitionId)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({
      success: true,
      message: 'Competition deleted successfully'
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

