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

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [apiResult, setApiResult] = useState<PredictResponse | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)

  // Track screen changes for analytics
  useEffect(() => {
    const screenName = screen.replace('-', '_')
    AnalyticsService.logScreenView(screenName)
  }, [screen])

  const navigate = (s: Screen, result?: PredictResponse, imageData?: string) => {
    setApiResult(result ?? null)
    setCapturedImage(imageData ?? null)
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
        {screen === 'results'     && <ResultsScreen navigate={navigate} result={apiResult} imageData={capturedImage} />}
        {screen === 'history'     && <ScanHistoryScreen navigate={navigate} />}
      </div>
    </div>
  )
}
