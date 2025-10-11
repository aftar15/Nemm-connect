'use client'

// Component: Competition Bracket Visualization

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { CompetitionWithMatches, MatchWithTribes } from '@/types/competition.types'

interface CompetitionBracketProps {
  competition: CompetitionWithMatches
}

export default function CompetitionBracket({ competition }: CompetitionBracketProps) {
  // Group matches by round
  const matchesByRound = competition.matches.reduce((acc, match) => {
    if (!acc[match.round_number]) {
      acc[match.round_number] = []
    }
    acc[match.round_number].push(match)
    return acc
  }, {} as Record<number, MatchWithTribes[]>)

  const getRoundName = (roundNumber: number) => {
    const totalRounds = Object.keys(matchesByRound).length
    if (competition.bracket_type === 'Round Robin') {
      return 'All Matches'
    }
    if (roundNumber === totalRounds) return 'Finals'
    if (roundNumber === totalRounds - 1) return 'Semi-Finals'
    if (roundNumber === totalRounds - 2) return 'Quarter-Finals'
    if (roundNumber === 1) return 'Round 1 (First Round)'
    return `Round ${roundNumber}`
  }

  const getMatchStatus = (match: MatchWithTribes) => {
    if (match.status === 'Completed') {
      return <Badge className="bg-green-600 text-xs">Completed</Badge>
    }
    if (match.status === 'In Progress') {
      return <Badge className="bg-blue-600 text-xs">Live</Badge>
    }
    return <Badge variant="outline" className="text-xs">Upcoming</Badge>
  }

  if (competition.matches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{competition.name}</CardTitle>
          <CardDescription>{competition.bracket_type}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Bracket not seeded yet
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{competition.name}</CardTitle>
            <CardDescription>{competition.bracket_type}</CardDescription>
          </div>
          <Badge variant="outline">
            {competition.completed_matches} / {competition.total_matches} Complete
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(matchesByRound)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([roundNumber, matches]) => (
              <div key={roundNumber}>
                <h3 className="font-semibold mb-3">{getRoundName(Number(roundNumber))}</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {matches.map((match) => (
                    <div
                      key={match.id}
                      className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      {/* Match Header */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-muted-foreground">
                          Match {match.match_number}
                        </span>
                        {getMatchStatus(match)}
                      </div>

                      {/* Tribe 1 */}
                      <div className={`flex items-center justify-between p-2 rounded ${
                        match.winner_tribe_id === match.tribe_1_id ? 'bg-green-50 border-2 border-green-200' : ''
                      }`}>
                        <div className="flex items-center gap-2">
                          {match.tribe_1 ? (
                            <>
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: match.tribe_1.color || '#gray' }}
                              />
                              <span className={match.winner_tribe_id === match.tribe_1_id ? 'font-bold' : ''}>
                                {match.tribe_1.name}
                              </span>
                              {match.winner_tribe_id === match.tribe_1_id && (
                                <span className="text-green-600">🏆</span>
                              )}
                            </>
                          ) : (
                            <span className="text-muted-foreground italic">TBD</span>
                          )}
                        </div>
                        {match.tribe_1_score !== null && (
                          <Badge variant="outline" className="font-mono">
                            {match.tribe_1_score}
                          </Badge>
                        )}
                      </div>

                      {/* VS Divider */}
                      <div className="text-center text-xs text-muted-foreground my-1">vs</div>

                      {/* Tribe 2 */}
                      <div className={`flex items-center justify-between p-2 rounded ${
                        match.winner_tribe_id === match.tribe_2_id ? 'bg-green-50 border-2 border-green-200' : ''
                      }`}>
                        <div className="flex items-center gap-2">
                          {match.tribe_2 ? (
                            <>
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: match.tribe_2.color || '#gray' }}
                              />
                              <span className={match.winner_tribe_id === match.tribe_2_id ? 'font-bold' : ''}>
                                {match.tribe_2.name}
                              </span>
                              {match.winner_tribe_id === match.tribe_2_id && (
                                <span className="text-green-600">🏆</span>
                              )}
                            </>
                          ) : (
                            <span className="text-muted-foreground italic">TBD</span>
                          )}
                        </div>
                        {match.tribe_2_score !== null && (
                          <Badge variant="outline" className="font-mono">
                            {match.tribe_2_score}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}

