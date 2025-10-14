'use client'

// Public Live Feed Dashboard - Shows Announcements & Today's Schedule

import LiveFeed from '@/components/features/live-feed/LiveFeed'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-xl p-6 shadow-elevated gradient-primary">
        <h1 className="text-3xl font-bold tracking-tight text-white">📢 Live Feed</h1>
        <p className="text-blue-100">
          Latest announcements and today&apos;s schedule
        </p>
        {/* Decorative gold accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl"></div>
      </div>

      <LiveFeed />
    </div>
  )
}

