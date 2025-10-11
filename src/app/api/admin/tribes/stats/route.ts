// API Route: Get tribe assignment statistics

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { TribeAssignmentStats } from '@/types/tribe.types'

export async function GET() {
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

    // Get total attendees count
    const { count: totalCount, error: totalError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'Attendee')

    if (totalError) {
      throw totalError
    }

    // Get assigned attendees count
    const { count: assignedCount, error: assignedError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'Attendee')
      .not('tribe_id', 'is', null)

    if (assignedError) {
      throw assignedError
    }

    // Get all tribes with member counts
    const { data: tribes, error: tribesError } = await supabase
      .from('tribes')
      .select(`
        id,
        name,
        color
      `)
      .order('name', { ascending: true })

    if (tribesError) {
      throw tribesError
    }

    // Get member count for each tribe
    const tribesWithCounts = await Promise.all(
      (tribes || []).map(async (tribe) => {
        const { count, error: countError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('tribe_id', tribe.id)
          .eq('role', 'Attendee')

        if (countError) {
          console.error(`Error counting members for tribe ${tribe.name}:`, countError)
        }

        return {
          id: tribe.id,
          name: tribe.name,
          color: tribe.color,
          member_count: count || 0
        }
      })
    )

    const stats: TribeAssignmentStats = {
      total_participants: totalCount || 0,
      assigned_participants: assignedCount || 0,
      unassigned_participants: (totalCount || 0) - (assignedCount || 0),
      tribes: tribesWithCounts
    }

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

