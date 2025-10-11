'use client'

// Admin Page: Tribe Assignment Management

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Shuffle, UserPlus } from 'lucide-react'
import type { TribeAssignmentStats } from '@/types/tribe.types'
import ManualAssignDialog from '@/components/features/tribes/ManualAssignDialog'
import { TribeMembersDialog } from '@/components/features/tribes/TribeMembersDialog'

export default function TribesManagementPage() {
  const [stats, setStats] = useState<TribeAssignmentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [showManualAssign, setShowManualAssign] = useState(false)
  const [selectedTribe, setSelectedTribe] = useState<any | null>(null)
  const [showTribeMembers, setShowTribeMembers] = useState(false)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/tribes/stats')
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
      } else {
        console.error('Failed to fetch stats:', data.error)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const handleAutoAssign = async () => {
    if (!confirm(
      `This will assign all unassigned participants (${stats?.unassigned_participants || 0}) to tribes randomly. Continue?`
    )) {
      return
    }

    try {
      setAssigning(true)
      const response = await fetch('/api/admin/tribes/assign', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        alert(`✅ ${data.message}`)
        fetchStats() // Refresh stats
      } else {
        alert(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error assigning tribes:', error)
      alert('❌ Failed to assign tribes')
    } finally {
      setAssigning(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading tribe statistics...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">🏛️ Tribe Assignment</h1>
          <p className="text-muted-foreground">
            Manage the 12 Tribes of Israel assignments
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowManualAssign(true)}
            variant="outline"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Manual Assign
          </Button>
          <Button
            onClick={handleAutoAssign}
            disabled={assigning || stats?.unassigned_participants === 0}
          >
            <Shuffle className="mr-2 h-4 w-4" />
            {assigning ? 'Assigning...' : 'Auto-Assign All'}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_participants || 0}</div>
            <p className="text-xs text-muted-foreground">
              Registered attendees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.assigned_participants || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.total_participants 
                ? Math.round((stats.assigned_participants / stats.total_participants) * 100)
                : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unassigned</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.unassigned_participants || 0}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting assignment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tribes Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Tribe Distribution</CardTitle>
          <CardDescription>
            Current member count across all 12 tribes • Click to view members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {stats?.tribes.map((tribe) => (
              <div
                key={tribe.id}
                onClick={() => {
                  setSelectedTribe(tribe)
                  setShowTribeMembers(true)
                }}
                className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors hover:shadow-elevated"
              >
                {tribe.symbol && (
                  <span className="text-2xl">{tribe.symbol}</span>
                )}
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tribe.color || '#64748B' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{tribe.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {tribe.member_count} {tribe.member_count === 1 ? 'member' : 'members'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Manual Assignment Dialog */}
      <ManualAssignDialog
        open={showManualAssign}
        onOpenChange={setShowManualAssign}
        onSuccess={fetchStats}
      />

      {/* Tribe Members Dialog */}
      <TribeMembersDialog
        tribe={selectedTribe}
        open={showTribeMembers}
        onOpenChange={setShowTribeMembers}
      />
    </div>
  )
}

