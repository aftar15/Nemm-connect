'use client'

// Admin - Registration Dashboard

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Loader2, AlertCircle, Users, Calendar, TrendingUp } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Event {
  id: string
  title: string
  event_type: string
  max_participants: number | null
  current_registrations: number
  capacity_status: 'open' | 'nearly_full' | 'full' | 'unlimited'
  available_spots: number | null
}

interface ChapterStat {
  chapter_id: string
  chapter_name: string
  total_participants: number
  total_registrations: number
  events_registered: number
}

interface StatsData {
  totalRegistrations: number
  eventsByStatus: {
    open: number
    nearly_full: number
    full: number
    unlimited: number
  }
  events: Event[]
  chapterStats: ChapterStat[]
}

export default function AdminRegistrationPage() {
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/registrations/stats')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load stats')
      }

      setData(result.data)
    } catch (err) {
      const error = err as Error
      setError(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getCapacityBadge = (status: string) => {
    switch (status) {
      case 'full':
        return <Badge variant="destructive">Full</Badge>
      case 'nearly_full':
        return <Badge variant="secondary">Nearly Full</Badge>
      case 'unlimited':
        return <Badge variant="outline">Unlimited</Badge>
      default:
        return <Badge variant="default">Open</Badge>
    }
  }

  const getCapacityPercentage = (event: Event) => {
    if (!event.max_participants) return 0
    return (event.current_registrations / event.max_participants) * 100
  }

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

  if (!data) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Registration Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of event registrations across all chapters
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalRegistrations}</div>
            <p className="text-xs text-muted-foreground">
              Across all events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events Open</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.eventsByStatus.open}</div>
            <p className="text-xs text-muted-foreground">
              Available for registration
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events Full</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.eventsByStatus.full}</div>
            <p className="text-xs text-muted-foreground">
              At maximum capacity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chapters Active</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.chapterStats.filter(c => c.total_registrations > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Have registered participants
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="chapters">Chapters</TabsTrigger>
        </TabsList>

        {/* Events View */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Capacity Overview</CardTitle>
              <CardDescription>
                Registration status for all convention events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Registrations</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.events.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No events created yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{event.event_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{event.current_registrations}</span>
                            {event.max_participants && (
                              <>
                                <span className="text-muted-foreground">/</span>
                                <span className="text-muted-foreground">{event.max_participants}</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="w-48">
                          {event.max_participants ? (
                            <div className="space-y-1">
                              <Progress value={getCapacityPercentage(event)} />
                              <p className="text-xs text-muted-foreground">
                                {Math.round(getCapacityPercentage(event))}% full
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Unlimited</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {getCapacityBadge(event.capacity_status)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chapters View */}
        <TabsContent value="chapters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registration by Chapter</CardTitle>
              <CardDescription>
                Summary of registrations for each chapter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Chapter</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead>Total Registrations</TableHead>
                    <TableHead>Events Registered</TableHead>
                    <TableHead>Avg per Participant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.chapterStats.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No chapters with registrations yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.chapterStats.map((chapter) => (
                      <TableRow key={chapter.chapter_id}>
                        <TableCell className="font-medium">{chapter.chapter_name}</TableCell>
                        <TableCell>{chapter.total_participants}</TableCell>
                        <TableCell>{chapter.total_registrations}</TableCell>
                        <TableCell>{chapter.events_registered}</TableCell>
                        <TableCell>
                          {chapter.total_participants > 0
                            ? (chapter.total_registrations / chapter.total_participants).toFixed(1)
                            : '0'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
