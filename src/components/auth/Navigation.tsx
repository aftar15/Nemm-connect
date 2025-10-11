// Navigation Component - Main navigation for authenticated users

import Link from 'next/link'
import { Calendar, Trophy, Users, MapPin, QrCode, Home } from 'lucide-react'

import UserMenu from '@/components/auth/UserMenu'

import { getCurrentUser } from '@/lib/auth'

export default async function Navigation() {
  const user = await getCurrentUser()

  if (!user) return null

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/results', label: 'Results', icon: Trophy },
    { href: '/my-tribe', label: 'My Tribe', icon: Users },
    { href: '/directory', label: 'Directory', icon: MapPin },
    { href: '/check-in', label: 'Check-In', icon: QrCode },
  ]

  // Add role-specific navigation
  const roleNavItems = []
  if (user.role === 'Admin') {
    roleNavItems.push({ href: '/admin', label: 'Admin', icon: Calendar })
  } else if (user.role === 'Chapter Leader') {
    roleNavItems.push({ href: '/chapter-leader', label: 'My Chapter', icon: Users })
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="text-lg font-bold">
              NeMM Connect
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
            {roleNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 rounded-md text-sm font-medium bg-primary/10 hover:bg-primary/20 transition-colors flex items-center gap-2"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <UserMenu user={user} />
          </div>
        </div>
      </div>
    </nav>
  )
}

