'use client'

// Chapter Leader - Event Registration Matrix Page

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import RegistrationMatrix from '@/components/features/registration/RegistrationMatrix'

export default function ChapterLeaderRegisterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Event Registration</h1>
        <p className="text-muted-foreground">
          Register your chapter participants for convention events
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registration Matrix</CardTitle>
          <CardDescription>
            Check the boxes to register participants for events. Changes are saved automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegistrationMatrix />
        </CardContent>
      </Card>
    </div>
  )
}
