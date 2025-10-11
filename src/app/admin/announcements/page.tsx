'use client'

// Admin - Announcement Management Page

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import CreateAnnouncementDialog from '@/components/features/announcements/CreateAnnouncementDialog'
import AnnouncementList from '@/components/features/announcements/AnnouncementList'

export default function AdminAnnouncementsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Announcement Management</h1>
          <p className="text-muted-foreground">
            Post updates and important information for all participants
          </p>
        </div>
        <CreateAnnouncementDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Announcements</CardTitle>
          <CardDescription>
            Pinned announcements appear first. Changes are visible to all users instantly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnnouncementList />
        </CardContent>
      </Card>
    </div>
  )
}

