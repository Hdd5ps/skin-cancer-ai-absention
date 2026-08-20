import { useState, useEffect } from 'react'
import HomeScreen from './screens/HomeScreen'
import CameraScreen from './screens/CameraScreen'
import BlurErrorScreen from './screens/BlurErrorScreen'
import UncertaintyScreen from './screens/UncertaintyScreen'
import ResultsScreen from './screens/ResultsScreen'
import ScanHistoryScreen from './screens/ScanHistoryScreen'
import { AnalyticsService, AnalyticsEvents } from './lib/analytics'

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

  // Track screen changes for analytics
  useEffect(() => {
    const screenName = screen.replace('-', '_')
    AnalyticsService.logScreenView(screenName)
  }, [screen])

  const navigate = (s: Screen, result?: PredictResponse) => {
    setApiResult(result ?? DEMO_RESPONSES[s] ?? null)
    setScreen(s)
  }

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <div
        className="relative h-screen w-full overflow-hidden bg-white"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {screen === 'home'        && <HomeScreen navigate={navigate} />}
        {screen === 'camera'      && <CameraScreen navigate={navigate} />}
        {screen === 'blur-error'  && <BlurErrorScreen navigate={navigate} result={apiResult} />}
        {screen === 'uncertainty' && <UncertaintyScreen navigate={navigate} result={apiResult} />}
        {screen === 'results'     && <ResultsScreen navigate={navigate} result={apiResult} />}
        {screen === 'history'     && <ScanHistoryScreen navigate={navigate} />}
      </div>
    </div>
  )
}
