'use client'

// Component: Create Competition Dialog

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CompetitionCategory, BracketType } from '@/types/competition.types'

interface CreateCompetitionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function CreateCompetitionDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateCompetitionDialogProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<CompetitionCategory | ''>('')
  const [bracketType, setBracketType] = useState<BracketType | ''>('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!name || !category || !bracketType) {
      alert('Please fill in all fields')
      return
    }

    try {
      setSubmitting(true)

      const response = await fetch('/api/admin/competitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category,
          bracket_type: bracketType
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert('✅ Competition created successfully!')
        onSuccess()
        onOpenChange(false)
        // Reset form
        setName('')
        setCategory('')
        setBracketType('')
      } else {
        alert('❌ Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error creating competition:', error)
      alert('❌ Failed to create competition')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Competition</DialogTitle>
          <DialogDescription>
            Create a new tournament or competition. You can set up the bracket and matches after creation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Competition Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Competition Name</Label>
            <Input
              id="name"
              placeholder="e.g., Basketball Tournament, Chess Championship"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as CompetitionCategory)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sports">🏀 Sports</SelectItem>
                <SelectItem value="Mind Games">🧠 Mind Games</SelectItem>
                <SelectItem value="Creative Arts">🎨 Creative Arts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bracket Type */}
          <div className="space-y-2">
            <Label htmlFor="bracket-type">Bracket Type</Label>
            <Select value={bracketType} onValueChange={(value) => setBracketType(value as BracketType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select bracket type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Single Elimination">Single Elimination</SelectItem>
                <SelectItem value="Double Elimination">Double Elimination</SelectItem>
                <SelectItem value="Round Robin">Round Robin</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Single Elimination: One loss and you're out<br />
              Double Elimination: Two losses to be eliminated<br />
              Round Robin: Everyone plays everyone
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !name || !category || !bracketType}>
            {submitting ? 'Creating...' : 'Create Competition'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

