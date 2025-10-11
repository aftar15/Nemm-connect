'use client'

// Admin Page: Results & Competition Management

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, Plus } from 'lucide-react'
import type { CompetitionWithMatches } from '@/types/competition.types'
import CompetitionList from '@/components/features/results/CompetitionList'
import CreateCompetitionDialog from '@/components/features/results/CreateCompetitionDialog'

export default function AdminResultsPage() {
  const [competitions, setCompetitions] = useState<CompetitionWithMatches[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  const fetchCompetitions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/competitions')
      const data = await response.json()

      if (data.success) {
        setCompetitions(data.competitions)
      }
    } catch (error) {
      console.error('Error fetching competitions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompetitions()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">🏆 Results Management</h1>
          <p className="text-muted-foreground">
            Manage competitions, brackets, and tournament results
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Competition
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Competitions</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{competitions.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Competitions</CardTitle>
            <Trophy className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {competitions.filter(c => c.completed_matches < c.total_matches).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Still in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Trophy className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {competitions.filter(c => c.total_matches > 0 && c.completed_matches === c.total_matches).length}
            </div>
            <p className="text-xs text-muted-foreground">
              All matches done
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Competition List */}
      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              Loading competitions...
            </div>
          </CardContent>
        </Card>
      ) : (
        <CompetitionList
          competitions={competitions}
          onRefresh={fetchCompetitions}
        />
      )}

      {/* Create Competition Dialog */}
      <CreateCompetitionDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSuccess={fetchCompetitions}
      />
    </div>
  )
}

