'use client'

// Admin Page: Competition Detail & Bracket Management

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Trophy } from 'lucide-react'
import type { CompetitionWithMatches } from '@/types/competition.types'
import BracketSeeder from '@/components/features/results/BracketSeeder'
import MatchList from '@/components/features/results/MatchList'

export default function CompetitionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const competitionId = params.id as string

  const [competition, setCompetition] = useState<CompetitionWithMatches | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCompetition = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/competitions/${competitionId}`)
      const data = await response.json()

      if (data.success) {
        setCompetition(data.competition)
      }
    } catch (error) {
      console.error('Error fetching competition:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompetition()
  }, [competitionId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading competition...</div>
      </div>
    )
  }

  if (!competition) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.push('/admin/results')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Results
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">Competition Not Found</h3>
              <p className="text-muted-foreground">
                This competition may have been deleted
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="outline" onClick={() => router.push('/admin/results')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Results
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{competition.name}</h1>
            <p className="text-muted-foreground">
              {competition.category} • {competition.bracket_type}
            </p>
          </div>
          <Trophy className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{competition.total_matches}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{competition.completed_matches}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {competition.total_matches - competition.completed_matches}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bracket Seeder or Match List */}
      {competition.matches.length === 0 ? (
        <BracketSeeder
          competition={competition}
          onSuccess={fetchCompetition}
        />
      ) : (
        <MatchList
          matches={competition.matches}
          competitionName={competition.name}
          onRefresh={fetchCompetition}
        />
      )}
    </div>
  )
}

