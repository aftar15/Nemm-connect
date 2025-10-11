'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Announcement } from '@/types/announcement.types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pin, PinOff, Edit, Trash2, Loader2, AlertCircle } from 'lucide-react'
import EditAnnouncementDialog from './EditAnnouncementDialog'
import DeleteAnnouncementDialog from './DeleteAnnouncementDialog'
import { formatDistanceToNow } from 'date-fns'

export default function AnnouncementList() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [togglingPin, setTogglingPin] = useState<Record<string, boolean>>({})
  const supabase = createClient()

  useEffect(() => {
    loadAnnouncements()

    // Set up real-time subscription
    const channel = supabase
      .channel('announcements_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements',
        },
        (payload) => {
          console.log('Announcement changed:', payload)
          loadAnnouncements() // Reload all announcements
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadAnnouncements = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/announcements')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load announcements')
      }

      setAnnouncements(result.announcements)
    } catch (err) {
      const error = err as Error
      setError(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const togglePin = async (id: string) => {
    setTogglingPin(prev => ({ ...prev, [id]: true }))
    
    try {
      const response = await fetch(`/api/admin/announcements/${id}/pin`, {
        method: 'PATCH',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to toggle pin')
      }

      // Update local state optimistically
      setAnnouncements(prev => 
        prev.map(a => 
          a.id === id ? { ...a, is_pinned: result.announcement.is_pinned } : a
        ).sort((a, b) => {
          // Sort: pinned first, then by date
          if (a.is_pinned && !b.is_pinned) return -1
          if (!a.is_pinned && b.is_pinned) return 1
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
      )
    } catch (err) {
      const error = err as Error
      alert(`Error: ${error.message}`)
    } finally {
      setTogglingPin(prev => {
        const newState = { ...prev }
        delete newState[id]
        return newState
      })
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
        <Button onClick={loadAnnouncements}>Retry</Button>
      </div>
    )
  }

  if (announcements.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No announcements yet.</p>
        <p className="text-sm mt-2">Click &quot;Create Announcement&quot; to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {announcements.map((announcement) => (
        <div
          key={announcement.id}
          className={`rounded-lg border p-4 ${
            announcement.is_pinned
              ? 'border-primary bg-primary/5'
              : 'border-border'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                {announcement.is_pinned && (
                  <Badge variant="default" className="gap-1">
                    <Pin className="h-3 w-3" />
                    Pinned
                  </Badge>
                )}
                <h3 className="text-lg font-semibold">{announcement.title}</h3>
              </div>
              
              {announcement.content && (
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {announcement.content}
                </p>
              )}
              
              <p className="text-xs text-muted-foreground">
                Posted {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => togglePin(announcement.id)}
                disabled={togglingPin[announcement.id]}
                title={announcement.is_pinned ? 'Unpin' : 'Pin'}
              >
                {togglingPin[announcement.id] ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : announcement.is_pinned ? (
                  <PinOff className="h-4 w-4" />
                ) : (
                  <Pin className="h-4 w-4" />
                )}
              </Button>
              
              <EditAnnouncementDialog
                announcement={announcement}
                onSuccess={loadAnnouncements}
              />
              
              <DeleteAnnouncementDialog
                announcement={announcement}
                onSuccess={loadAnnouncements}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

