// Chapter Leader Roster Page - Manage Chapter Participants

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import AddParticipantDialog from '@/components/features/roster/AddParticipantDialog'
import RosterList from '@/components/features/roster/RosterList'

export default function ChapterLeaderRosterPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Chapter Roster</h1>
          <p className="text-muted-foreground">
            Manage participants in your chapter delegation.
          </p>
        </div>
        <AddParticipantDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chapter Participants</CardTitle>
          <CardDescription>
            A list of all participants registered under your chapter.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RosterList />
        </CardContent>
      </Card>
    </div>
  )
}
