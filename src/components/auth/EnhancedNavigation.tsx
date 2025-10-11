'use client'

// Enhanced Mobile-Responsive Navigation with Blue/Gold Theme
// Following UI Enhancement Principles: Depth Layering & Shadow System

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { 
  Calendar, 
  Trophy, 
  Users, 
  MapPin, 
  QrCode, 
  Home,
  Menu,
  X,
  Book
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'

interface NavItem {
  href: string
  label: string
  icon: any
}

interface EnhancedNavigationProps {
  user: {
    id: string
    full_name: string
    email: string
    role: string
  }
}

export function EnhancedNavigation({ user }: EnhancedNavigationProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/results', label: 'Results', icon: Trophy },
    { href: '/my-tribe', label: 'My Tribe', icon: Users },
    { href: '/directory', label: 'Directory', icon: Book },
    { href: '/venue', label: 'Venue', icon: MapPin },
    { href: '/check-in', label: 'Check-In', icon: QrCode },
  ]

  // Add role-specific navigation
  const roleNavItems: NavItem[] = []
  if (user.role === 'Admin') {
    roleNavItems.push({ href: '/admin', label: 'Admin', icon: Calendar })
  } else if (user.role === 'Chapter Leader') {
    roleNavItems.push({ href: '/chapter-leader', label: 'My Chapter', icon: Users })
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      {/* Desktop & Mobile Header */}
      <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-md shadow-elevated">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-lg gradient-primary shadow-elevated flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                NeMM Connect
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    nav-link flex items-center gap-2
                    ${isActive(item.href) 
                      ? 'bg-primary text-primary-foreground shadow-elevated' 
                      : 'text-foreground hover:bg-secondary/50'}
                  `}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {roleNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    nav-link flex items-center gap-2
                    ${isActive(item.href)
                      ? 'bg-accent text-accent-foreground shadow-gold'
                      : 'bg-accent/10 text-accent-foreground hover:bg-accent/20'}
                  `}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg gradient-primary shadow-elevated flex items-center justify-center">
                      <span className="text-white font-bold text-lg">N</span>
                    </div>
                    <span>NeMM Connect</span>
                  </SheetTitle>
                </SheetHeader>
                
                <div className="mt-8 space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                        ${isActive(item.href)
                          ? 'bg-primary text-primary-foreground shadow-elevated'
                          : 'hover:bg-secondary/50'}
                      `}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ))}
                  
                  {roleNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                        ${isActive(item.href)
                          ? 'bg-accent text-accent-foreground shadow-gold'
                          : 'bg-accent/10 hover:bg-accent/20'}
                      `}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t">
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">{user.full_name}</p>
                    <p className="mt-1">{user.email}</p>
                    <p className="mt-1 text-xs">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                        {user.role}
                      </span>
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 backdrop-blur-md shadow-[0_-4px_16px_-4px_hsl(217_91%_20%/0.15)]">
        <div className="grid grid-cols-5 gap-1 p-2">
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all
                ${isActive(item.href)
                  ? 'bg-primary text-primary-foreground shadow-subtle'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'}
              `}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Navigation Spacer - Prevent content from being hidden */}
      <div className="md:hidden h-20" />
    </>
  )
}

