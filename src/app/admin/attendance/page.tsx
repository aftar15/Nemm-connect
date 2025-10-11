import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AttendanceDashboard } from '@/components/features/attendance/AttendanceDashboard'

export default async function AttendancePage() {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'Admin') {
    redirect('/dashboard')
  }

  // Fetch all events
  const { data: events } = await supabase
    .from('schedule_events')
    .select('*')
    .order('event_date', { ascending: false })

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Attendance Management</h1>
        <p className="text-muted-foreground">
          Generate QR codes, track check-ins, and view attendance reports
        </p>
      </div>

      <AttendanceDashboard events={events || []} />
    </div>
  )
}
