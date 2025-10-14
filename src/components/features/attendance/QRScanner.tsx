'use client'

// =====================================================
// QR Code Scanner Component (Attendees) - Enhanced
// =====================================================

import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, QrCode, Camera, AlertCircle, Upload, Image as ImageIcon, Info } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { QRCheckInResponse } from '@/types/attendance.types'

interface CameraDevice {
  id: string
  label: string
}

export function QRScanner() {
  const [isScanning, setIsScanning] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<QRCheckInResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [hasCamera, setHasCamera] = useState(true)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameras, setCameras] = useState<CameraDevice[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>('environment')
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown')

  useEffect(() => {
    checkCameraAccess()

    return () => {
      // Cleanup scanner on unmount
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error)
      }
    }
  }, [])

  const checkCameraAccess = async () => {
    try {
      console.log('🔍 Checking camera access...')
      console.log('Protocol:', window.location.protocol)
      console.log('URL:', window.location.href)

      // Check if running on HTTPS
      if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
        setCameraError('⚠️ Camera requires HTTPS. Use "Upload Image" instead.')
        setHasCamera(false)
        return
      }

      // Test basic camera access first
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        console.log('✅ Camera permission granted!')
        stream.getTracks().forEach(track => track.stop()) // Stop test stream
        setPermissionStatus('granted')
      } catch (permError: any) {
        console.error('❌ Camera permission error:', permError.name, permError.message)
        setPermissionStatus('denied')
        
        if (permError.name === 'NotAllowedError') {
          setCameraError('🚫 Camera permission denied. Please allow camera access in your browser settings.')
        } else if (permError.name === 'NotFoundError') {
          setCameraError('📷 No camera found on this device.')
        } else if (permError.name === 'NotReadableError') {
          setCameraError('⚠️ Camera is in use by another application.')
        } else {
          setCameraError(`❌ Camera error: ${permError.message}`)
        }
        setHasCamera(false)
        return
      }

      // Get available cameras
      const devices = await Html5Qrcode.getCameras()
      console.log('📷 Found cameras:', devices)
      
      if (devices.length === 0) {
        setCameraError('📷 No camera found on this device.')
        setHasCamera(false)
        return
      }

      setCameras(devices.map(d => ({ id: d.id, label: d.label || `Camera ${d.id}` })))
      setHasCamera(true)
      setCameraError(null)
      
    } catch (err: any) {
      console.error('❌ Camera check failed:', err)
      setHasCamera(false)
      setCameraError(`Error checking camera: ${err.message}`)
    }
  }

  const startScanning = async () => {
    setIsScanning(true)
    setError(null)
    setResult(null)

    try {
      console.log('🎥 Starting scanner...')
      
      // Wait for DOM element to be available
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Check if element exists
      const element = document.getElementById('qr-reader')
      if (!element) {
        throw new Error('QR reader element not found. Please try again.')
      }
      
      const scanner = new Html5Qrcode('qr-reader')
      scannerRef.current = scanner

      // Determine camera ID to use
      let cameraId: string | undefined
      
      if (cameras.length > 0 && selectedCamera !== 'environment') {
        // Use specific camera if selected
        cameraId = selectedCamera
        console.log('Using selected camera:', cameraId)
      } else {
        // Try to find back camera first
        const backCamera = cameras.find(c => 
          c.label.toLowerCase().includes('back') || 
          c.label.toLowerCase().includes('rear') ||
          c.label.toLowerCase().includes('environment')
        )
        
        if (backCamera) {
          cameraId = backCamera.id
          console.log('Using back camera:', cameraId)
        } else if (cameras.length > 0) {
          cameraId = cameras[0].id
          console.log('Using first available camera:', cameraId)
        }
      }

      // Prepare camera constraints
      const cameraConfig = cameraId 
        ? cameraId 
        : { facingMode: 'environment' } // Fallback to facingMode

      console.log('Camera config:', cameraConfig)

      await scanner.start(
        cameraConfig,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        onScanSuccess,
        onScanError
      )
      
      console.log('✅ Scanner started successfully!')
    } catch (err: any) {
      console.error('❌ Scanner start error:', err)
      
      let errorMessage = 'Failed to start camera. '
      
      if (err.name === 'NotAllowedError' || err.message?.includes('Permission')) {
        errorMessage += 'Please allow camera access in your browser settings.'
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera found.'
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera is in use by another app.'
      } else if (err.message?.includes('facingMode')) {
        errorMessage += 'Try selecting a different camera below.'
      } else {
        errorMessage += err.message || 'Unknown error.'
      }
      
      setError(errorMessage)
      setIsScanning(false)
      scannerRef.current = null
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
              {/* Diagnostic Info */}
              {permissionStatus !== 'unknown' && (
                <Alert className={permissionStatus === 'granted' ? 'border-green-500 bg-green-50' : ''}>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    {permissionStatus === 'granted' ? (
                      <>
                        <strong>✅ Camera Access:</strong> Granted
                        {cameras.length > 0 && ` • ${cameras.length} camera(s) found`}
                      </>
                    ) : (
                      <>
                        <strong>❌ Camera Access:</strong> {cameraError || 'Denied'}
                      </>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {cameraError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-semibold mb-1">{cameraError}</div>
                    {permissionStatus === 'denied' && (
                      <div className="text-xs mt-2">
                        <strong>How to fix:</strong>
                        <ol className="list-decimal list-inside space-y-1 mt-1">
                          <li>Click the camera icon (🎥) in your browser's address bar</li>
                          <li>Select "Allow" for camera access</li>
                          <li>Refresh this page</li>
                        </ol>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Camera Selection */}
              {cameras.length > 1 && !isScanning && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Camera:</label>
                  <select 
                    value={selectedCamera}
                    onChange={(e) => setSelectedCamera(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="environment">Default (Back Camera)</option>
                    {cameras.map(cam => (
                      <option key={cam.id} value={cam.id}>
                        {cam.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Always render the qr-reader div, but hide it when not scanning */}
              <div className={isScanning ? 'space-y-4' : 'hidden'}>
                <div id="qr-reader" className="rounded-lg overflow-hidden" />
                <Button onClick={stopScanning} variant="outline" className="w-full">
                  Stop Scanning
                </Button>
              </div>

              {!isScanning && (
                <div className="text-center py-8">
                  <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Position the QR code within the camera frame to check in
                  </p>
                  <Button 
                    onClick={startScanning} 
                    className="w-full"
                    disabled={!hasCamera || permissionStatus === 'denied'}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {permissionStatus === 'denied' ? 'Camera Access Denied' : 'Start Camera'}
                  </Button>
                  
                  {!hasCamera && (
                    <Button 
                      onClick={checkCameraAccess}
                      variant="outline" 
                      className="w-full mt-2"
                    >
                      🔄 Retry Camera Access
                    </Button>
                  )}
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

