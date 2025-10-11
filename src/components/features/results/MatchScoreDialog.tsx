'use client'

// Component: Match Score Submission Dialog

import { useState, useEffect } from 'react'
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
import type { MatchWithTribes } from '@/types/competition.types'

interface MatchScoreDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  match: MatchWithTribes
  onSuccess: () => void
}

export default function MatchScoreDialog({
  open,
  onOpenChange,
  match,
  onSuccess,
}: MatchScoreDialogProps) {
  const [tribe1Score, setTribe1Score] = useState<string>('')
  const [tribe2Score, setTribe2Score] = useState<string>('')
  const [status, setStatus] = useState<string>('Completed')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (match) {
      setTribe1Score(match.tribe_1_score?.toString() || '')
      setTribe2Score(match.tribe_2_score?.toString() || '')
      setStatus(match.status || 'Completed')
    }
  }, [match])

  const handleSubmit = async () => {
    const score1 = parseInt(tribe1Score)
    const score2 = parseInt(tribe2Score)

    if (isNaN(score1) || isNaN(score2)) {
      alert('Please enter valid scores')
      return
    }

    if (score1 < 0 || score2 < 0) {
      alert('Scores cannot be negative')
      return
    }

    try {
      setSubmitting(true)

      const response = await fetch(`/api/matches/${match.id}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tribe_1_score: score1,
          tribe_2_score: score2,
          status
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert('✅ Score updated successfully!')
        onSuccess()
        onOpenChange(false)
      } else {
        alert('❌ Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error updating score:', error)
      alert('❌ Failed to update score')
    } finally {
      setSubmitting(false)
    }
  }

  if (!match.tribe_1 || !match.tribe_2) {
    return null
  }

  const winner = tribe1Score && tribe2Score 
    ? parseInt(tribe1Score) > parseInt(tribe2Score) 
      ? match.tribe_1.name 
      : parseInt(tribe2Score) > parseInt(tribe1Score)
        ? match.tribe_2.name
        : 'Tie'
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Submit Match Score</DialogTitle>
          <DialogDescription>
            Enter the final scores for this match
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Tribe 1 Score */}
          <div className="space-y-2">
            <Label htmlFor="tribe1-score">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: match.tribe_1.color || '#gray' }}
                />
                {match.tribe_1.name}
              </div>
            </Label>
            <Input
              id="tribe1-score"
              type="number"
              min="0"
              placeholder="Enter score"
              value={tribe1Score}
              onChange={(e) => setTribe1Score(e.target.value)}
            />
          </div>

          {/* Tribe 2 Score */}
          <div className="space-y-2">
            <Label htmlFor="tribe2-score">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: match.tribe_2.color || '#gray' }}
                />
                {match.tribe_2.name}
              </div>
            </Label>
            <Input
              id="tribe2-score"
              type="number"
              min="0"
              placeholder="Enter score"
              value={tribe2Score}
              onChange={(e) => setTribe2Score(e.target.value)}
            />
          </div>

          {/* Winner Preview */}
          {winner && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium">
                {winner === 'Tie' ? '🤝 Match Tied' : `🏆 Winner: ${winner}`}
              </div>
            </div>
          )}

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Match Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
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
          <Button onClick={handleSubmit} disabled={submitting || !tribe1Score || !tribe2Score}>
            {submitting ? 'Submitting...' : 'Submit Score'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

