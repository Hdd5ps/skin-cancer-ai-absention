import { useState, useEffect, useRef } from 'react'
import type { Screen, PredictResponse } from '../App'
import type { BodyLocation, ScanRecord } from '../types/scanHistory'
import { saveScan } from '../types/scanHistory'
import BodyLocationSelector from '../components/BodyLocationSelector'

interface Props { navigate: (s: Screen, result?: PredictResponse) => void }

type UploadState = 'idle' | 'uploading' | 'done' | 'location-select' | 'permission-requested' | 'permission-denied'

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/predict"
const API_KEY = import.meta.env.VITE_API_KEY || "dev-api-key-2024"

export default function CameraScreen({ navigate }: Props) {
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [scanY, setScanY] = useState(0)
  const [gateLabel, setGateLabel] = useState('')
  const [bodyLocation, setBodyLocation] = useState<BodyLocation>('other')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [pendingResult, setPendingResult] = useState<PredictResponse | null>(null)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [flashMode, setFlashMode] = useState<'off' | 'on'>('off')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (uploadState !== 'uploading') return
    let frame: number
    let start: number | null = null
    const animate = (ts: number) => {
      if (!start) start = ts
      const elapsed = (ts - start) % 2000
      setScanY(elapsed / 2000)
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [uploadState])

  // Initialize camera when component mounts
  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [facingMode])

  const startCamera = async () => {
    setPermissionError(null)
    setUploadState('permission-requested')
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      })
      
      setCameraStream(stream)
      setUploadState('idle')
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Camera access error:', error)
      setPermissionError(error instanceof Error ? error.message : 'Camera access denied')
      setUploadState('permission-denied')
    }
  }

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
  }

  const switchCamera = () => {
    stopCamera()
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')
  }

  const toggleFlash = async () => {
    if (!cameraStream) return
    
    const videoTrack = cameraStream.getVideoTracks()[0]
    if (!videoTrack) return
    
    const capabilities = videoTrack.getCapabilities()
    if (!('torch' in capabilities)) {
      alert('Flash not available on this device')
      return
    }
    
    try {
      const newFlashMode = flashMode === 'off' ? 'on' : 'off'
      await videoTrack.applyConstraints({
        advanced: [{ torch: newFlashMode === 'on' }]
      })
      setFlashMode(newFlashMode)
    } catch (error) {
      console.error('Error toggling flash:', error)
      alert('Could not toggle flash')
    }
  }

  // Capture photo from video stream
  const handleCaptureClick = () => {
    if (!videoRef.current || !canvasRef.current) return
    
    const video = videoRef.current
    const canvas = canvasRef.current
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Draw current video frame to canvas
    const ctx = canvas.getContext('2d')
    if (ctx) {
      // Flip horizontally if using front camera
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0)
        ctx.scale(-1, 1)
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Convert to blob and upload
      canvas.toBlob(async (blob) => {
        if (!blob) return
        
        // Convert image to base64 for storage
        const reader = new FileReader()
        reader.onload = (e) => {
          setCapturedImage(e.target?.result as string)
        }
        reader.readAsDataURL(blob)

        setUploadState('uploading')
        setGateLabel('Running Gate 1: blur check…')

        const formData = new FormData()
        formData.append("file", blob, 'capture.jpg')

        try {
          // Small artificial delay so the user can see your cool UI animation
          await new Promise(r => setTimeout(r, 700))
          
          const response = await fetch(API_URL, {
            method: "POST",
            body: formData,
            headers: {
              "X-API-Key": API_KEY,
            },
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.detail || `Server error: ${response.status}`)
          }

          setGateLabel('Running Gate 2: model inference…')
          const result: PredictResponse = await response.json()

          setGateLabel('Done')
          setUploadState('done')
          setPendingResult(result)
          await new Promise(r => setTimeout(r, 300))

          // Route to the correct screen based on the Dual-Gate logic
          if (result.status === 'blur_error') {
            navigate('blur-error', result)
          } else if (result.status === 'low_confidence') {
            navigate('uncertainty', result)
          } else {
            // For successful results, show location selection first
            setUploadState('location-select')
          }

        } catch (error) {
          console.error("API Error:", error)
          alert("Could not connect to the AI model. Check if Port 8000 is Public.")
          setUploadState('idle')
          setCapturedImage(null)
        }
      }, 'image/jpeg', 0.9)
    }
  }

  // Handle file upload from gallery
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Convert image to base64 for storage
    const reader = new FileReader()
    reader.onload = (e) => {
      setCapturedImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    setUploadState('uploading')
    setGateLabel('Running Gate 1: blur check…')

    const formData = new FormData()
    formData.append("file", file)

    try {
      // Small artificial delay so the user can see your cool UI animation
      await new Promise(r => setTimeout(r, 700))
      
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
        headers: {
          "X-API-Key": API_KEY,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Server error: ${response.status}`)
      }

      setGateLabel('Running Gate 2: model inference…')
      const result: PredictResponse = await response.json()

      setGateLabel('Done')
      setUploadState('done')
      setPendingResult(result)
      await new Promise(r => setTimeout(r, 300))

      // Route to the correct screen based on the Dual-Gate logic
      if (result.status === 'blur_error') {
        navigate('blur-error', result)
      } else if (result.status === 'low_confidence') {
        navigate('uncertainty', result)
      } else {
        // For successful results, show location selection first
        setUploadState('location-select')
      }

    } catch (error) {
      console.error("API Error:", error)
      alert("Could not connect to the AI model. Check if Port 8000 is Public.")
      setUploadState('idle')
      setCapturedImage(null)
    }
    
    // Clear the input so you can upload the same file again if needed
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleLocationConfirm = () => {
    if (!capturedImage || !pendingResult) return

    const scanRecord: ScanRecord = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      date: new Date().toISOString(),
      result: pendingResult,
      imageData: capturedImage,
      bodyLocation: bodyLocation,
    }

    saveScan(scanRecord)
    navigate('results', pendingResult)
  }

  const scanning = uploadState === 'uploading'
  const cameraReady = uploadState === 'idle' && cameraStream !== null

  return (
    <div className="flex flex-col h-full font-body" style={{ background: '#0a1220' }}>
      
      {/* Hidden canvas for capturing frames */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Hidden file input for gallery uploads */}
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
      />
      
      {/* Permission Request State */}
      {uploadState === 'permission-requested' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ background: '#0a1220' }}>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(59,125,232,0.2)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="animate-spin">
                <circle cx="12" cy="12" r="10" stroke="#3b7de8" strokeWidth="2" strokeOpacity="0.3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="#3b7de8" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-white text-[15px] font-medium mb-2">Requesting camera access...</p>
            <p className="text-white text-[13px] opacity-60">Please allow camera permissions</p>
          </div>
        </div>
      )}

      {/* Permission Denied State */}
      {uploadState === 'permission-denied' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ background: '#0a1220' }}>
          <div className="text-center px-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.2)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-white text-[15px] font-medium mb-2">Camera access denied</p>
            <p className="text-white text-[13px] opacity-60 mb-4">{permissionError || 'Please enable camera permissions in your browser settings'}</p>
            <button
              onClick={startCamera}
              className="px-6 py-3 rounded-xl font-medium text-white text-[14px]"
              style={{ background: '#3b7de8' }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      <div className="h-14" />
      <div className="flex items-center justify-between px-6 py-3">
        <button
          onClick={() => navigate('home')}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{ background: 'rgba(255,255,255,0.1)', minWidth: 48, minHeight: 48 }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 4L6 9l5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="flex flex-col items-center">
          <span className="font-mono text-[11px] tracking-widest uppercase text-white opacity-60">Capture Mode</span>
          {scanning && (
            <span className="font-mono text-[9px] text-blue-400 mt-0.5 animate-pulse">{gateLabel}</span>
          )}
        </div>
        <button
          onClick={switchCamera}
          disabled={!cameraReady}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 disabled:opacity-40"
          style={{ background: 'rgba(255,255,255,0.1)', minWidth: 48, minHeight: 48 }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M1 4c0-1.1.9-2 2-2h3l2-2h4l2 2h3c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V4z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="9" cy="8" r="2.5" stroke="white" strokeWidth="1.5"/>
            <path d="M13 12l2 2m0-2l-2 2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Viewfinder */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Live camera feed */}
        {cameraReady && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
            }}
          />
        )}
        
        {/* Fallback background when camera not ready */}
        {!cameraReady && (
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at 40% 50%, #1a2840 0%, #0a1220 70%)' }}
          >
            <svg width="100%" height="100%" viewBox="0 0 390 520" preserveAspectRatio="xMidYMid slice">
              <defs>
                <filter id="grain2">
                  <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
                  <feColorMatrix type="saturate" values="0"/>
                  <feBlend in="SourceGraphic" mode="overlay"/>
                </filter>
              </defs>
              <rect width="390" height="520" fill="#c49a6c" opacity="0.15" filter="url(#grain2)"/>
              <ellipse cx="195" cy="260" rx="140" ry="160" fill="#d4a574" opacity="0.12"/>
              <ellipse cx="220" cy="280" rx="60" ry="55" fill="#8B4513" opacity="0.08"/>
            </svg>
          </div>
        )}

        {/* Targeting overlay (240×240 = well above 48dp minimum) */}
        <div className="relative z-10" style={{ width: 240, height: 240 }}>
          {[
            { top: 0, left: 0 }, { top: 0, right: 0, transform: 'rotate(90deg)' },
            { bottom: 0, right: 0, transform: 'rotate(180deg)' }, { bottom: 0, left: 0, transform: 'rotate(270deg)' },
          ].map((style, i) => (
            <svg key={i} width="36" height="36" viewBox="0 0 32 32" fill="none" className="absolute" style={style as any}>
              <path d="M2 28 L2 2 L28 2" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ))}

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-10 h-10">
              <div className="absolute top-1/2 left-0 right-0 h-px" style={{ background: 'rgba(255,255,255,0.35)' }}/>
              <div className="absolute left-1/2 top-0 bottom-0 w-px" style={{ background: 'rgba(255,255,255,0.35)' }}/>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full" style={{ border: '1.5px solid rgba(255,255,255,0.7)' }}/>
            </div>
          </div>

          {scanning && (
            <div
              className="absolute left-0 right-0 h-0.5 z-20"
              style={{
                top: `${scanY * 100}%`,
                background: 'linear-gradient(90deg, transparent 0%, #3b7de8 20%, #6ba3f0 50%, #3b7de8 80%, transparent 100%)',
                boxShadow: '0 0 8px 2px rgba(59,125,232,0.5)',
                transition: 'top 50ms linear',
              }}
            />
          )}
          <div className="absolute inset-0" style={{ boxShadow: '0 0 0 200px rgba(10,18,32,0.65)' }} />
        </div>

        {/* Grid */}
        <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%" viewBox="0 0 390 520" preserveAspectRatio="none" style={{ opacity: 0.07 }}>
          {[130, 260].map(x => <line key={x} x1={x} y1="0" x2={x} y2="520" stroke="white" strokeWidth="1"/>)}
          {[173, 346].map(y => <line key={y} x1="0" y1={y} x2="390" y2={y} stroke="white" strokeWidth="1"/>)}
        </svg>
      </div>

      {/* Instruction tooltip */}
      <div className="flex justify-center px-6 py-3">
        <div
          className="flex items-center gap-2.5 px-4 py-3 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6.5" stroke="#6ba3f0" strokeWidth="1.3"/>
            <path d="M8 5v.5M8 7.5v4" stroke="#6ba3f0" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <span className="text-[12px] font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>
            {cameraReady ? 'Position lesion within the frame or tap gallery to upload' : 'Allow camera access or tap gallery to upload'}
          </span>
        </div>
      </div>

      {/* Pipeline badge */}
      <div className="flex justify-center gap-4 px-6 pb-2">
        {['Gate 1: Blur', 'Gate 2: Confidence'].map((g, i) => (
          <div key={g} className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: scanning ? '#3b7de8' : 'rgba(255,255,255,0.2)' }}/>
            <span className="font-mono text-[9px] tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>{g}</span>
          </div>
        ))}
      </div>

      {/* Location Selection Modal */}
      {uploadState === 'location-select' && capturedImage && (
        <div className="absolute inset-0 z-50 flex items-end" style={{ background: 'rgba(10,18,32,0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full bg-white rounded-t-3xl p-6 pb-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-[18px] text-ink-900">Lesion Location</h3>
              <button
                onClick={() => {
                  setUploadState('idle')
                  setCapturedImage(null)
                  setPendingResult(null)
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: '#f1f5f9' }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M12 4L4 12M4 4l8 8" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            
            <div className="mb-4 rounded-xl overflow-hidden" style={{ height: 120 }}>
              <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
            </div>

            <p className="text-[13px] text-ink-600 mb-3">Where is this lesion located?</p>
            
            <BodyLocationSelector selected={bodyLocation} onSelect={setBodyLocation} />
            
            <button
              onClick={handleLocationConfirm}
              className="w-full mt-4 py-4 rounded-2xl font-display font-bold text-white text-[17px] transition-all active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #1d56a8 0%, #2563c8 100%)',
                boxShadow: '0 8px 24px rgba(29,86,168,0.35)',
                letterSpacing: '-0.01em',
              }}
            >
              Save & View Results
            </button>
          </div>
        </div>
      )}

      {/* Controls — all targets ≥ 48×48dp */}
      <div className="flex items-center justify-between px-10 pb-24 pt-2">
        {/* Flash button */}
        <button
          onClick={toggleFlash}
          disabled={!cameraReady}
          className="rounded-2xl overflow-hidden transition-all active:scale-90 disabled:opacity-40"
          style={{ 
            width: 52, height: 52, minWidth: 48, minHeight: 48, 
            background: flashMode === 'on' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)', 
            border: flashMode === 'on' ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.2)' 
          }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M9 1L6 4H3c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h3l3 3M13 1l3 3h3c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2h-3l-3 3" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 10h4M11 8v4" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </div>
        </button>

        {/* Capture — 76px exceeds 48dp minimum */}
        <button
          onClick={handleCaptureClick}
          disabled={scanning || !cameraReady}
          className="flex items-center justify-center transition-all active:scale-95 disabled:opacity-40"
          style={{
            width: 76, height: 76,
            borderRadius: '50%',
            background: scanning ? 'rgba(59,125,232,0.3)' : (cameraReady ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)'),
            border: '4px solid rgba(255,255,255,0.4)',
            boxShadow: scanning ? '0 0 0 8px rgba(59,125,232,0.2)' : (cameraReady ? '0 8px 32px rgba(0,0,0,0.4)' : 'none'),
          }}
        >
          {scanning
            ? <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"/>
            : <div className="w-14 h-14 rounded-full" style={{ background: 'white', border: '3px solid #e2e8f0' }}/>
          }
        </button>

        {/* Gallery button - triggers file upload */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={scanning}
          className="rounded-2xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-40"
          style={{ width: 52, height: 52, minWidth: 48, minHeight: 48, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
          title="Upload from gallery"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="2" y="2" width="18" height="18" rx="2" stroke="white" strokeWidth="1.6"/>
            <circle cx="8" cy="8" r="2" fill="white"/>
            <path d="M2 14l4-4 4 4 4-4 4 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2z" stroke="white" strokeWidth="1.6" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}