// API Route: Manage matches for a competition

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// POST - Create matches (seed bracket)
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
    const { matches } = await request.json()

    if (!matches || !Array.isArray(matches) || matches.length === 0) {
      return NextResponse.json(
        { error: 'Matches array is required' },
        { status: 400 }
      )
    }

    // Insert all matches
    const { data: createdMatches, error: insertError } = await supabaseAdmin
      .from('matches')
      .insert(
        matches.map((match: any) => ({
          competition_event_id: competitionId,
          round_number: match.round_number,
          match_number: match.match_number,
          tribe_1_id: match.tribe_1_id || null,
          tribe_2_id: match.tribe_2_id || null,
          scheduled_time: match.scheduled_time || null,
          status: 'Scheduled'
        }))
      )
      .select()

    if (insertError) {
      throw insertError
    }

    return NextResponse.json({
      success: true,
      matches: createdMatches,
      message: `${createdMatches?.length || 0} matches created successfully`
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

