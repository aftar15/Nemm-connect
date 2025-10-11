'use client'

// =====================================================
// QR Code Generator Component (Admin)
// =====================================================

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, QrCode, X } from 'lucide-react'
import type { QRCodeData } from '@/types/attendance.types'

interface QRGeneratorProps {
  eventId: string
  eventTitle: string
  eventDate: string
  onClose?: () => void
}

export function QRGenerator({ eventId, eventTitle, eventDate, onClose }: QRGeneratorProps) {
  const [qrData, setQrData] = useState<QRCodeData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateQRCode = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/attendance/generate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate QR code')
      }

      setQrData(data.qr_code)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code-svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL('image/png')

      const downloadLink = document.createElement('a')
      downloadLink.download = `qr-${eventTitle.replace(/\s+/g, '-')}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  const qrCodeValue = qrData ? JSON.stringify({
    event_id: qrData.event_id,
    secret: qrData.secret
  }) : ''

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            <CardTitle>QR Code Check-In</CardTitle>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription>
          {eventTitle} • {new Date(eventDate).toLocaleDateString()}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {!qrData ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">
              Generate a QR code for attendees to scan and check in to this event.
            </p>
            <Button 
              onClick={generateQRCode} 
              disabled={isGenerating}
              className="w-full"
            >
              <QrCode className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate QR Code'}
            </Button>
            {error && (
              <p className="text-sm text-red-500 mt-2">{error}</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center p-6 bg-white rounded-lg">
              <QRCodeSVG
                id="qr-code-svg"
                value={qrCodeValue}
                size={256}
                level="H"
                includeMargin
              />
            </div>

            <div className="space-y-2">
              <Button 
                onClick={downloadQRCode}
                className="w-full"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Download QR Code
              </Button>

              <div className="text-xs text-muted-foreground text-center">
                This QR code is unique to this event. Display it at the venue for attendees to scan.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

