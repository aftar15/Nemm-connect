'use client'

// Component: Match List with Score Submission

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit } from 'lucide-react'
import type { MatchWithTribes } from '@/types/competition.types'
import MatchScoreDialog from '@/components/features/results/MatchScoreDialog'

interface MatchListProps {
  matches: MatchWithTribes[]
  competitionName: string
  onRefresh: () => void
}

export default function MatchList({ matches, competitionName, onRefresh }: MatchListProps) {
  const [selectedMatch, setSelectedMatch] = useState<MatchWithTribes | null>(null)
  const [showScoreDialog, setShowScoreDialog] = useState(false)

  const handleEditScore = (match: MatchWithTribes) => {
    setSelectedMatch(match)
    setShowScoreDialog(true)
  }

  // Group matches by round
  const matchesByRound = matches.reduce((acc, match) => {
    if (!acc[match.round_number]) {
      acc[match.round_number] = []
    }
    acc[match.round_number].push(match)
    return acc
  }, {} as Record<number, MatchWithTribes[]>)

  const getRoundName = (roundNumber: number, totalRounds: number) => {
    const rounds = Object.keys(matchesByRound).length
    if (roundNumber === rounds) return 'Finals'
    if (roundNumber === rounds - 1) return 'Semi-Finals'
    if (roundNumber === rounds - 2) return 'Quarter-Finals'
    if (roundNumber === 1) return 'Round 1 (First Round)'
    return `Round ${roundNumber}`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <Badge className="bg-green-600">Completed</Badge>
      case 'In Progress':
        return <Badge className="bg-blue-600">In Progress</Badge>
      default:
        return <Badge variant="outline">Scheduled</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {Object.entries(matchesByRound)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([roundNumber, roundMatches]) => (
          <Card key={roundNumber}>
            <CardHeader>
              <CardTitle>{getRoundName(Number(roundNumber), Object.keys(matchesByRound).length)}</CardTitle>
              <CardDescription>
                {roundMatches.filter(m => m.status === 'Completed').length} of {roundMatches.length} matches completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {roundMatches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 space-y-2">
                      {/* Match Title */}
                      <div className="font-medium">
                        Match {match.match_number}
                      </div>

                      {/* Tribes */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 flex-1">
                          {match.tribe_1 ? (
                            <>
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: match.tribe_1.color || '#gray' }}
                              />
                              <span className={match.winner_tribe_id === match.tribe_1.id ? 'font-bold' : ''}>
                                {match.tribe_1.name}
                              </span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">TBD</span>
                          )}
                          {match.tribe_1_score !== null && (
                            <Badge variant="outline" className="ml-auto">
                              {match.tribe_1_score}
                            </Badge>
                          )}
                        </div>

                        <span className="text-muted-foreground">vs</span>

                        <div className="flex items-center gap-2 flex-1">
                          {match.tribe_2_score !== null && (
                            <Badge variant="outline" className="mr-auto">
                              {match.tribe_2_score}
                            </Badge>
                          )}
                          {match.tribe_2 ? (
                            <>
                              <span className={match.winner_tribe_id === match.tribe_2.id ? 'font-bold' : ''}>
                                {match.tribe_2.name}
                              </span>
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: match.tribe_2.color || '#gray' }}
                              />
                            </>
                          ) : (
                            <span className="text-muted-foreground">TBD</span>
                          )}
                        </div>
                      </div>

                      {/* Winner */}
                      {match.winner_tribe && (
                        <div className="text-sm text-green-600 font-medium">
                          🏆 Winner: {match.winner_tribe.name}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 ml-4">
                      {getStatusBadge(match.status)}
                      {match.tribe_1 && match.tribe_2 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditScore(match)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

      {/* Score Submission Dialog */}
      {selectedMatch && (
        <MatchScoreDialog
          open={showScoreDialog}
          onOpenChange={setShowScoreDialog}
          match={selectedMatch}
          onSuccess={onRefresh}
        />
      )}
    </div>
  )
}

