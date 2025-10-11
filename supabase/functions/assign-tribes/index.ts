// Supabase Edge Function: Automated Tribe Assignment
// Assigns all unassigned Attendees to the 12 Tribes randomly and evenly

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Verify the user is an admin
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'Admin') {
      throw new Error('Unauthorized. Admin access required.')
    }

    // 1. Fetch all unassigned attendees
    const { data: unassignedUsers, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, full_name, email')
      .eq('role', 'Attendee')
      .is('tribe_id', null)

    if (usersError) {
      throw usersError
    }

    if (!unassignedUsers || unassignedUsers.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No unassigned participants found.',
          assigned_count: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    // 2. Fetch all tribes
    const { data: tribes, error: tribesError } = await supabaseAdmin
      .from('tribes')
      .select('id, name')
      .order('name', { ascending: true })

    if (tribesError || !tribes || tribes.length === 0) {
      throw new Error('Failed to fetch tribes')
    }

    // 3. Shuffle users randomly using Fisher-Yates algorithm
    const shuffledUsers = [...unassignedUsers]
    for (let i = shuffledUsers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledUsers[i], shuffledUsers[j]] = [shuffledUsers[j], shuffledUsers[i]]
    }

    // 4. Assign users to tribes in a round-robin fashion for even distribution
    const assignments = shuffledUsers.map((user, index) => ({
      id: user.id,
      tribe_id: tribes[index % tribes.length].id
    }))

    // 5. Perform bulk update
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .upsert(assignments, { onConflict: 'id' })

    if (updateError) {
      throw updateError
    }

    // 6. Return success response with stats
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully assigned ${assignments.length} participants to tribes.`,
        assigned_count: assignments.length,
        tribe_count: tribes.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in assign-tribes function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
