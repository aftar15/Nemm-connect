// =====================================================
// API Route: Get Tribe Members (Admin)
// =====================================================

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tribeId: string }> }
) {
  try {
    const supabase = await createClient()
    const { tribeId } = await params
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Fetch all members of the specified tribe
    const { data: members, error: membersError } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        email,
        role,
        chapter:chapters(
          id,
          name
        )
      `)
      .eq('tribe_id', tribeId)
      .order('full_name')

    if (membersError) {
      console.error('Error fetching tribe members:', membersError)
      return NextResponse.json(
        { error: 'Failed to fetch tribe members' },
        { status: 500 }
      )
    }

    // Get tribe details
    const { data: tribe, error: tribeError } = await supabase
      .from('tribes')
      .select('id, name, color, symbol, meaning')
      .eq('id', tribeId)
      .single()

    if (tribeError) {
      console.error('Error fetching tribe details:', tribeError)
      return NextResponse.json(
        { error: 'Failed to fetch tribe details' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      tribe,
      members: members || []
    })

  } catch (error: any) {
    console.error('Get tribe members error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

