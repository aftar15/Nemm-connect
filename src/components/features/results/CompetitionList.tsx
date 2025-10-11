'use client'

// Component: Competition List with Actions

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trophy, Trash2, LayoutGrid } from 'lucide-react'
import type { CompetitionWithMatches } from '@/types/competition.types'

interface CompetitionListProps {
  competitions: CompetitionWithMatches[]
  onRefresh: () => void
}

export default function CompetitionList({ competitions, onRefresh }: CompetitionListProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will delete all matches.`)) {
      return
    }

    try {
      setDeleting(id)
      const response = await fetch(`/api/admin/competitions/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        alert('✅ Competition deleted successfully')
        onRefresh()
      } else {
        alert('❌ Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error deleting competition:', error)
      alert('❌ Failed to delete competition')
    } finally {
      setDeleting(null)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Sports': return '🏀'
      case 'Mind Games': return '🧠'
      case 'Creative Arts': return '🎨'
      default: return '🏆'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Sports': return 'bg-blue-100 text-blue-800'
      case 'Mind Games': return 'bg-purple-100 text-purple-800'
      case 'Creative Arts': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressBadge = (comp: CompetitionWithMatches) => {
    if (comp.total_matches === 0) {
      return <Badge variant="outline">Not Started</Badge>
    }
    if (comp.completed_matches === comp.total_matches) {
      return <Badge className="bg-green-600">Completed</Badge>
    }
    return <Badge className="bg-blue-600">In Progress</Badge>
  }

  // Group by category
  const groupedCompetitions = competitions.reduce((acc, comp) => {
    if (!acc[comp.category]) {
      acc[comp.category] = []
    }
    acc[comp.category].push(comp)
    return acc
  }, {} as Record<string, CompetitionWithMatches[]>)

  if (competitions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Competitions Yet</h3>
            <p className="text-muted-foreground">
              Create your first competition to get started
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedCompetitions).map(([category, comps]) => (
        <div key={category}>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>{getCategoryIcon(category)}</span>
            {category}
          </h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {comps.map((comp) => (
              <Card key={comp.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{comp.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {comp.bracket_type}
                      </CardDescription>
                    </div>
                    <Badge className={getCategoryColor(comp.category)} variant="secondary">
                      {comp.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Progress */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress:</span>
                      {getProgressBadge(comp)}
                    </div>

                    {/* Matches */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Matches:</span>
                      <span className="font-medium">
                        {comp.completed_matches} / {comp.total_matches}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => router.push(`/admin/results/${comp.id}`)}
                      >
                        <LayoutGrid className="mr-2 h-4 w-4" />
                        Manage
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(comp.id, comp.name)}
                        disabled={deleting === comp.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

