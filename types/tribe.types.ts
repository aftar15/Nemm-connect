// Tribe and Competition Types

export interface Tribe {
  id: string;
  name: string;
  color: string | null;
  created_at: string;
}

export interface TribeWithMembers extends Tribe {
  members?: TribeMember[];
  member_count?: number;
}

export interface TribeMember {
  id: string;
  full_name: string | null;
  email: string;
  chapter_id: string | null;
}

export type CompetitionCategory = 'Sports' | 'Mind Games' | 'Creative Arts';
export type BracketType = 'Single Elimination' | 'Double Elimination' | 'Round Robin';
export type MatchStatus = 'Scheduled' | 'In Progress' | 'Completed';

export interface CompetitionEvent {
  id: string;
  name: string;
  category: CompetitionCategory | null;
  bracket_type: BracketType | null;
  created_at: string;
}

export interface Match {
  id: string;
  competition_event_id: string;
  round_number: number;
  match_number: number;
  tribe_1_id: string | null;
  tribe_2_id: string | null;
  tribe_1_score: number | null;
  tribe_2_score: number | null;
  winner_tribe_id: string | null;
  status: MatchStatus;
  scheduled_time: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MatchWithTribes extends Match {
  tribe_1?: Tribe;
  tribe_2?: Tribe;
  winner_tribe?: Tribe;
  competition_event?: CompetitionEvent;
}

