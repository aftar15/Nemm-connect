'use client'

// Chapter Members Dialog - View Chapter Leader and Members

import { useEffect, useState } from 'react'
import { Users, Crown, User } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ChapterMember {
  id: string
  full_name: string
  email: string
  role: string
  tribe?: {
    id: string
    name: string
    color: string
  } | null
}

interface Chapter {
  id: string
  name: string
  created_at: string
  leader: ChapterMember | null
  attendees: ChapterMember[]
  totalMembers: number
  attendeeCount: number
}

interface ChapterMembersDialogProps {
  chapterId: string | null
  chapterName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ChapterMembersDialog({
  chapterId,
  chapterName,
  open,
  onOpenChange,
}: ChapterMembersDialogProps) {
  const [chapterData, setChapterData] = useState<Chapter | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && chapterId) {
      fetchChapterMembers()
    }
  }, [open, chapterId])

  const fetchChapterMembers = async () => {
    if (!chapterId) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/chapters/${chapterId}/members`)
      const data = await response.json()
      
      if (data.success) {
        setChapterData(data.chapter)
      } else {
        console.error('Failed to fetch chapter members:', data.error)
      }
    } catch (error) {
      console.error('Error fetching chapter members:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {chapterName}
          </DialogTitle>
          <DialogDescription>
            Chapter leader and members
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading chapter members...
          </div>
        ) : !chapterData ? (
          <div className="py-8 text-center text-muted-foreground">
            No data available
          </div>
        ) : (
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Total Members</p>
                  <p className="text-2xl font-bold">{chapterData.totalMembers}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Attendees</p>
                  <p className="text-2xl font-bold">{chapterData.attendeeCount}</p>
                </div>
              </div>

              {/* Chapter Leader */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <Crown className="h-4 w-4 text-yellow-600" />
                  Chapter Leader
                </h3>
                {chapterData.leader ? (
                  <div className="rounded-lg border bg-yellow-50/50 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{chapterData.leader.full_name}</p>
                        <p className="text-sm text-muted-foreground">{chapterData.leader.email}</p>
                        {chapterData.leader.tribe && (
                          <Badge 
                            variant="outline" 
                            className="mt-2"
                            style={{ 
                              borderColor: chapterData.leader.tribe.color,
                              color: chapterData.leader.tribe.color 
                            }}
                          >
                            {chapterData.leader.tribe.name}
                          </Badge>
                        )}
                      </div>
                      <Badge variant="secondary">Leader</Badge>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                    No chapter leader assigned
                  </div>
                )}
              </div>

              {/* Attendees */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <User className="h-4 w-4" />
                  Attendees ({chapterData.attendeeCount})
                </h3>
                {chapterData.attendees.length > 0 ? (
                  <div className="space-y-2">
                    {chapterData.attendees.map((member) => (
                      <div
                        key={member.id}
                        className="rounded-lg border p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{member.full_name}</p>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                          </div>
                          {member.tribe && (
                            <Badge 
                              variant="outline"
                              style={{ 
                                borderColor: member.tribe.color,
                                color: member.tribe.color 
                              }}
                            >
                              {member.tribe.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                    No attendees in this chapter yet
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}

