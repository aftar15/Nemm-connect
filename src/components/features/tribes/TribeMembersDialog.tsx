'use client'

// Tribe Members Dialog - Shows all members of a selected tribe

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Loader2, Mail, Building2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface TribeMember {
  id: string
  full_name: string
  email: string
  role: string
  chapter: {
    id: string
    name: string
  } | null
}

interface Tribe {
  id: string
  name: string
  color: string | null
  symbol: string | null
  meaning: string | null
}

interface TribeMembersDialogProps {
  tribe: Tribe | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TribeMembersDialog({ tribe, open, onOpenChange }: TribeMembersDialogProps) {
  const [members, setMembers] = useState<TribeMember[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && tribe) {
      fetchMembers()
    }
  }, [open, tribe])

  const fetchMembers = async () => {
    if (!tribe) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/tribes/${tribe.id}/members`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch members')
      }

      setMembers(data.members || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!tribe) return null

  // Group members by chapter
  const membersByChapter = members.reduce((acc, member) => {
    const chapterName = member.chapter?.name || 'No Chapter'
    if (!acc[chapterName]) {
      acc[chapterName] = []
    }
    acc[chapterName].push(member)
    return acc
  }, {} as Record<string, TribeMember[]>)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {tribe.symbol && <span className="text-2xl">{tribe.symbol}</span>}
            <span>Tribe of {tribe.name}</span>
            {tribe.color && (
              <div
                className="w-4 h-4 rounded-full ml-2"
                style={{ backgroundColor: tribe.color }}
              />
            )}
          </DialogTitle>
          <DialogDescription>
            {tribe.meaning && <span>{tribe.meaning} • </span>}
            {members.length} {members.length === 1 ? 'member' : 'members'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : members.length === 0 ? (
            <Alert>
              <AlertDescription>
                No members assigned to this tribe yet.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              {Object.entries(membersByChapter).map(([chapterName, chapterMembers]) => (
                <div key={chapterName}>
                  <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {chapterName} ({chapterMembers.length})
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {chapterMembers.map((member) => (
                      <div
                        key={member.id}
                        className="p-3 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="font-medium">{member.full_name}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{member.email}</span>
                        </div>
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            {member.role}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

