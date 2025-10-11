// =====================================================
// API Route: Get Current User's Tribe Information
// =====================================================

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's profile with tribe information
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        email,
        tribe_id,
        tribe:tribes(
          id,
          name,
          color,
          symbol,
          meaning,
          created_at
        ),
        chapter:chapters(
          id,
          name
        )
      `)
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    // If user has no tribe assigned
    if (!profile.tribe_id) {
      return NextResponse.json({
        user: profile,
        tribe: null,
        members: []
      })
    }

    // Get all members of the same tribe
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
      .eq('tribe_id', profile.tribe_id)
      .order('full_name')

    if (membersError) {
      console.error('Error fetching tribe members:', membersError)
      return NextResponse.json(
        { error: 'Failed to fetch tribe members' },
        { status: 500 }
      )
    }

    // Privacy: Remove emails from other members (keep only user's own email)
    const sanitizedMembers = members?.map(member => {
      if (member.id !== user.id) {
        // Remove email for other members
        const { email, ...memberWithoutEmail } = member
        return memberWithoutEmail
      }
      return member // Keep email for own profile
    }) || []

    return NextResponse.json({
      user: profile,
      tribe: profile.tribe,
      members: sanitizedMembers
    })

  } catch (error: any) {
    console.error('Get my tribe error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

