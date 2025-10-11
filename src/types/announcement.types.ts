export interface Announcement {
  id: string
  title: string
  content: string | null
  is_pinned: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface AnnouncementWithAuthor extends Announcement {
  author?: {
    full_name: string | null
    email: string
  }
}

