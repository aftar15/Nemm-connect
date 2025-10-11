// API Route: Automated tribe assignment (Direct implementation - no Edge Function needed)

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST() {
  try {
    console.log('🚀 Tribe assignment API called')
    console.log('🔑 Environment check:', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    })

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

    // 1. Fetch all unassigned attendees
    console.log('🔍 Fetching unassigned users...')
    const { data: unassignedUsers, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, full_name, email')
      .eq('role', 'Attendee')
      .is('tribe_id', null)

    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
      throw usersError
    }

    console.log('✅ Found', unassignedUsers?.length || 0, 'unassigned users')

    if (!unassignedUsers || unassignedUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No unassigned participants found.',
        assigned_count: 0
      })
    }

    // 2. Fetch all tribes
    console.log('🔍 Fetching tribes...')
    const { data: tribes, error: tribesError } = await supabaseAdmin
      .from('tribes')
      .select('id, name')
      .order('name', { ascending: true })

    if (tribesError) {
      console.error('❌ Error fetching tribes:', tribesError)
      throw tribesError
    }

    if (!tribes || tribes.length === 0) {
      console.error('❌ No tribes found in database')
      throw new Error('No tribes found in database. Please run the initial migration.')
    }

    console.log('✅ Found', tribes.length, 'tribes')

    // 3. Shuffle users randomly using Fisher-Yates algorithm
    const shuffledUsers = [...unassignedUsers]
    for (let i = shuffledUsers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledUsers[i], shuffledUsers[j]] = [shuffledUsers[j], shuffledUsers[i]]
    }

    // 4. Assign users to tribes in a round-robin fashion for even distribution
    const assignments = shuffledUsers.map((user, index) => ({
      user_id: user.id,
      tribe_id: tribes[index % tribes.length].id
    }))

    // 5. Perform batch update using admin client to bypass RLS
    console.log('🔄 Updating', assignments.length, 'user assignments...')
    
    // Update each user's tribe_id individually
    const updatePromises = assignments.map(async ({ user_id, tribe_id }) => {
      const { error } = await supabaseAdmin
        .from('users')
        .update({ tribe_id })
        .eq('id', user_id)
      
      if (error) {
        console.error(`❌ Error updating user ${user_id}:`, error)
        throw error
      }
    })

    // Wait for all updates to complete
    await Promise.all(updatePromises)

    console.log('✅ Successfully assigned all users')

    // 6. Return success response with stats
    return NextResponse.json({
      success: true,
      message: `Successfully assigned ${assignments.length} participants to ${tribes.length} tribes.`,
      assigned_count: assignments.length,
      tribe_count: tribes.length
    })

  } catch (error) {
    console.error('❌ CRITICAL ERROR in tribe assignment:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

