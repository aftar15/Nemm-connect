'use client'

// Public Live Feed Dashboard - Shows Announcements & Today's Schedule

import LiveFeed from '@/components/features/live-feed/LiveFeed'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">📢 Live Feed</h1>
        <p className="text-muted-foreground">
          Latest announcements and today&apos;s schedule
        </p>
      </div>

      <LiveFeed />
    </div>
  )
}

