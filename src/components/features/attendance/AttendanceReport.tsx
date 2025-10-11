'use client'

// =====================================================
// Attendance Report Component (Admin)
// =====================================================

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Users, QrCode, UserPlus, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AttendanceWithDetails, AttendanceSummary } from '@/types/attendance.types'

interface AttendanceReportProps {
  eventId: string
  eventTitle: string
  refreshTrigger?: number
}

export function AttendanceReport({ eventId, eventTitle, refreshTrigger = 0 }: AttendanceReportProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [attendance, setAttendance] = useState<AttendanceWithDetails[]>([])
  const [summary, setSummary] = useState<AttendanceSummary | null>(null)

  useEffect(() => {
    fetchAttendance()
  }, [eventId, refreshTrigger])

  const fetchAttendance = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/attendance/event/${eventId}`)
      const data = await response.json()

      if (response.ok) {
        setAttendance(data.attendance || [])
        setSummary(data.summary || null)
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Chapter', 'Check-In Method', 'Check-In Time']
    const rows = attendance.map(a => [
      a.user.full_name,
      a.user.email,
      a.user.chapter?.name || 'N/A',
      a.check_in_method,
      new Date(a.checked_in_at).toLocaleString()
    ])

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance-${eventTitle.replace(/\s+/g, '-')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                Total Attendees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_attendees}</div>
              {summary.max_participants && (
                <p className="text-xs text-muted-foreground">
                  of {summary.max_participants} max
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <QrCode className="h-4 w-4 text-green-500" />
                QR Scans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.qr_scans}</div>
              <p className="text-xs text-muted-foreground">
                {summary.total_attendees > 0 
                  ? Math.round((summary.qr_scans / summary.total_attendees) * 100)
                  : 0}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-orange-500" />
                Manual Check-Ins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.manual_checkins}</div>
              <p className="text-xs text-muted-foreground">
                {summary.total_attendees > 0 
                  ? Math.round((summary.manual_checkins / summary.total_attendees) * 100)
                  : 0}% of total
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Export Button */}
      {attendance.length > 0 && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export to CSV
          </Button>
        </div>
      )}

      {/* Attendance List */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          {attendance.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No check-ins yet for this event
            </div>
          ) : (
            <div className="space-y-2">
              {attendance.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
                >
                  <div className="flex-1">
                    <div className="font-medium">{record.user.full_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {record.user.email}
                      {record.user.chapter && ` • ${record.user.chapter.name}`}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(record.checked_in_at).toLocaleString()}
                    </div>
                  </div>
                  <Badge
                    variant={record.check_in_method === 'qr_scan' ? 'default' : 'secondary'}
                  >
                    {record.check_in_method === 'qr_scan' ? (
                      <>
                        <QrCode className="h-3 w-3 mr-1" />
                        QR Scan
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-3 w-3 mr-1" />
                        Manual
                      </>
                    )}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

