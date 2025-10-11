'use client'

// Component: Manual Tribe Assignment Dialog

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
import { Label } from '@/components/ui/label'
import type { Tribe } from '@/types/tribe.types'

interface User {
  id: string
  full_name: string | null
  email: string
  tribe_id: string | null
}

interface ManualAssignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function ManualAssignDialog({
  open,
  onOpenChange,
  onSuccess,
}: ManualAssignDialogProps) {
  const [users, setUsers] = useState<User[]>([])
  const [tribes, setTribes] = useState<Tribe[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [selectedTribeId, setSelectedTribeId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch all users
      console.log('🔍 Fetching users...')
      const usersResponse = await fetch('/api/admin/users')
      const usersData = await usersResponse.json()

      console.log('Users response:', usersData)

      if (usersData.success) {
        // Filter only attendees
        const attendees = usersData.users.filter((u: any) => u.role === 'Attendee')
        console.log('✅ Found', attendees.length, 'attendees')
        setUsers(attendees)
      } else {
        console.error('❌ Failed to fetch users:', usersData.error)
      }

      // Fetch all tribes
      console.log('🔍 Fetching tribes...')
      const tribesResponse = await fetch('/api/tribes')
      const tribesData = await tribesResponse.json()

      console.log('Tribes response:', tribesData)

      if (tribesData.success) {
        console.log('✅ Found', tribesData.tribes.length, 'tribes')
        setTribes(tribesData.tribes)
      } else {
        console.error('❌ Failed to fetch tribes:', tribesData.error)
      }
    } catch (error) {
      console.error('❌ Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedUserId) {
      alert('Please select a user')
      return
    }

    try {
      setSubmitting(true)

      const response = await fetch('/api/admin/tribes/manual-assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedUserId,
          tribe_id: selectedTribeId || null,
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert('✅ ' + data.message)
        onSuccess()
        onOpenChange(false)
        // Reset form
        setSelectedUserId('')
        setSelectedTribeId('')
      } else {
        alert('❌ Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error assigning tribe:', error)
      alert('❌ Failed to assign tribe')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedUser = users.find(u => u.id === selectedUserId)
  const currentTribeName = selectedUser?.tribe_id
    ? tribes.find(t => t.id === selectedUser.tribe_id)?.name
    : 'Not assigned'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manual Tribe Assignment</DialogTitle>
          <DialogDescription>
            Assign a participant to a specific tribe or remove them from their current tribe.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading...
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* User Selection */}
            <div className="space-y-2">
              <Label htmlFor="user">Select Participant</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a participant" />
                </SelectTrigger>
                <SelectContent>
                  {users.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No attendees found
                    </div>
                  ) : (
                    users.map((user) => {
                      const tribeName = user.tribe_id 
                        ? tribes.find(t => t.id === user.tribe_id)?.name 
                        : null
                      const displayName = user.full_name || user.email
                      const fullLabel = tribeName 
                        ? `${displayName} (${tribeName})`
                        : displayName
                      
                      return (
                        <SelectItem key={user.id} value={user.id}>
                          {fullLabel}
                        </SelectItem>
                      )
                    })
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Current Tribe Info */}
            {selectedUser && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium">Current Assignment:</div>
                <div className="text-sm text-muted-foreground">{currentTribeName}</div>
              </div>
            )}

            {/* Tribe Selection */}
            <div className="space-y-2">
              <Label htmlFor="tribe">Assign to Tribe</Label>
              <Select value={selectedTribeId} onValueChange={setSelectedTribeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a tribe (or leave empty to unassign)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">🚫 Remove from tribe</SelectItem>
                  {tribes.map((tribe) => (
                    <SelectItem key={tribe.id} value={tribe.id}>
                      {tribe.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !selectedUserId}>
            {submitting ? 'Assigning...' : 'Assign Tribe'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

