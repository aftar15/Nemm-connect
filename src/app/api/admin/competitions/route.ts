// API Route: Manage competitions (Admin only)

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Get all competitions
export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch all competitions with match counts
    const { data: competitions, error: compsError } = await supabase
      .from('competition_events')
      .select('*')
      .order('created_at', { ascending: false })

    if (compsError) {
      throw compsError
    }

    // Get match counts for each competition
    const competitionsWithCounts = await Promise.all(
      (competitions || []).map(async (comp) => {
        const { count: totalMatches } = await supabase
          .from('matches')
          .select('*', { count: 'exact', head: true })
          .eq('competition_event_id', comp.id)

        const { count: completedMatches } = await supabase
          .from('matches')
          .select('*', { count: 'exact', head: true })
          .eq('competition_event_id', comp.id)
          .eq('status', 'Completed')

        return {
          ...comp,
          total_matches: totalMatches || 0,
          completed_matches: completedMatches || 0
        }
      })
    )

    return NextResponse.json({
      success: true,
      competitions: competitionsWithCounts
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new competition
export async function POST(request: Request) {
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

    // Get competition data
    const { name, category, bracket_type } = await request.json()

    if (!name || !category || !bracket_type) {
      return NextResponse.json(
        { error: 'Name, category, and bracket type are required' },
        { status: 400 }
      )
    }

    // Create competition
    const { data: competition, error: createError } = await supabase
      .from('competition_events')
      .insert({
        name: name.trim(),
        category,
        bracket_type
      })
      .select()
      .single()

    if (createError) {
      throw createError
    }

    return NextResponse.json({
      success: true,
      competition,
      message: 'Competition created successfully'
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

