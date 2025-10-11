// Competition and Match Types for Results & Brackets Board

export type CompetitionCategory = 'Sports' | 'Mind Games' | 'Creative Arts'
export type BracketType = 'Single Elimination' | 'Double Elimination' | 'Round Robin'
export type MatchStatus = 'Scheduled' | 'In Progress' | 'Completed'

export interface Competition {
  id: string
  name: string
  category: CompetitionCategory
  bracket_type: BracketType
  created_at: string
}

export interface Match {
  id: string
  competition_event_id: string
  round_number: number
  match_number: number
  tribe_1_id: string | null
  tribe_2_id: string | null
  tribe_1_score: number | null
  tribe_2_score: number | null
  winner_tribe_id: string | null
  status: MatchStatus
  scheduled_time: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface MatchWithTribes extends Match {
  tribe_1?: {
    id: string
    name: string
    color: string | null
  } | null
  tribe_2?: {
    id: string
    name: string
    color: string | null
  } | null
  winner_tribe?: {
    id: string
    name: string
    color: string | null
  } | null
}

export interface CompetitionWithMatches extends Competition {
  matches: MatchWithTribes[]
  total_matches: number
  completed_matches: number
}

export interface TribeScore {
  tribe_id: string
  tribe_name: string
  tribe_color: string | null
  wins: number
  losses: number
  total_points: number
  matches_played: number
}

export interface Leaderboard {
  category: CompetitionCategory
  tribes: TribeScore[]
}

