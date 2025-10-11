// Admin Dashboard

import Link from 'next/link'
import { Users, MessageSquare, Calendar, Trophy, QrCode, Building2 } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AdminPage() {
  const quickLinks = [
    {
      title: 'Chapters',
      description: 'Manage chapters',
      href: '/admin/chapters',
      icon: Building2,
    },
    {
      title: 'Events',
      description: 'Manage convention events',
      href: '/admin/events',
      icon: Calendar,
    },
    {
      title: 'Users',
      description: 'Manage all users',
      href: '/admin/users',
      icon: Users,
    },
    {
      title: 'Registration',
      description: 'View event registrations',
      href: '/admin/registration',
      icon: Users,
    },
    {
      title: 'Announcements',
      description: 'Post updates and info',
      href: '/admin/announcements',
      icon: MessageSquare,
    },
    {
      title: 'Tribes',
      description: 'Assign tribes',
      href: '/admin/tribes',
      icon: Users,
    },
    {
      title: 'Results',
      description: 'Manage competitions & brackets',
      href: '/admin/results',
      icon: Trophy,
    },
    {
      title: 'Attendance',
      description: 'QR codes & reports',
      href: '/admin/attendance',
      icon: QrCode,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage the convention system
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
          <CardDescription>Convention overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Chapters</p>
              <p className="text-2xl font-bold">TBD</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Participants</p>
              <p className="text-2xl font-bold">TBD</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tribe Assigned</p>
              <p className="text-2xl font-bold">TBD</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Events</p>
              <p className="text-2xl font-bold">TBD</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

