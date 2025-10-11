// Admin Events Page - Manage Convention Events

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import CreateEventDialog from '@/components/features/events/CreateEventDialog'
import EventList from '@/components/features/events/EventList'
import { PlusCircle } from 'lucide-react'

export default function AdminEventsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events Management</h1>
          <p className="text-muted-foreground">
            Create and manage convention events that participants can register for.
          </p>
        </div>
        <CreateEventDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
          <CardDescription>
            A list of all convention events including sports, mind games, and sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EventList />
        </CardContent>
      </Card>
    </div>
  )
}

