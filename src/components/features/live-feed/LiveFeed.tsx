'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Announcement } from '@/types/announcement.types'
import { Event } from '@/types/event.types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertCircle, Pin, Calendar, MapPin } from 'lucide-react'
import { formatDistanceToNow, format, isToday } from 'date-fns'

export default function LiveFeed() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [todayEvents, setTodayEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadData()

    // Real-time subscription for announcements
    const announcementChannel = supabase
      .channel('public_announcements')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements',
        },
        () => {
          loadAnnouncements()
        }
      )
      .subscribe()

    // Real-time subscription for schedule events
    const eventsChannel = supabase
      .channel('public_schedule_events')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schedule_events',
        },
        () => {
          loadTodayEvents()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(announcementChannel)
      supabase.removeChannel(eventsChannel)
    }
  }, [])

  const loadData = async () => {
    setLoading(true)
    await Promise.all([loadAnnouncements(), loadTodayEvents()])
    setLoading(false)
  }

  const loadAnnouncements = async () => {
    try {
      setError(null)

      const response = await fetch('/api/announcements')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load announcements')
      }

      setAnnouncements(result.announcements)
    } catch (err) {
      const error = err as Error
      setError(error.message || 'An error occurred')
    }
  }

  const loadTodayEvents = async () => {
    try {
      // Get today's date in YYYY-MM-DD format (local date, no timezone conversion)
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      const todayStr = `${year}-${month}-${day}`

      console.log('=== DEBUG: Today\'s Schedule ===')
      console.log('Today local date:', todayStr)
      console.log('Fetching events for:', todayStr)

      const { data, error } = await supabase
        .from('schedule_events')
        .select('*')
        .gte('event_date', `${todayStr} 00:00:00`)
        .lte('event_date', `${todayStr} 23:59:59`)
        .order('event_date', { ascending: true })

      console.log('Query result:', data)
      console.log('Query error:', error)

      if (error) throw error

      setTodayEvents(data || [])
    } catch (err) {
      console.error('Error loading events:', err)
    }
  }

  const pinnedAnnouncements = announcements.filter(a => a.is_pinned)
  const regularAnnouncements = announcements.filter(a => !a.is_pinned)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-destructive font-medium">{error}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Main Content - Announcements (2 columns) */}
      <div className="space-y-6 md:col-span-2">
        {/* Pinned Announcements */}
        {pinnedAnnouncements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pin className="h-5 w-5" />
                Pinned Announcements
              </CardTitle>
              <CardDescription>Important updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pinnedAnnouncements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="rounded-lg border-2 border-primary bg-primary/5 p-4"
                >
                  <div className="flex items-start gap-2">
                    <Pin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{announcement.title}</h3>
                      {announcement.content && (
                        <p className="text-muted-foreground mt-2 whitespace-pre-wrap">
                          {announcement.content}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Regular Announcements */}
        <Card>
          <CardHeader>
            <CardTitle>📰 Recent Announcements</CardTitle>
            <CardDescription>Latest updates and information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {regularAnnouncements.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No announcements yet. Check back later!
              </p>
            ) : (
              regularAnnouncements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="rounded-lg border p-4"
                >
                  <h3 className="font-semibold">{announcement.title}</h3>
                  {announcement.content && (
                    <p className="text-muted-foreground mt-2 whitespace-pre-wrap">
                      {announcement.content}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - Today's Schedule (1 column) */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today&apos;s Schedule
            </CardTitle>
            <CardDescription>{format(new Date(), 'MMMM d, yyyy')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayEvents.length === 0 ? (
              <p className="text-center text-muted-foreground py-4 text-sm">
                No events scheduled for today
              </p>
            ) : (
              todayEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-lg border p-3 space-y-2"
                >
                  <Badge variant="secondary">{event.event_type}</Badge>
                  <h4 className="font-semibold text-sm">{event.title}</h4>
                  {event.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(event.event_date), 'h:mm a')}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
