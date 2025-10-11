'use client'

// Component: Bracket Seeder - Create and Seed Tournament Matches

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Shuffle, Plus } from 'lucide-react'
import type { Competition } from '@/types/competition.types'
import type { Tribe } from '@/types/tribe.types'

interface BracketSeederProps {
  competition: Competition
  onSuccess: () => void
}

export default function BracketSeeder({ competition, onSuccess }: BracketSeederProps) {
  const [tribes, setTribes] = useState<Tribe[]>([])
  const [selectedTribes, setSelectedTribes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchTribes()
  }, [])

  const fetchTribes = async () => {
    try {
      const response = await fetch('/api/tribes')
      const data = await response.json()

      if (data.success) {
        setTribes(data.tribes)
      }
    } catch (error) {
      console.error('Error fetching tribes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRandomSelect = () => {
    // Shuffle and select 8 tribes for a single elimination bracket
    const shuffled = [...tribes].sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, 8).map(t => t.id)
    setSelectedTribes(selected)
  }

  const handleTribeSelect = (index: number, tribeId: string) => {
    const newSelected = [...selectedTribes]
    newSelected[index] = tribeId
    setSelectedTribes(newSelected)
  }

  const generateMatches = () => {
    const matches: any[] = []

    if (competition.bracket_type === 'Single Elimination') {
      const numTeams = selectedTribes.length
      
      // Calculate bracket structure
      // For 12 teams: 4 get byes, 8 play in round 1
      // For any non-power-of-2: some teams get byes to next round
      const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(numTeams)))
      const numByes = nextPowerOf2 - numTeams
      const numFirstRoundMatches = (numTeams - numByes) / 2
      
      // Round 1: First matches (teams without byes)
      let tribeIndex = 0
      for (let i = 0; i < numFirstRoundMatches; i++) {
        matches.push({
          round_number: 1,
          match_number: i + 1,
          tribe_1_id: selectedTribes[tribeIndex++],
          tribe_2_id: selectedTribes[tribeIndex++]
        })
      }

      // Tribes with byes are the remaining ones
      const tribesWithByes = selectedTribes.slice(numFirstRoundMatches * 2)

      // Round 2 (Quarter-Finals): Pair Round 1 winners with bye teams
      if (numByes > 0 && tribesWithByes.length > 0) {
        for (let i = 0; i < numFirstRoundMatches; i++) {
          matches.push({
            round_number: 2,
            match_number: i + 1,
            tribe_1_id: null, // Will be filled by Round 1 winner
            tribe_2_id: tribesWithByes[i] || null // Tribe with bye
          })
        }
      } else {
        // No byes, just create placeholder matches
        for (let i = 0; i < numFirstRoundMatches / 2; i++) {
          matches.push({
            round_number: 2,
            match_number: i + 1,
            tribe_1_id: null,
            tribe_2_id: null
          })
        }
      }

      // Generate placeholder matches for remaining rounds
      let currentRoundSize = numFirstRoundMatches + numByes
      let roundNumber = 3
      let matchNumber = 1

      // Round 3 onwards (Semi-Finals, Finals)
      currentRoundSize = currentRoundSize / 2 // After Round 2
      while (currentRoundSize > 1) {
        const matchesInRound = currentRoundSize / 2
        
        for (let i = 0; i < matchesInRound; i++) {
          matches.push({
            round_number: roundNumber,
            match_number: matchNumber++,
            tribe_1_id: null,
            tribe_2_id: null
          })
        }
        
        currentRoundSize = matchesInRound
        roundNumber++
        matchNumber = 1
      }
    } else if (competition.bracket_type === 'Round Robin') {
      // Every tribe plays every other tribe once
      let matchNumber = 1
      for (let i = 0; i < selectedTribes.length; i++) {
        for (let j = i + 1; j < selectedTribes.length; j++) {
          matches.push({
            round_number: 1,
            match_number: matchNumber++,
            tribe_1_id: selectedTribes[i],
            tribe_2_id: selectedTribes[j]
          })
        }
      }
    }

    return matches
  }

  const handleCreateBracket = async () => {
    if (selectedTribes.length < 2) {
      alert('Please select at least 2 tribes')
      return
    }

    if (!confirm(`Create bracket with ${selectedTribes.length} tribes?`)) {
      return
    }

    try {
      setSubmitting(true)

      const matches = generateMatches()

      const response = await fetch(`/api/admin/competitions/${competition.id}/matches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matches }),
      })

      const data = await response.json()

      if (data.success) {
        alert(`✅ Bracket created with ${data.matches.length} matches!`)
        onSuccess()
      } else {
        alert('❌ Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error creating bracket:', error)
      alert('❌ Failed to create bracket')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 text-muted-foreground">
            Loading tribes...
          </div>
        </CardContent>
      </Card>
    )
  }

  const recommendedCount = 12 // Use all 12 tribes by default

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seed Bracket</CardTitle>
        <CardDescription>
          Select tribes to participate in this {competition.bracket_type} tournament.
          {competition.bracket_type === 'Single Elimination' && ' All 12 tribes recommended (4 will get byes to Round 2)'}
          {competition.bracket_type === 'Round Robin' && ' All 12 tribes recommended (66 total matches)'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRandomSelect}>
            <Shuffle className="mr-2 h-4 w-4" />
            Random {recommendedCount} Tribes
          </Button>
          <Button
            variant="outline"
            onClick={() => setSelectedTribes(tribes.slice(0, recommendedCount).map(t => t.id))}
          >
            <Plus className="mr-2 h-4 w-4" />
            First {recommendedCount} Tribes
          </Button>
        </div>

        {/* Tribe Selection */}
        <div className="space-y-4">
          <Label>Select Participating Tribes ({selectedTribes.length} selected)</Label>
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: recommendedCount }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Position {index + 1}
                </Label>
                <Select
                  value={selectedTribes[index] || ''}
                  onValueChange={(value) => handleTribeSelect(index, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tribe" />
                  </SelectTrigger>
                  <SelectContent>
                    {tribes.map((tribe) => (
                      <SelectItem key={tribe.id} value={tribe.id}>
                        {tribe.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        {selectedTribes.length >= 2 && (
          <div className="p-4 bg-muted rounded-lg">
            <div className="text-sm font-medium mb-2">Bracket Preview:</div>
            <div className="text-sm text-muted-foreground">
              • {selectedTribes.length} tribes selected<br />
              {competition.bracket_type === 'Single Elimination' ? (
                <>
                  • {(() => {
                    const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(selectedTribes.length)))
                    const numByes = nextPowerOf2 - selectedTribes.length
                    const numFirstRoundMatches = (selectedTribes.length - numByes) / 2
                    const totalRounds = Math.ceil(Math.log2(selectedTribes.length))
                    
                    return (
                      <>
                        {numByes > 0 && `${numByes} tribes get byes (auto-advance to Round 2)`}<br />
                        • Round 1: {numFirstRoundMatches} matches<br />
                        • Total rounds: {totalRounds + 1} (including finals)
                      </>
                    )
                  })()}
                </>
              ) : (
                `• ${(selectedTribes.length * (selectedTribes.length - 1)) / 2} total matches (everyone plays everyone)`
              )}
            </div>
          </div>
        )}

        {/* Create Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleCreateBracket}
            disabled={submitting || selectedTribes.length < 2}
            size="lg"
          >
            {submitting ? 'Creating Bracket...' : 'Create Bracket'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

