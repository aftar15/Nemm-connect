// API Route: Toggle pin status for announcement (Admin only)

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
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

    // Get current announcement
    const { data: currentAnnouncement, error: fetchError } = await supabase
      .from('announcements')
      .select('is_pinned')
      .eq('id', params.id)
      .single()

    if (fetchError) {
      throw fetchError
    }

    // Toggle pin status
    const { data: announcement, error: updateError } = await supabase
      .from('announcements')
      .update({
        is_pinned: !currentAnnouncement.is_pinned,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ 
      success: true,
      announcement,
      message: announcement.is_pinned ? 'Announcement pinned' : 'Announcement unpinned'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

