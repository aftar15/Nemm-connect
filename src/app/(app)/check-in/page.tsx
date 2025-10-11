import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { QRScanner } from '@/components/features/attendance/QRScanner'

export default async function CheckInPage() {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Event Check-In</h1>
        <p className="text-muted-foreground">
          Scan the event QR code to check in to activities and sessions
        </p>
      </div>

      <QRScanner />

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">How to check in:</h3>
        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Click "Start Camera" to activate your device camera</li>
          <li>Point your camera at the QR code displayed at the event</li>
          <li>Wait for the scanner to detect and process the QR code</li>
          <li>You'll see a confirmation message once checked in successfully</li>
        </ol>
      </div>
    </div>
  )
}
