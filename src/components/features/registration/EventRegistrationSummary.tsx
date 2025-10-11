'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Loader2 } from 'lucide-react'

interface EventSummary {
  event_id: string
  event_title: string
  event_type: string
  max_participants: number | null
  registration_count: number
}

export default function EventRegistrationSummary() {
  const [summary, setSummary] = useState<EventSummary[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true)
      try {
        // Get all events
        const { data: events } = await supabase
          .from('schedule_events')
          .select('id, title, event_type, max_participants')
          .order('event_date', { ascending: true })

        if (!events) return

        const summaryData = await Promise.all(
          events.map(async (event) => {
            // Count registrations for this event
            const { count: registrationCount } = await supabase
              .from('event_registrations')
              .select('id', { count: 'exact', head: true })
              .eq('event_id', event.id)

            return {
              event_id: event.id,
              event_title: event.title,
              event_type: event.event_type,
              max_participants: event.max_participants,
              registration_count: registrationCount || 0,
            }
          })
        )

        setSummary(summaryData)
      } catch (error) {
        console.error('Error fetching event summary:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (summary.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No events found.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Event</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Registered</TableHead>
          <TableHead className="text-right">Max</TableHead>
          <TableHead>Capacity</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {summary.map((event) => {
          const hasMax = event.max_participants !== null
          const percentage = hasMax
            ? Math.min((event.registration_count / event.max_participants!) * 100, 100)
            : 0
          const isFull = hasMax && event.registration_count >= event.max_participants!

          return (
            <TableRow key={event.event_id}>
              <TableCell className="font-medium">{event.event_title}</TableCell>
              <TableCell>
                <Badge variant="outline">{event.event_type}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Badge variant={isFull ? 'destructive' : 'secondary'}>
                  {event.registration_count}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {hasMax ? event.max_participants : 'Unlimited'}
              </TableCell>
              <TableCell>
                {hasMax ? (
                  <div className="flex items-center gap-2">
                    <Progress value={percentage} className="w-24" />
                    <span className="text-sm text-muted-foreground">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

