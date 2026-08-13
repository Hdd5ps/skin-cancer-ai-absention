import { useState, useEffect } from 'react'
import type { Screen, PredictResponse } from '../App'

interface Props { navigate: (s: Screen, result?: PredictResponse) => void }

type UploadState = 'idle' | 'uploading' | 'done'

// Simulate the dual-gated API pipeline
async function callPredictAPI(_file?: File): Promise<PredictResponse> {
  await new Promise(r => setTimeout(r, 2000))
  // Cycle through demo outcomes for demonstration
  const outcomes: PredictResponse[] = [
    {
      gate: 1, status: 'blur_error', blur_variance: 42.17, confidence: null,
      label: null, icd10: null,
      model_metadata: { architecture: 'MobileNetV2', temperature: 1.1672, validation_auc: 0.8884, calibration_ece: 0.0730, blur_threshold: 100, confidence_threshold: 0.80 },
    },
    {
      gate: 2, status: 'low_confidence', blur_variance: 318.44, confidence: 0.31,
      label: null, icd10: null,
      model_metadata: { architecture: 'MobileNetV2', temperature: 1.1672, validation_auc: 0.8884, calibration_ece: 0.0730, blur_threshold: 100, confidence_threshold: 0.80 },
    },
    {
      gate: 0, status: 'success', blur_variance: 412.89, confidence: 0.942,
      label: 'Benign Nevus', icd10: 'D22.9',
      model_metadata: { architecture: 'MobileNetV2', temperature: 1.1672, validation_auc: 0.8884, calibration_ece: 0.0730, blur_threshold: 100, confidence_threshold: 0.80 },
    },
    {
      gate: 0, status: 'success', blur_variance: 389.12, confidence: 0.876,
      label: 'Melanoma', icd10: 'C43.9',
      model_metadata: { architecture: 'MobileNetV2', temperature: 1.1672, validation_auc: 0.8884, calibration_ece: 0.0730, blur_threshold: 100, confidence_threshold: 0.80 },
    },
  ]
  const idx = Math.floor(Date.now() / 3000) % outcomes.length
  return outcomes[idx]
}

export default function CameraScreen({ navigate }: Props) {
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [scanY, setScanY] = useState(0)
  const [gateLabel, setGateLabel] = useState('')

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

  const handleCapture = async () => {
    setUploadState('uploading')
    setGateLabel('Running Gate 1: blur check…')
    await new Promise(r => setTimeout(r, 700))
    setGateLabel('Running Gate 2: model inference…')
    const result = await callPredictAPI()
    setGateLabel('Done')
    setUploadState('done')
    await new Promise(r => setTimeout(r, 300))

    if (result.status === 'blur_error') navigate('blur-error', result)
    else if (result.status === 'low_confidence') navigate('uncertainty', result)
    else navigate('results', result)
  }

  const scanning = uploadState === 'uploading'

  return (
    <div className="flex flex-col h-full font-body" style={{ background: '#0a1220' }}>
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
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{ background: 'rgba(255,255,255,0.1)', minWidth: 48, minHeight: 48 }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="2.5" fill="white"/>
            <path d="M9 2v1.5M9 14.5V16M2 9h1.5M14.5 9H16M3.9 3.9l1.1 1.1M13 13l1.1 1.1M3.9 14.1L5 13M13 5l1.1-1.1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Viewfinder */}
      <div className="flex-1 flex items-center justify-center relative">
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
            Ensure bright lighting and clear focus.
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

      {/* Controls — all targets ≥ 48×48dp */}
      <div className="flex items-center justify-between px-10 pb-24 pt-2">
        <button
          className="rounded-2xl overflow-hidden transition-all active:scale-90"
          style={{ width: 52, height: 52, minWidth: 48, minHeight: 48, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1d56a8 0%, #6ba3f0 100%)' }}/>
        </button>

        {/* Capture — 76px exceeds 48dp minimum */}
        <button
          onClick={handleCapture}
          disabled={scanning}
          className="flex items-center justify-center transition-all active:scale-95"
          style={{
            width: 76, height: 76,
            borderRadius: '50%',
            background: scanning ? 'rgba(59,125,232,0.3)' : 'rgba(255,255,255,0.95)',
            border: '4px solid rgba(255,255,255,0.4)',
            boxShadow: scanning ? '0 0 0 8px rgba(59,125,232,0.2)' : '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          {scanning
            ? <div className="w-8 h-8 rounded-full border-2 border-med-blue-500 border-t-transparent animate-spin"/>
            : <div className="w-14 h-14 rounded-full" style={{ background: 'white', border: '3px solid #e2e8f0' }}/>
          }
        </button>

        <button
          className="rounded-2xl flex items-center justify-center transition-all active:scale-90"
          style={{ width: 52, height: 52, minWidth: 48, minHeight: 48, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M3 8c0-3.3 2.7-6 6-6h8l-3-3M19 14c0 3.3-2.7 6-6 6H5l3 3" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
