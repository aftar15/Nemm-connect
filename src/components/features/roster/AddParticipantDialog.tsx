'use client'

import { useState } from 'react'
import { PlusCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

export default function AddParticipantDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<{ email: string; password: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!email.trim() || !fullName.trim()) {
      setError('Email and full name are required.')
      setIsLoading(false)
      return
    }

    try {
      // Get current user's chapter
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: currentUserProfile } = await supabase
        .from('users')
        .select('chapter_id')
        .eq('id', user.id)
        .single()

      if (!currentUserProfile?.chapter_id) {
        throw new Error('You are not assigned to a chapter')
      }

      // Call API route to create participant
      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          full_name: fullName.trim(),
          role: 'Attendee',
          chapter_id: currentUserProfile.chapter_id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create participant')
      }

      // Show success with password
      setSuccessData({
        email: email.trim(),
        password: data.temporaryPassword
      })
    } catch (err) {
      const error = err as Error
      setError(error.message || 'An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    // Reset form after closing
    setTimeout(() => {
      setEmail('')
      setFullName('')
      setError(null)
      setSuccessData(null)
      router.refresh()
    }, 300)
  }

  const copyPassword = () => {
    if (successData?.password) {
      navigator.clipboard.writeText(successData.password)
      alert('Password copied to clipboard!')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Participant
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        {successData ? (
          // Success view with password
          <>
            <DialogHeader>
              <DialogTitle>✅ Participant Added Successfully!</DialogTitle>
              <DialogDescription>
                Share these credentials with the participant. They should change their password after first login.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-lg font-mono">{successData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Temporary Password</p>
                    <p className="text-lg font-mono font-bold text-primary">{successData.password}</p>
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️ <strong>Important:</strong> Save this password! It won&apos;t be shown again.
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={copyPassword} className="w-full sm:w-auto">
                📋 Copy Password
              </Button>
              <Button onClick={handleClose} className="w-full sm:w-auto">
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          // Form view
          <>
            <DialogHeader>
              <DialogTitle>Add Participant</DialogTitle>
              <DialogDescription>
                Add a new participant to your chapter. You&apos;ll receive a temporary password to share with them.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="participant-email">Email *</Label>
              <Input
                id="participant-email"
                type="email"
                placeholder="participant@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="participant-name">Full Name *</Label>
              <Input
                id="participant-name"
                placeholder="Juan Dela Cruz"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Participant'}
            </Button>
          </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

