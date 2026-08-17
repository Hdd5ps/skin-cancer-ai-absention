import { useState } from 'react'
import HomeScreen from './screens/HomeScreen'
import CameraScreen from './screens/CameraScreen'
import BlurErrorScreen from './screens/BlurErrorScreen'
import UncertaintyScreen from './screens/UncertaintyScreen'
import ResultsScreen from './screens/ResultsScreen'
import ScanHistoryScreen from './screens/ScanHistoryScreen'

export type Screen = 'home' | 'camera' | 'blur-error' | 'uncertainty' | 'results' | 'history'

/** Mirrors PredictResponse from backend/app.py */
export interface PredictResponse {
  gate: 0 | 1 | 2
  status: 'blur_error' | 'low_confidence' | 'success'
  blur_variance: number
  confidence: number | null
  label: string | null
  icd10: string | null
  model_metadata: {
    architecture: string
    temperature: number
    validation_auc: number
    calibration_ece: number
    blur_threshold: number
    confidence_threshold: number
  }
}

// Demo fixtures — simulating real backend responses
const DEMO_RESPONSES: Record<Screen, PredictResponse | null> = {
  home: null,
  camera: null,
  history: null,
  'blur-error': {
    gate: 1, status: 'blur_error', blur_variance: 42.17, confidence: null,
    label: null, icd10: null,
    model_metadata: { architecture: 'MobileNetV2', temperature: 1.1672, validation_auc: 0.8884, calibration_ece: 0.0730, blur_threshold: 100, confidence_threshold: 0.80 },
  },
  uncertainty: {
    gate: 2, status: 'low_confidence', blur_variance: 318.44, confidence: 0.31,
    label: null, icd10: null,
    model_metadata: { architecture: 'MobileNetV2', temperature: 1.1672, validation_auc: 0.8884, calibration_ece: 0.0730, blur_threshold: 100, confidence_threshold: 0.80 },
  },
  results: {
    gate: 0, status: 'success', blur_variance: 412.89, confidence: 0.942,
    label: 'Benign Nevus', icd10: 'D22.9',
    model_metadata: { architecture: 'MobileNetV2', temperature: 1.1672, validation_auc: 0.8884, calibration_ece: 0.0730, blur_threshold: 100, confidence_threshold: 0.80 },
  },
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [apiResult, setApiResult] = useState<PredictResponse | null>(null)

  const navigate = (s: Screen, result?: PredictResponse) => {
    setApiResult(result ?? DEMO_RESPONSES[s] ?? null)
    setScreen(s)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-300 p-4">
      <div
        className="relative overflow-hidden bg-white shadow-2xl"
        style={{
          width: 390,
          height: 844,
          borderRadius: 44,
          boxShadow: '0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.08)',
        }}
      >
        {/* Status bar */}
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-8 pt-3 pb-1">
          <span className="font-mono text-[11px] font-medium text-ink-900 opacity-80">9:41</span>
          <div className="w-28 h-7 bg-ink-900 rounded-full" style={{ marginTop: -2 }} />
          <div className="flex gap-1 items-center opacity-80">
            <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" className="text-ink-900">
              <rect x="0" y="4" width="3" height="8" rx="0.5" opacity="0.4"/>
              <rect x="4.5" y="2.5" width="3" height="9.5" rx="0.5" opacity="0.6"/>
              <rect x="9" y="0.5" width="3" height="11.5" rx="0.5"/>
              <rect x="13.5" y="0" width="2" height="1.5" rx="0.3" opacity="0.5"/>
            </svg>
            <svg width="14" height="11" viewBox="0 0 14 11" fill="currentColor" className="text-ink-900">
              <path d="M7 2.5C5 2.5 3.2 3.3 2 4.6L0.5 3C2.1 1.1 4.4 0 7 0s4.9 1.1 6.5 3L12 4.6C10.8 3.3 9 2.5 7 2.5z" opacity="0.4"/>
              <path d="M7 5.5C5.8 5.5 4.7 6 4 6.8L2.5 5.2C3.6 4 5.2 3.5 7 3.5s3.4.5 4.5 1.7L10 6.8C9.3 6 8.2 5.5 7 5.5z" opacity="0.7"/>
              <circle cx="7" cy="9.5" r="1.5"/>
            </svg>
            <svg width="25" height="12" viewBox="0 0 25 12" fill="none" className="text-ink-900">
              <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="currentColor" strokeOpacity="0.35"/>
              <rect x="2" y="2" width="17" height="8" rx="2" fill="currentColor"/>
              <path d="M23 4v4a2 2 0 000-4z" fill="currentColor" fillOpacity="0.4"/>
            </svg>
          </div>
        </div>

        {/* Screen content */}
        <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: 44 }}>
          {screen === 'home'        && <HomeScreen navigate={navigate} />}
          {screen === 'camera'      && <CameraScreen navigate={navigate} />}
          {screen === 'blur-error'  && <BlurErrorScreen navigate={navigate} result={apiResult} />}
          {screen === 'uncertainty' && <UncertaintyScreen navigate={navigate} result={apiResult} />}
          {screen === 'results'     && <ResultsScreen navigate={navigate} result={apiResult} />}
          {screen === 'history'     && <ScanHistoryScreen navigate={navigate} />}
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-ink-900 rounded-full opacity-20 z-50" />

        {/* Dev nav */}
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-2 py-1.5 rounded-2xl"
          style={{ background: 'rgba(15,23,42,0.88)', backdropFilter: 'blur(12px)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
        >
          {(['home','camera','blur-error','uncertainty','results','history'] as Screen[]).map((s, i) => {
            const labels = ['①','②','③','④','⑤','⑥']
            return (
              <button
                key={s}
                onClick={() => navigate(s)}
                className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-medium transition-all"
                style={{ background: screen === s ? '#3b7de8' : 'transparent', color: screen === s ? '#fff' : 'rgba(255,255,255,0.5)' }}
              >
                {labels[i]}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
