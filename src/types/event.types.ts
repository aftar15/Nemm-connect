// Event and Registration Types

export type EventType = 
  | 'Sports' 
  | 'Mind Games' 
  | 'Session' 
  | 'Plenary' 
  | 'Workshop' 
  | 'Other'

export interface ScheduleEvent {
  id: string
  title: string
  description: string | null
  event_date: string
  event_type: EventType
  max_participants: number | null
  created_at: string
  updated_at: string
}

export interface EventRegistration {
  id: string
  user_id: string
  event_id: string
  registered_at: string
}

export interface RegistrationWithDetails extends EventRegistration {
  user: {
    id: string
    full_name: string
    email: string
  }
  event: {
    id: string
    title: string
    event_type: EventType
  }
}

export interface EventWithRegistrationCount extends ScheduleEvent {
  registration_count: number
}

