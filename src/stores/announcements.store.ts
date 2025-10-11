// Announcements State Management with Zustand

import { create } from 'zustand'
import type { Announcement } from '@/../types/event.types'

interface AnnouncementsStore {
  announcements: Announcement[]
  isLoading: boolean
  setAnnouncements: (announcements: Announcement[]) => void
  addAnnouncement: (announcement: Announcement) => void
  setLoading: (loading: boolean) => void
}

export const useAnnouncementsStore = create<AnnouncementsStore>((set) => ({
  announcements: [],
  isLoading: true,
  setAnnouncements: (announcements) => 
    set({ announcements: announcements.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ), isLoading: false }),
  addAnnouncement: (announcement) =>
    set((state) => ({
      announcements: [announcement, ...state.announcements],
    })),
  setLoading: (isLoading) => set({ isLoading }),
}))

