'use client'

// Delete Chapter Dialog Component

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { createClient } from '@/lib/supabase/client'

interface Chapter {
  id: string
  name: string
  created_at: string
  updated_at: string
}

interface DeleteChapterDialogProps {
  chapter: Chapter
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function DeleteChapterDialog({
  chapter,
  open,
  onOpenChange,
}: DeleteChapterDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleDelete = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { error: deleteError } = await supabase
        .from('chapters')
        .delete()
        .eq('id', chapter.id)

      if (deleteError) throw deleteError

      // Success
      onOpenChange(false)
      router.refresh()
    } catch (err) {
      const error = err as Error
      setError(error.message || 'Failed to delete chapter')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Chapter</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{chapter.name}&quot;? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete Chapter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

