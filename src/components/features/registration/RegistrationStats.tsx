'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, CheckCircle, Building2, Loader2 } from 'lucide-react'

interface Stats {
  totalEvents: number
  totalParticipants: number
  totalRegistrations: number
  totalChapters: number
  averageRegistrationsPerParticipant: number
}

export default function RegistrationStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        // Fetch all data
        const [eventsResult, participantsResult, registrationsResult, chaptersResult] = await Promise.all([
          supabase.from('schedule_events').select('id', { count: 'exact', head: true }),
          supabase.from('users').select('id', { count: 'exact', head: true }),
          supabase.from('event_registrations').select('id', { count: 'exact', head: true }),
          supabase.from('chapters').select('id', { count: 'exact', head: true }),
        ])

        const totalEvents = eventsResult.count || 0
        const totalParticipants = participantsResult.count || 0
        const totalRegistrations = registrationsResult.count || 0
        const totalChapters = chaptersResult.count || 0
        const averageRegistrationsPerParticipant = 
          totalParticipants > 0 ? totalRegistrations / totalParticipants : 0

        setStats({
          totalEvents,
          totalParticipants,
          totalRegistrations,
          totalChapters,
          averageRegistrationsPerParticipant,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalEvents}</div>
          <p className="text-xs text-muted-foreground">Convention events</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalParticipants}</div>
          <p className="text-xs text-muted-foreground">All users in system</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
          <p className="text-xs text-muted-foreground">
            Avg {stats.averageRegistrationsPerParticipant.toFixed(1)} per participant
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Chapters</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalChapters}</div>
          <p className="text-xs text-muted-foreground">Registered chapters</p>
        </CardContent>
      </Card>
    </div>
  )
}

