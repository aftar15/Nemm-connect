'use client'

// Public Page: Live Results & Brackets Board

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trophy } from 'lucide-react'
import type { CompetitionWithMatches, CompetitionCategory } from '@/types/competition.types'
import type { TribeScore } from '@/types/competition.types'
import CompetitionBracket from '@/components/features/results/CompetitionBracket'
import Leaderboard from '@/components/features/results/Leaderboard'
import { createClient } from '@/lib/supabase/client'

export default function ResultsPage() {
  const [competitions, setCompetitions] = useState<CompetitionWithMatches[]>([])
  const [leaderboard, setLeaderboard] = useState<TribeScore[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<CompetitionCategory>('Sports')

  const supabase = createClient()

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch competitions
      const compsResponse = await fetch('/api/competitions')
      const compsData = await compsResponse.json()

      if (compsData.success) {
        // Fetch matches for each competition
        const compsWithMatches = await Promise.all(
          compsData.competitions.map(async (comp: any) => {
            const matchesResponse = await fetch(`/api/competitions/${comp.id}`)
            const matchesData = await matchesResponse.json()
            return matchesData.success ? matchesData.competition : comp
          })
        )
        setCompetitions(compsWithMatches)
      }

      // Fetch leaderboard
      const leaderResponse = await fetch('/api/competitions/leaderboard')
      const leaderData = await leaderResponse.json()

      if (leaderData.success) {
        setLeaderboard(leaderData.leaderboard)
      }
    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Set up real-time subscriptions for match updates
    const matchesChannel = supabase
      .channel('matches-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches' },
        () => {
          console.log('Match updated, refreshing data...')
          fetchData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(matchesChannel)
    }
  }, [])

  const categories: CompetitionCategory[] = ['Sports', 'Mind Games', 'Creative Arts']

  const getCompetitionsByCategory = (category: CompetitionCategory) => {
    return competitions.filter(c => c.category === category)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading results...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">🏆 Live Results & Brackets</h1>
        <p className="text-muted-foreground">
          Real-time tournament results and tribe leaderboard
        </p>
      </div>

      {/* Overall Leaderboard */}
      <Leaderboard tribes={leaderboard} />

      {/* Competitions by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Competitions</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as CompetitionCategory)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="Sports">🏀 Sports</TabsTrigger>
              <TabsTrigger value="Mind Games">🧠 Mind Games</TabsTrigger>
              <TabsTrigger value="Creative Arts">🎨 Creative Arts</TabsTrigger>
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category} value={category} className="space-y-6 mt-6">
                {getCompetitionsByCategory(category).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No competitions in this category yet
                  </div>
                ) : (
                  getCompetitionsByCategory(category).map((competition) => (
                    <CompetitionBracket
                      key={competition.id}
                      competition={competition}
                    />
                  ))
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
