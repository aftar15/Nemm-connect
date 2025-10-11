// API Route: Manually assign a user to a tribe

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

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

    // Get request data
    const { user_id, tribe_id } = await request.json()

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // If tribe_id is null or 'none', unassign the user
    const tribeIdValue = (!tribe_id || tribe_id === 'none') ? null : tribe_id

    // Update user's tribe assignment using admin client to bypass RLS
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ tribe_id: tribeIdValue })
      .eq('id', user_id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      message: tribeIdValue 
        ? 'User assigned to tribe successfully' 
        : 'User removed from tribe successfully'
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

