// API Route: Get tribe details with members

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const tribeId = params.id

    // Fetch tribe details
    const { data: tribe, error: tribeError } = await supabase
      .from('tribes')
      .select('id, name, color, created_at')
      .eq('id', tribeId)
      .single()

    if (tribeError) {
      throw tribeError
    }

    // Fetch tribe members with chapter info
    const { data: members, error: membersError } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        email,
        chapter_id,
        chapter:chapter_id(name)
      `)
      .eq('tribe_id', tribeId)
      .eq('role', 'Attendee')
      .order('full_name', { ascending: true })

    if (membersError) {
      throw membersError
    }

    // Transform the data to include chapter_name
    const transformedMembers = (members || []).map((member: any) => ({
      id: member.id,
      full_name: member.full_name,
      email: member.email,
      chapter_id: member.chapter_id,
      chapter_name: member.chapter?.name || null
    }))

    return NextResponse.json({
      success: true,
      tribe: {
        ...tribe,
        members: transformedMembers,
        memberCount: transformedMembers.length
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

