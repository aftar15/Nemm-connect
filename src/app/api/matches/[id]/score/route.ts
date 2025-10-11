// API Route: Update match score (Admin or Committee Head)

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(
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

    // Verify Admin or Committee Head role
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', currentUser.id)
      .single()

    if (!profile || !['Admin', 'Committee Head'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin or Committee Head access required.' },
        { status: 403 }
      )
    }

    const matchId = params.id
    const { tribe_1_score, tribe_2_score, status } = await request.json()

    // Validate scores
    if (tribe_1_score === null || tribe_1_score === undefined || 
        tribe_2_score === null || tribe_2_score === undefined) {
      return NextResponse.json(
        { error: 'Both scores are required' },
        { status: 400 }
      )
    }

    // Get match details to determine winner
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single()

    if (matchError || !match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }

    // Determine winner
    let winnerTribeId = null
    if (tribe_1_score > tribe_2_score) {
      winnerTribeId = match.tribe_1_id
    } else if (tribe_2_score > tribe_1_score) {
      winnerTribeId = match.tribe_2_id
    }
    // If equal scores, winner remains null (tie)

    // Update match with scores and winner
    const updateData: any = {
      tribe_1_score,
      tribe_2_score,
      winner_tribe_id: winnerTribeId,
      status: status || 'Completed'
    }

    // Set completed_at if status is Completed
    if (updateData.status === 'Completed') {
      updateData.completed_at = new Date().toISOString()
    }

    const { data: updatedMatch, error: updateError } = await supabaseAdmin
      .from('matches')
      .update(updateData)
      .eq('id', matchId)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      match: updatedMatch,
      message: 'Score updated successfully'
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

