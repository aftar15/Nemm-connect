'use client'

// =====================================================
// QR Code Scanner Component (Attendees)
// =====================================================

import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, QrCode, Camera, AlertCircle, Upload, Image as ImageIcon } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { QRCheckInResponse } from '@/types/attendance.types'

export function QRScanner() {
  const [isScanning, setIsScanning] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<QRCheckInResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [hasCamera, setHasCamera] = useState(true)
  const [cameraError, setCameraError] = useState<string | null>(null)

  useEffect(() => {
    // Check if camera is available and if HTTPS is required
    Html5Qrcode.getCameras()
      .then(cameras => {
        setHasCamera(cameras.length > 0)
      })
      .catch((err) => {
        setHasCamera(false)
        if (window.location.protocol === 'http:') {
          setCameraError('Camera requires HTTPS. Use "Upload Image" instead.')
        } else {
          setCameraError('Camera access denied or not available.')
        }
      })

    return () => {
      // Cleanup scanner on unmount
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop()
      }
    }
  }, [])

  const startScanning = async () => {
    setIsScanning(true)
    setError(null)
    setResult(null)

    try {
      const scanner = new Html5Qrcode('qr-reader')
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' }, // Use back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        onScanSuccess,
        onScanError
      )
    } catch (err: any) {
      console.error('Scanner error:', err)
      setError('Failed to start camera. Please check camera permissions.')
      setIsScanning(false)
    }
  }

  const stopScanning = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop()
      scannerRef.current = null
    }
    setIsScanning(false)
  }

  const onScanSuccess = async (decodedText: string) => {
    // Stop scanning immediately
    await stopScanning()

    try {
      // Parse QR code data
      const qrData = JSON.parse(decodedText)
      
      if (!qrData.event_id || !qrData.secret) {
        setError('Invalid QR code format')
        return
      }

      // Perform check-in
      const response = await fetch('/api/attendance/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: qrData.event_id,
          secret: qrData.secret
        })
      })

      const data: QRCheckInResponse = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || 'Check-in failed')
        return
      }

      setResult(data)
    } catch (err: any) {
      console.error('Check-in error:', err)
      setError(err.message || 'Failed to process check-in')
    }
  }

  const onScanError = (errorMessage: string) => {
    // Ignore scanning errors (just means no QR code detected yet)
    // Only log for debugging
    // console.log('Scan error:', errorMessage)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)
    setResult(null)

    try {
      const scanner = new Html5Qrcode('qr-file-reader')
      
      const decodedText = await scanner.scanFile(file, true)
      
      // Process the QR code
      await onScanSuccess(decodedText)
      
      // Clear the scanner
      await scanner.clear()
    } catch (err: any) {
      console.error('File scan error:', err)
      setError('Could not read QR code from image. Please try another image.')
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const reset = () => {
    setResult(null)
    setError(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          QR Code Check-In
        </CardTitle>
        <CardDescription>
          Scan the event QR code to check in
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Results and Errors */}
        {result?.success && result.event && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              <div className="font-semibold">Check-in successful!</div>
              <div className="text-sm mt-1">{result.event.title}</div>
              <div className="text-xs text-green-600 dark:text-green-400">
                {new Date(result.event.event_date).toLocaleString()}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {(result || error) && (
          <Button onClick={reset} variant="outline" className="w-full">
            Scan Another QR Code
          </Button>
        )}

        {/* Scanner Tabs */}
        {!result && !error && (
          <Tabs defaultValue={hasCamera ? "camera" : "upload"} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="camera" disabled={!hasCamera && window.location.protocol === 'http:'}>
                <Camera className="h-4 w-4 mr-2" />
                Camera
              </TabsTrigger>
              <TabsTrigger value="upload">
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </TabsTrigger>
            </TabsList>

            {/* Camera Tab */}
            <TabsContent value="camera" className="space-y-4">
              {cameraError && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{cameraError}</AlertDescription>
                </Alert>
              )}

              {!isScanning && (
                <div className="text-center py-8">
                  <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Position the QR code within the camera frame to check in
                  </p>
                  <Button 
                    onClick={startScanning} 
                    className="w-full"
                    disabled={!hasCamera}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Start Camera
                  </Button>
                </div>
              )}

              {isScanning && (
                <div className="space-y-4">
                  <div id="qr-reader" className="rounded-lg overflow-hidden" />
                  <Button onClick={stopScanning} variant="outline" className="w-full">
                    Stop Scanning
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Upload Tab */}
            <TabsContent value="upload" className="space-y-4">
              <div className="text-center py-8">
                <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  Take a screenshot or photo of the QR code and upload it here
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="qr-file-input"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <AlertCircle className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload QR Code Image
                    </>
                  )}
                </Button>
                {/* Hidden div for file scanning */}
                <div id="qr-file-reader" className="hidden" />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}

