export interface Tribe {
  id: string
  name: string
  color: string | null
  created_at: string
}

export interface TribeWithMembers extends Tribe {
  members: TribeMember[]
  memberCount: number
}

export interface TribeMember {
  id: string
  full_name: string | null
  email: string
  chapter_id: string | null
  chapter_name?: string | null
}

export interface TribeAssignmentStats {
  total_participants: number
  assigned_participants: number
  unassigned_participants: number
  tribes: {
    id: string
    name: string
    color: string | null
    member_count: number
  }[]
}

