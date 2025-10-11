'use client'

import { useState, useEffect } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { UserRole } from '@/types/user.types'

interface Chapter {
  id: string
  name: string
}

export default function CreateUserDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<UserRole>('Attendee')
  const [chapterId, setChapterId] = useState<string>('')
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<{ email: string; password: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const roles: UserRole[] = ['Admin', 'Chapter Leader', 'Committee Head', 'Attendee']

  // Fetch chapters
  useEffect(() => {
    const fetchChapters = async () => {
      const { data } = await supabase
        .from('chapters')
        .select('id, name')
        .order('name', { ascending: true })
      
      setChapters(data || [])
    }

    if (isOpen) {
      fetchChapters()
    }
  }, [isOpen, supabase])

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
      // Call API route to create user
      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          full_name: fullName.trim(),
          role,
          chapter_id: chapterId || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user')
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

  const needsChapter = role === 'Chapter Leader' || role === 'Attendee'

  const handleClose = () => {
    setIsOpen(false)
    // Reset form after closing
    setTimeout(() => {
      setEmail('')
      setFullName('')
      setRole('Attendee')
      setChapterId('')
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
          <PlusCircle className="mr-2 h-4 w-4" /> Create User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        {successData ? (
          // Success view with password
          <>
            <DialogHeader>
              <DialogTitle>✅ User Created Successfully!</DialogTitle>
              <DialogDescription>
                Share these credentials with the user. They should change their password after first login.
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
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system. You&apos;ll receive a temporary password to share with them.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="full-name">Full Name *</Label>
              <Input
                id="full-name"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(r => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {needsChapter && (
              <div className="grid gap-2">
                <Label htmlFor="chapter">
                  Chapter {role === 'Chapter Leader' ? '*' : '(Optional)'}
                </Label>
                <Select value={chapterId || 'none'} onValueChange={(val) => setChapterId(val === 'none' ? '' : val)}>
                  <SelectTrigger id="chapter">
                    <SelectValue placeholder="Select chapter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {chapters.map(chapter => (
                      <SelectItem key={chapter.id} value={chapter.id}>
                        {chapter.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {role === 'Chapter Leader' && !chapterId && (
                  <p className="text-sm text-muted-foreground">
                    Chapter Leaders must be assigned to a chapter.
                  </p>
                )}
              </div>
            )}

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || (role === 'Chapter Leader' && !chapterId)}>
              {isLoading ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

