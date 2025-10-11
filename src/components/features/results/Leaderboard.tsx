'use client'

// Component: Tribe Leaderboard

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Medal } from 'lucide-react'
import type { TribeScore } from '@/types/competition.types'

interface LeaderboardProps {
  tribes: TribeScore[]
}

export default function Leaderboard({ tribes }: LeaderboardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Medal className="h-5 w-5 text-orange-600" />
      default:
        return <span className="text-muted-foreground font-mono text-sm">#{rank}</span>
    }
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500">🥇 1st Place</Badge>
    if (rank === 2) return <Badge className="bg-gray-400">🥈 2nd Place</Badge>
    if (rank === 3) return <Badge className="bg-orange-600">🥉 3rd Place</Badge>
    return null
  }

  if (tribes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🏆 Overall Leaderboard</CardTitle>
          <CardDescription>No matches completed yet</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🏆 Overall Leaderboard</CardTitle>
        <CardDescription>
          Rankings based on wins and total points
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {tribes.map((tribe, index) => {
            const rank = index + 1
            const winRate = tribe.matches_played > 0
              ? Math.round((tribe.wins / tribe.matches_played) * 100)
              : 0

            return (
              <div
                key={tribe.tribe_id}
                className={`flex items-center gap-4 p-4 rounded-lg border ${
                  rank <= 3 ? 'bg-accent/50' : ''
                }`}
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-10">
                  {getRankIcon(rank)}
                </div>

                {/* Tribe Info */}
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: tribe.tribe_color || '#gray' }}
                  />
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {tribe.tribe_name}
                      {getRankBadge(rank)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {tribe.matches_played} matches • {winRate}% win rate
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-green-600">{tribe.wins}</div>
                    <div className="text-muted-foreground text-xs">Wins</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-red-600">{tribe.losses}</div>
                    <div className="text-muted-foreground text-xs">Losses</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">{tribe.total_points}</div>
                    <div className="text-muted-foreground text-xs">Points</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

