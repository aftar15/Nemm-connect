'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, AlertCircle } from 'lucide-react'
import type { EventType } from '@/types/event.types'

interface Participant {
  id: string
  full_name: string
  email: string
}

interface Event {
  id: string
  title: string
  event_type: EventType
  event_date: string
  max_participants: number | null
  current_registrations: number
  capacity_status: 'open' | 'nearly_full' | 'full' | 'unlimited'
  available_spots: number | null
}

interface RegistrationData {
  participants: Participant[]
  events: Event[]
  registrations: Array<{ id: string; user_id: string; event_id: string; registered_at: string }>
  registrationMap: Record<string, string[]>
}

export default function RegistrationMatrix() {
  const [data, setData] = useState<RegistrationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [eventTypeFilter, setEventTypeFilter] = useState<EventType | 'all'>('all')
  const [registrationMap, setRegistrationMap] = useState<Record<string, Set<string>>>({})
  const [savingMap, setSavingMap] = useState<Record<string, boolean>>({}) // Track saving states
  const supabase = createClient()

  // Load initial data
  useEffect(() => {
    loadData()

    // Set up real-time subscription for registration changes
    const channel = supabase
      .channel('event_registrations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_registrations',
        },
        (payload) => {
          console.log('Registration changed:', payload)
          
          // Handle INSERT (new registration)
          if (payload.eventType === 'INSERT') {
            const newReg = payload.new as { id: string; user_id: string; event_id: string }
            setRegistrationMap(prev => {
              const newMap = { ...prev }
              if (!newMap[newReg.user_id]) {
                newMap[newReg.user_id] = new Set()
              }
              newMap[newReg.user_id].add(newReg.event_id)
              return newMap
            })
          }
          
          // Handle DELETE (unregistration)
          if (payload.eventType === 'DELETE') {
            const oldReg = payload.old as { id: string; user_id: string; event_id: string }
            setRegistrationMap(prev => {
              const newMap = { ...prev }
              if (newMap[oldReg.user_id]) {
                newMap[oldReg.user_id].delete(oldReg.event_id)
              }
              return newMap
            })
          }
          
          // Reload data to update event capacities
          loadData()
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/chapter-leader/registrations/my-chapter')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load data')
      }

      setData(result.data)

      // Build registration map (userId -> Set of eventIds)
      const map: Record<string, Set<string>> = {}
      result.data.participants.forEach((p: Participant) => {
        map[p.id] = new Set(result.data.registrationMap[p.id] || [])
      })
      setRegistrationMap(map)
    } catch (err) {
      const error = err as Error
      setError(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Handle checkbox change
  const handleToggle = async (userId: string, eventId: string, isCurrentlyRegistered: boolean) => {
    const key = `${userId}-${eventId}`
    
    // Optimistic update
    setRegistrationMap(prev => {
      const newMap = { ...prev }
      if (!newMap[userId]) newMap[userId] = new Set()
      
      if (isCurrentlyRegistered) {
        newMap[userId].delete(eventId)
      } else {
        newMap[userId].add(eventId)
      }
      
      return newMap
    })

    // Show saving indicator
    setSavingMap(prev => ({ ...prev, [key]: true }))

    try {
      if (isCurrentlyRegistered) {
        // Unregister
        const response = await fetch('/api/chapter-leader/registrations/unregister', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, event_id: eventId }),
        })

        if (!response.ok) {
          const result = await response.json()
          throw new Error(result.error || 'Failed to unregister')
        }
      } else {
        // Register
        const response = await fetch('/api/chapter-leader/registrations/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, event_id: eventId }),
        })

        if (!response.ok) {
          const result = await response.json()
          throw new Error(result.error || 'Failed to register')
        }
      }
    } catch (err) {
      const error = err as Error
      
      // Revert optimistic update on error
      setRegistrationMap(prev => {
        const newMap = { ...prev }
        if (isCurrentlyRegistered) {
          newMap[userId].add(eventId)
        } else {
          newMap[userId].delete(eventId)
        }
        return newMap
      })

      alert(`Error: ${error.message}`)
    } finally {
      setSavingMap(prev => {
        const newMap = { ...prev }
        delete newMap[key]
        return newMap
      })
    }
  }

  // Filter participants by search term
  const filteredParticipants = data?.participants.filter(p => 
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  // Filter events by type
  const filteredEvents = data?.events.filter(e => 
    eventTypeFilter === 'all' || e.event_type === eventTypeFilter
  ) || []

  const getCapacityBadge = (event: Event) => {
    switch (event.capacity_status) {
      case 'full':
        return <Badge variant="destructive" className="text-xs">Full</Badge>
      case 'nearly_full':
        return <Badge variant="secondary" className="text-xs">Nearly Full</Badge>
      case 'unlimited':
        return <Badge variant="outline" className="text-xs">Unlimited</Badge>
      default:
        return <Badge variant="default" className="text-xs">Open</Badge>
    }
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
        <Button onClick={loadData}>Retry</Button>
      </div>
    )
  }

  if (!data || data.participants.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No participants in your chapter yet.</p>
        <p className="text-sm mt-2">Add participants in the Roster page first.</p>
      </div>
    )
  }

  if (data.events.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No events available for registration yet.</p>
        <p className="text-sm mt-2">Events will appear here once admins create them.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search">Search Participants</Label>
          <Input
            id="search"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <Label htmlFor="eventType">Filter Events</Label>
          <Select value={eventTypeFilter} onValueChange={(value) => setEventTypeFilter(value as EventType | 'all')}>
            <SelectTrigger id="eventType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="Plenary">Plenary</SelectItem>
              <SelectItem value="Sports">Sports</SelectItem>
              <SelectItem value="Mind Games">Mind Games</SelectItem>
              <SelectItem value="Workshop">Workshop</SelectItem>
              <SelectItem value="Devotional">Devotional</SelectItem>
              <SelectItem value="Meals">Meals</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Matrix */}
      <div className="border rounded-lg overflow-auto">
        <table className="w-full">
          <thead className="bg-muted sticky top-0">
            <tr>
              <th className="text-left p-3 font-medium sticky left-0 bg-muted z-10 border-r min-w-[200px]">
                Participant
              </th>
              {filteredEvents.map(event => (
                <th key={event.id} className="text-center p-3 font-medium min-w-[150px] border-l">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold">{event.title}</div>
                    <div className="text-xs text-muted-foreground">{event.event_type}</div>
                    <div className="flex items-center justify-center gap-2">
                      {getCapacityBadge(event)}
                      {event.max_participants && (
                        <span className="text-xs text-muted-foreground">
                          {event.current_registrations}/{event.max_participants}
                        </span>
                      )}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredParticipants.map(participant => (
              <tr key={participant.id} className="border-t hover:bg-muted/50">
                <td className="p-3 sticky left-0 bg-background z-10 border-r">
                  <div>
                    <div className="font-medium">{participant.full_name || 'N/A'}</div>
                    <div className="text-xs text-muted-foreground">{participant.email}</div>
                  </div>
                </td>
                {filteredEvents.map(event => {
                  const isRegistered = registrationMap[participant.id]?.has(event.id) || false
                  const isFull = event.capacity_status === 'full' && !isRegistered
                  const key = `${participant.id}-${event.id}`
                  const isSaving = savingMap[key] || false

                  return (
                    <td key={event.id} className="p-3 text-center border-l">
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={isRegistered}
                          disabled={isFull || isSaving}
                          onCheckedChange={() => handleToggle(participant.id, event.id, isRegistered)}
                        />
                        {isSaving && (
                          <Loader2 className="ml-2 h-3 w-3 animate-spin text-muted-foreground" />
                        )}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-4 border-t">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-xs">Open</Badge>
          <span>Available for registration</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">Nearly Full</Badge>
          <span>80%+ capacity</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="text-xs">Full</Badge>
          <span>At maximum capacity</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">Unlimited</Badge>
          <span>No participant limit</span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground text-center pt-2">
        💡 Tip: Changes are saved automatically when you check or uncheck a box.
      </p>
    </div>
  )
}

