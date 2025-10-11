// API Route: Get overall leaderboard (Public)

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { TribeScore } from '@/types/competition.types'

export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch all completed matches with tribe details
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select(`
        *,
        tribe_1:tribe_1_id(id, name, color),
        tribe_2:tribe_2_id(id, name, color),
        winner_tribe:winner_tribe_id(id, name, color),
        competition:competition_event_id(category)
      `)
      .eq('status', 'Completed')
      .not('winner_tribe_id', 'is', null)

    if (matchesError) {
      throw matchesError
    }

    // Fetch all tribes
    const { data: tribes, error: tribesError } = await supabase
      .from('tribes')
      .select('id, name, color')

    if (tribesError) {
      throw tribesError
    }

    // Calculate scores for each tribe
    const tribeScoresMap: Record<string, TribeScore> = {}

    // Initialize all tribes with zero scores
    tribes?.forEach(tribe => {
      tribeScoresMap[tribe.id] = {
        tribe_id: tribe.id,
        tribe_name: tribe.name,
        tribe_color: tribe.color,
        wins: 0,
        losses: 0,
        total_points: 0,
        matches_played: 0
      }
    })

    // Count wins and losses
    matches?.forEach((match: any) => {
      if (match.tribe_1_id && tribeScoresMap[match.tribe_1_id]) {
        tribeScoresMap[match.tribe_1_id].matches_played++
        tribeScoresMap[match.tribe_1_id].total_points += match.tribe_1_score || 0
        
        if (match.winner_tribe_id === match.tribe_1_id) {
          tribeScoresMap[match.tribe_1_id].wins++
        } else {
          tribeScoresMap[match.tribe_1_id].losses++
        }
      }

      if (match.tribe_2_id && tribeScoresMap[match.tribe_2_id]) {
        tribeScoresMap[match.tribe_2_id].matches_played++
        tribeScoresMap[match.tribe_2_id].total_points += match.tribe_2_score || 0
        
        if (match.winner_tribe_id === match.tribe_2_id) {
          tribeScoresMap[match.tribe_2_id].wins++
        } else {
          tribeScoresMap[match.tribe_2_id].losses++
        }
      }
    })

    // Convert to array and sort by wins (descending)
    const leaderboard = Object.values(tribeScoresMap)
      .sort((a, b) => {
        // First sort by wins
        if (b.wins !== a.wins) return b.wins - a.wins
        // Then by total points if wins are equal
        if (b.total_points !== a.total_points) return b.total_points - a.total_points
        // Then by fewer losses
        return a.losses - b.losses
      })

    return NextResponse.json({
      success: true,
      leaderboard
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

