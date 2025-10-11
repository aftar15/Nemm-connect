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
import { Loader2 } from 'lucide-react'

interface ChapterSummary {
  chapter_id: string
  chapter_name: string
  participant_count: number
  registration_count: number
}

export default function ChapterRegistrationSummary() {
  const [summary, setSummary] = useState<ChapterSummary[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true)
      try {
        // Get all chapters with their participant counts and registrations
        const { data: chapters } = await supabase
          .from('chapters')
          .select('id, name')
          .order('name', { ascending: true })

        if (!chapters) return

        const summaryData = await Promise.all(
          chapters.map(async (chapter) => {
            // Count participants in chapter
            const { count: participantCount } = await supabase
              .from('users')
              .select('id', { count: 'exact', head: true })
              .eq('chapter_id', chapter.id)

            // Count registrations for participants in this chapter
            const { data: participants } = await supabase
              .from('users')
              .select('id')
              .eq('chapter_id', chapter.id)

            const participantIds = participants?.map(p => p.id) || []

            const { count: registrationCount } = await supabase
              .from('event_registrations')
              .select('id', { count: 'exact', head: true })
              .in('user_id', participantIds)

            return {
              chapter_id: chapter.id,
              chapter_name: chapter.name,
              participant_count: participantCount || 0,
              registration_count: registrationCount || 0,
            }
          })
        )

        setSummary(summaryData)
      } catch (error) {
        console.error('Error fetching chapter summary:', error)
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
        No chapters found.
      </p>
    )
  }

  const totalParticipants = summary.reduce((sum, s) => sum + s.participant_count, 0)
  const totalRegistrations = summary.reduce((sum, s) => sum + s.registration_count, 0)

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Chapter</TableHead>
          <TableHead className="text-right">Participants</TableHead>
          <TableHead className="text-right">Registrations</TableHead>
          <TableHead className="text-right">Avg per Participant</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {summary.map((chapter) => (
          <TableRow key={chapter.chapter_id}>
            <TableCell className="font-medium">{chapter.chapter_name}</TableCell>
            <TableCell className="text-right">{chapter.participant_count}</TableCell>
            <TableCell className="text-right">
              <Badge variant="secondary">{chapter.registration_count}</Badge>
            </TableCell>
            <TableCell className="text-right">
              {chapter.participant_count > 0
                ? (chapter.registration_count / chapter.participant_count).toFixed(1)
                : '0.0'}
            </TableCell>
          </TableRow>
        ))}
        <TableRow className="font-bold bg-muted/50">
          <TableCell>Total</TableCell>
          <TableCell className="text-right">{totalParticipants}</TableCell>
          <TableCell className="text-right">
            <Badge>{totalRegistrations}</Badge>
          </TableCell>
          <TableCell className="text-right">
            {totalParticipants > 0
              ? (totalRegistrations / totalParticipants).toFixed(1)
              : '0.0'}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

