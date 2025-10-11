'use client'

// =====================================================
// Attendance Dashboard Component (Admin)
// =====================================================

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { QrCode, Users, Eye } from 'lucide-react'
import { QRGenerator } from './QRGenerator'
import { ManualCheckIn } from './ManualCheckIn'
import { AttendanceReport } from './AttendanceReport'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Event {
  id: string
  title: string
  description: string | null
  event_date: string
  category: string
  location: string | null
  max_participants: number | null
  qr_enabled: boolean
}

interface AttendanceDashboardProps {
  events: Event[]
}

export function AttendanceDashboard({ events }: AttendanceDashboardProps) {
  const [selectedEventForQR, setSelectedEventForQR] = useState<Event | null>(null)
  const [selectedEventForReport, setSelectedEventForReport] = useState<Event | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="space-y-6">
      {events.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">
              No events found. Create events first to manage attendance.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <CardDescription>
                      {new Date(event.event_date).toLocaleString()}
                    </CardDescription>
                  </div>
                  {event.qr_enabled && (
                    <Badge variant="secondary" className="ml-2">
                      <QrCode className="h-3 w-3 mr-1" />
                      QR Active
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Badge variant="outline">{event.category}</Badge>
                  {event.location && (
                    <span className="text-xs">{event.location}</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedEventForQR(event)}
                    className="w-full"
                  >
                    <QrCode className="h-4 w-4 mr-1" />
                    {event.qr_enabled ? 'View QR' : 'Generate QR'}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedEventForReport(event)}
                    className="w-full"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Report
                  </Button>
                </div>

                <ManualCheckIn
                  eventId={event.id}
                  eventTitle={event.title}
                  onSuccess={handleRefresh}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* QR Generator Dialog */}
      <Dialog
        open={!!selectedEventForQR}
        onOpenChange={(open) => !open && setSelectedEventForQR(null)}
      >
        <DialogContent className="max-w-md">
          {selectedEventForQR && (
            <QRGenerator
              eventId={selectedEventForQR.id}
              eventTitle={selectedEventForQR.title}
              eventDate={selectedEventForQR.event_date}
              onClose={() => setSelectedEventForQR(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Attendance Report Dialog */}
      <Dialog
        open={!!selectedEventForReport}
        onOpenChange={(open) => !open && setSelectedEventForReport(null)}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Attendance Report</DialogTitle>
          </DialogHeader>
          {selectedEventForReport && (
            <AttendanceReport
              eventId={selectedEventForReport.id}
              eventTitle={selectedEventForReport.title}
              refreshTrigger={refreshTrigger}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

