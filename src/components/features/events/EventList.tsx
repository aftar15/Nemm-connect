'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ScheduleEvent } from '@/types/event.types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import EditEventDialog from './EditEventDialog'
import DeleteEventDialog from './DeleteEventDialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

export default function EventList() {
  const [events, setEvents] = useState<ScheduleEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const supabase = createClient()

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('schedule_events')
        .select('*')
        .order('event_date', { ascending: true })

      if (fetchError) {
        setError(fetchError.message)
        setEvents([])
      } else {
        setEvents(data || [])
        setError(null)
      }
      setLoading(false)
    }

    fetchEvents()

    // Set up real-time subscription
    const channel = supabase
      .channel('public:schedule_events')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'schedule_events' },
        () => {
          fetchEvents() // Re-fetch events on any change
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  if (loading) {
    return <p className="text-center py-8">Loading events...</p>
  }

  if (error) {
    return <p className="text-center text-red-500 py-8">Error: {error}</p>
  }

  if (events.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No events created yet.</p>
  }

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(event => event.event_type === filter)

  const eventTypes = ['all', ...Array.from(new Set(events.map(e => e.event_type)))]

  return (
    <div className="space-y-4">
      <Tabs value={filter} onValueChange={setFilter} className="w-full">
        <TabsList>
          {eventTypes.map(type => (
            <TabsTrigger key={type} value={type} className="capitalize">
              {type}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Max Participants</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEvents.map((event) => (
            <TableRow key={event.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{event.title}</p>
                  {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {event.description}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{event.event_type}</Badge>
              </TableCell>
              <TableCell>
                {event.event_date 
                  ? new Date(event.event_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'TBD'}
              </TableCell>
              <TableCell>{event.max_participants || 'Unlimited'}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <EditEventDialog event={event} />
                    <DeleteEventDialog event={event} />
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

