// Event, Schedule, and Announcement Types

export type EventType = 
  | 'Plenary' 
  | 'Sports' 
  | 'Mind Games' 
  | 'Workshop' 
  | 'Devotional' 
  | 'Meals' 
  | 'Other';

export interface ScheduleEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string; // ISO date string
  start_time: string | null; // Time string
  end_time: string | null; // Time string
  location: string | null;
  event_type: EventType | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventRegistration {
  id: string;
  user_id: string;
  event_id: string;
  registered_by: string | null;
  created_at: string;
}

export interface Attendance {
  id: string;
  user_id: string;
  event_id: string;
  checked_in_at: string;
  check_in_method: 'QR Code' | 'Manual';
}

export interface AttendanceWithUser extends Attendance {
  user?: {
    id: string;
    full_name: string | null;
    email: string;
  };
}

