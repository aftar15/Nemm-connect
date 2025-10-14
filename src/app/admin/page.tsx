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
      {/* Enhanced Header with Blue Gradient */}
      <div className="relative overflow-hidden rounded-xl p-8 shadow-elevated gradient-primary">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold tracking-tight text-white">Admin Dashboard</h1>
          <p className="text-blue-100 text-lg mt-2">
            Manage the convention system
          </p>
        </div>
        {/* Decorative gold accent */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl"></div>
      </div>

      {/* Enhanced Quick Links Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="h-full card-enhanced hover-lift hover:shadow-prominent transition-all cursor-pointer border-0">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <link.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{link.title}</CardTitle>
                </div>
                <CardDescription className="mt-2">{link.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-primary font-medium flex items-center gap-2">
                  Manage →
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Enhanced Quick Stats Card */}
      <Card className="shadow-elevated border-0 overflow-hidden">
        <div className="bg-gradient-to-r from-accent/5 to-transparent">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-accent/20">
                <Trophy className="h-5 w-5 text-accent-dark" />
              </div>
              <div>
                <CardTitle className="text-xl">Quick Stats</CardTitle>
                <CardDescription>Convention overview</CardDescription>
              </div>
            </div>
          </CardHeader>
        </div>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-4">
            <div className="p-4 rounded-lg depth-layer-2 shadow-subtle">
              <p className="text-sm text-muted-foreground mb-1">Total Chapters</p>
              <p className="text-3xl font-bold text-primary">TBD</p>
            </div>
            <div className="p-4 rounded-lg depth-layer-2 shadow-subtle">
              <p className="text-sm text-muted-foreground mb-1">Total Participants</p>
              <p className="text-3xl font-bold text-primary">TBD</p>
            </div>
            <div className="p-4 rounded-lg depth-layer-2 shadow-subtle">
              <p className="text-sm text-muted-foreground mb-1">Tribes Assigned</p>
              <p className="text-3xl font-bold text-primary">TBD</p>
            </div>
            <div className="p-4 rounded-lg depth-layer-2 shadow-subtle">
              <p className="text-sm text-muted-foreground mb-1">Events</p>
              <p className="text-3xl font-bold text-primary">TBD</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

