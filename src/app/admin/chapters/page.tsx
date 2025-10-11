// Admin Chapters Management Page

import { Suspense } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

import ChapterList from '@/components/features/chapters/ChapterList'
import CreateChapterDialog from '@/components/features/chapters/CreateChapterDialog'

import { createClient } from '@/lib/supabase/server'

export default async function ChaptersPage() {
  const supabase = await createClient()

  // Fetch all chapters
  const { data: chapters, error } = await supabase
    .from('chapters')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching chapters:', error)
  }

  // Fetch count of Chapter Leaders
  const { count: leadersCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'Chapter Leader')

  // Fetch count of Attendees
  const { count: attendeesCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'Attendee')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chapter Management</h1>
          <p className="text-muted-foreground">
            Create and manage chapters for the convention
          </p>
        </div>
        <CreateChapterDialog />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Chapters</CardTitle>
            <CardDescription>Registered chapters</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{chapters?.length || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Leaders</CardTitle>
            <CardDescription>Chapter leaders assigned</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{leadersCount || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Participants</CardTitle>
            <CardDescription>Across all chapters</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{attendeesCount || 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Chapters</CardTitle>
          <CardDescription>
            View and manage all registered chapters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading chapters...</div>}>
            <ChapterList initialChapters={chapters || []} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

