// App Layout - For authenticated users with Enhanced UI

import { EnhancedNavigation } from '@/components/auth/EnhancedNavigation'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen depth-layer-1">
      <EnhancedNavigation user={user} />
      <main className="container mx-auto px-4 py-6 md:pb-6 pb-24">
        {children}
      </main>
    </div>
  )
}

