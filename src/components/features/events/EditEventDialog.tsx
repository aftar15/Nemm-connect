'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { ScheduleEvent, EventType } from '@/types/event.types'

interface EditEventDialogProps {
  event: ScheduleEvent
}

export default function EditEventDialog({ event }: EditEventDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState(event.title)
  const [description, setDescription] = useState(event.description || '')
  const [eventType, setEventType] = useState<EventType>(event.event_type)
  const [eventDate, setEventDate] = useState(
    event.event_date ? event.event_date.slice(0, 16) : ''
  )
  const [maxParticipants, setMaxParticipants] = useState(event.max_participants?.toString() || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const eventTypes: EventType[] = ['Sports', 'Mind Games', 'Session', 'Plenary', 'Workshop', 'Other']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!title.trim()) {
      setError('Event name is required.')
      setIsLoading(false)
      return
    }

    try {
      // Convert datetime-local to ISO timestamp, preserving the selected date/time
      // The datetime-local input gives us a string like "2025-10-20T15:00"
      // We append seconds and treat it as is for storage
      const eventDateISO = eventDate ? `${eventDate}:00` : null

      const { error: updateError } = await supabase
        .from('schedule_events')
        .update({
          title: title.trim(),
          description: description.trim() || null,
          event_type: eventType,
          event_date: eventDateISO,
          max_participants: maxParticipants ? parseInt(maxParticipants) : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', event.id)

      if (updateError) throw updateError

      setIsOpen(false)
      router.refresh()
    } catch (err) {
      const error = err as Error
      setError(error.message || 'An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          Edit
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>
            Make changes to the event details. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Event Name *</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-event-type">Event Type *</Label>
              <Select value={eventType} onValueChange={(value) => setEventType(value as EventType)}>
                <SelectTrigger id="edit-event-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-event-date">Event Date & Time</Label>
              <Input
                id="edit-event-date"
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-max-participants">Max Participants</Label>
              <Input
                id="edit-max-participants"
                type="number"
                placeholder="Leave empty for unlimited"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                disabled={isLoading}
                min="1"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

