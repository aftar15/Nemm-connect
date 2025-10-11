// =====================================================
// Attendance System Type Definitions
// =====================================================

export type CheckInMethod = 'qr_scan' | 'manual'

export interface Attendance {
  id: string
  event_id: string
  user_id: string
  check_in_method: CheckInMethod
  checked_in_by: string | null
  checked_in_at: string
  notes: string | null
}

export interface AttendanceWithDetails extends Attendance {
  user: {
    id: string
    full_name: string
    email: string
    chapter?: {
      id: string
      name: string
    }
  }
  event: {
    id: string
    title: string
    event_date: string
  }
}

export interface AttendanceSummary {
  event_id: string
  event_title: string
  event_date: string
  total_attendees: number
  qr_scans: number
  manual_checkins: number
  max_participants: number | null
}

export interface QRCheckInResponse {
  success: boolean
  error?: string
  event?: {
    id: string
    title: string
    event_date: string
  }
}

export interface ManualCheckInPayload {
  event_id: string
  user_id: string
  notes?: string
}

export interface QRCodeData {
  event_id: string
  secret: string
  title: string
  event_date: string
}

