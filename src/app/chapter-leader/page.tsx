// Chapter Leader Dashboard

import Link from 'next/link'
import { Users, ClipboardList } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ChapterLeaderPage() {
  const quickLinks = [
    {
      title: 'My Roster',
      description: 'Manage your chapter participants',
      href: '/chapter-leader/roster',
      icon: Users,
    },
    {
      title: 'Event Registration',
      description: 'Register participants for convention events',
      href: '/chapter-leader/register',
      icon: ClipboardList,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chapter Leader Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your chapter&apos;s delegation
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <link.icon className="h-5 w-5" />
                  <CardTitle>{link.title}</CardTitle>
                </div>
                <CardDescription>{link.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Manage
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
          <CardDescription>Your chapter overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Total Participants</p>
              <p className="text-2xl font-bold">TBD</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Registered for Events</p>
              <p className="text-2xl font-bold">TBD</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

