'use client'

import { useState, useEffect } from 'react'
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
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { User, UserRole } from '@/types/user.types'

interface Chapter {
  id: string
  name: string
}

interface EditUserDialogProps {
  user: User
}

export default function EditUserDialog({ user }: EditUserDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [fullName, setFullName] = useState(user.full_name || '')
  const [role, setRole] = useState<UserRole>(user.role)
  const [chapterId, setChapterId] = useState<string>(user.chapter_id || '')
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

    if (!fullName.trim()) {
      setError('Full name is required.')
      setIsLoading(false)
      return
    }

    if (role === 'Chapter Leader' && !chapterId) {
      setError('Chapter Leaders must be assigned to a chapter.')
      setIsLoading(false)
      return
    }

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: fullName.trim(),
          role,
          chapter_id: chapterId || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setIsOpen(false)
      router.refresh()
    } catch (err) {
      const error = err as Error
      setError(error.message || 'An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  const needsChapter = role === 'Chapter Leader' || role === 'Attendee'

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          Edit
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Make changes to the user&apos;s profile. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                value={user.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-full-name">Full Name *</Label>
              <Input
                id="edit-full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-role">Role *</Label>
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger id="edit-role">
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
                <Label htmlFor="edit-chapter">
                  Chapter {role === 'Chapter Leader' ? '*' : '(Optional)'}
                </Label>
                <Select value={chapterId || 'none'} onValueChange={(val) => setChapterId(val === 'none' ? '' : val)}>
                  <SelectTrigger id="edit-chapter">
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

