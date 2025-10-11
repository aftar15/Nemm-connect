// API Route: Get registration statistics (Admin only)

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    // Get overall statistics
    const { data: totalRegistrations, error: regsError } = await supabase
      .from('event_registrations')
      .select('id', { count: 'exact', head: true })

    if (regsError) throw regsError

    // Get event capacity stats
    const { data: events, error: eventsError } = await supabase
      .from('event_capacity_view')
      .select('*')
      .order('event_date', { ascending: true })

    if (eventsError) throw eventsError

    // Count events by status
    const eventsByStatus = {
      open: events?.filter(e => e.capacity_status === 'open').length || 0,
      nearly_full: events?.filter(e => e.capacity_status === 'nearly_full').length || 0,
      full: events?.filter(e => e.capacity_status === 'full').length || 0,
      unlimited: events?.filter(e => e.capacity_status === 'unlimited').length || 0,
    }

    // Get chapter stats
    const { data: chapterStats, error: chapterStatsError } = await supabase
      .from('chapter_registration_stats')
      .select('*')
      .order('total_registrations', { ascending: false })

    if (chapterStatsError) throw chapterStatsError

    // Get detailed registrations for reporting
    const { data: detailedRegistrations, error: detailedError } = await supabase
      .from('event_registrations_detailed')
      .select('*')
      .order('registered_at', { ascending: false })
      .limit(100) // Limit to recent 100 for performance

    if (detailedError) throw detailedError

    return NextResponse.json({ 
      success: true,
      data: {
        totalRegistrations: totalRegistrations || 0,
        eventsByStatus,
        events: events || [],
        chapterStats: chapterStats || [],
        recentRegistrations: detailedRegistrations || [],
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

