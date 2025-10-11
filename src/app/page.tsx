// Home Page - Public landing page

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">NeMM Convention Connect</h1>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-4xl text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Your Digital Hub for the NeMM-wide Convention
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Streamlining event management, centralizing communication, and creating a seamless
            experience for every participant.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/login">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline">
                View Schedule
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl w-full mt-16 grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Real-Time Updates</CardTitle>
              <CardDescription>Live schedule and announcements</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Stay informed with instant notifications for schedule changes and important
                announcements.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tribe System</CardTitle>
              <CardDescription>Automated grouping and tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Automatically assigned to one of the 12 tribes with access to tribe information
                and members.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>QR Check-In</CardTitle>
              <CardDescription>Fast and accurate attendance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Quick event check-ins with QR code scanning for seamless attendance tracking.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} NeMM Convention Connect. Built for the community.</p>
        </div>
      </footer>
    </div>
  )
}
