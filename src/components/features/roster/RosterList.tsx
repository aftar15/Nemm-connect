'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@/types/user.types'
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
import { Input } from '@/components/ui/input'
import { MoreHorizontal, Search } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import EditParticipantDialog from './EditParticipantDialog'
import DeleteParticipantDialog from './DeleteParticipantDialog'

export default function RosterList() {
  const [participants, setParticipants] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const fetchParticipants = async () => {
      setLoading(true)

      // Get current user's chapter
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Not authenticated')
        setLoading(false)
        return
      }

      const { data: currentUserProfile } = await supabase
        .from('users')
        .select('chapter_id, role')
        .eq('id', user.id)
        .single()

      if (!currentUserProfile || !currentUserProfile.chapter_id) {
        setError('You are not assigned to a chapter')
        setLoading(false)
        return
      }

      // Fetch participants in the same chapter
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('chapter_id', currentUserProfile.chapter_id)
        .order('full_name', { ascending: true })

      if (fetchError) {
        setError(fetchError.message)
        setParticipants([])
      } else {
        setParticipants(data || [])
        setError(null)
      }
      setLoading(false)
    }

    fetchParticipants()

    // Set up real-time subscription
    const channel = supabase
      .channel('public:users')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        () => {
          fetchParticipants()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  if (loading) {
    return <p className="text-center py-8">Loading participants...</p>
  }

  if (error) {
    return <p className="text-center text-red-500 py-8">Error: {error}</p>
  }

  // Filter participants
  const filteredParticipants = participants.filter(participant =>
    participant.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredParticipants.length} of {participants.length} participants
      </p>

      {/* Participants table */}
      {filteredParticipants.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          {searchTerm ? 'No participants found matching your search.' : 'No participants in your chapter yet.'}
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Tribe</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredParticipants.map((participant) => (
              <TableRow key={participant.id}>
                <TableCell className="font-medium">
                  {participant.full_name || 'N/A'}
                </TableCell>
                <TableCell>{participant.email}</TableCell>
                <TableCell>
                  <Badge variant={participant.role === 'Chapter Leader' ? 'default' : 'outline'}>
                    {participant.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {participant.tribe_id ? (
                    <Badge variant="secondary">Assigned</Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">Not assigned</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <EditParticipantDialog participant={participant} />
                      {participant.role !== 'Chapter Leader' && (
                        <DeleteParticipantDialog participant={participant} />
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

