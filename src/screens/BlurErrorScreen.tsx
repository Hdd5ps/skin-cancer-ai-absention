import type { Screen, PredictResponse } from '../App'

interface Props {
  navigate: (s: Screen) => void
  result: PredictResponse | null
}

export default function BlurErrorScreen({ navigate, result }: Props) {
  const blurVar = result?.blur_variance ?? 42.17
  const threshold = result?.model_metadata.blur_threshold ?? 100

  const indicators = [
    { label: 'Focus sharpness', value: Math.min(100, Math.round((blurVar / threshold) * 40)), bad: true },
    { label: 'Lighting uniformity', value: 28, bad: true },
    { label: 'Motion blur detected', value: 80, bad: true },
  ]

  return (
    <div className="flex flex-col h-full font-body bg-white">
      <div className="flex items-center justify-between px-6 py-3">
        <button
          onClick={() => navigate('camera')}
          className="rounded-full flex items-center justify-center"
          style={{ width: 48, height: 48, minWidth: 48, minHeight: 48, background: '#f1f5f9' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 4L6 9l5 5" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="font-mono text-[11px] tracking-widest uppercase text-ink-500">Image Review</span>
        <div style={{ width: 48 }}/>
      </div>

      {/* Blurred image */}
      <div className="mx-6 mt-2 rounded-3xl overflow-hidden relative" style={{ height: 220 }}>
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #d4a574 0%, #c49a6c 40%, #8B6914 60%, #d4a574 100%)',
            filter: 'blur(18px)',
            transform: 'scale(1.1)',
          }}
        />
        <svg className="absolute inset-0" width="100%" height="100%" viewBox="0 0 340 220" preserveAspectRatio="xMidYMid slice" style={{ filter: 'blur(14px)', opacity: 0.7 }}>
          <circle cx="160" cy="110" r="50" fill="#7a4010" fillOpacity="0.5"/>
          <circle cx="190" cy="95" r="35" fill="#4a2008" fillOpacity="0.4"/>
        </svg>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,18,32,0.7) 0%, rgba(10,18,32,0.0) 70%)' }}/>
        <div
          className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-mono text-[10px] font-medium"
          style={{ background: 'rgba(220,38,38,0.9)', color: 'white' }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <circle cx="5" cy="5" r="4" stroke="white" strokeWidth="1.2"/>
            <path d="M5 3v2.5" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
            <circle cx="5" cy="7" r="0.5" fill="white"/>
          </svg>
          GATE 1 — BLUR CHECK FAILED
        </div>
        {/* Blur variance readout */}
        <div
          className="absolute bottom-3 right-3 px-2.5 py-1.5 rounded-lg font-mono text-[10px]"
          style={{ background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.7)' }}
        >
          σ² = {blurVar.toFixed(2)} / {threshold}
        </div>
      </div>

      {/* Warning card */}
      <div className="mx-6 mt-4 rounded-2xl p-5 flex flex-col gap-4" style={{ background: '#fef2f2', border: '1.5px solid #fca5a5' }}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: '#fee2e2' }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M13 2.5L23.5 20.5H2.5L13 2.5z" stroke="#dc2626" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M13 10v5" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="13" cy="17.5" r="1.2" fill="#dc2626"/>
            </svg>
          </div>
          <div>
            <h2 className="font-display font-bold text-[18px] text-ink-900 leading-tight" style={{ letterSpacing: '-0.01em' }}>
              Image quality too low
            </h2>
            <p className="text-[12px] text-ink-500 mt-1">OpenCV Laplacian variance below threshold.</p>
          </div>
        </div>
        <p className="text-[14px] leading-relaxed text-ink-700 font-medium">
          Image quality is too low. Please retake the photo with steady lighting.
        </p>
        <div className="flex flex-col gap-2">
          {indicators.map(({ label, value, bad }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-ink-500 shrink-0" style={{ width: 148 }}>{label}</span>
              <div className="flex-1 h-1.5 rounded-full" style={{ background: '#fee2e2' }}>
                <div className="h-full rounded-full" style={{ width: `${value}%`, background: bad ? '#dc2626' : '#059669' }}/>
              </div>
              <span className="font-mono text-[10px] font-medium" style={{ color: bad ? '#dc2626' : '#059669', width: 28, textAlign: 'right' }}>{value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="mx-6 mt-3 flex gap-3">
        {[
          { icon: '☀️', tip: 'Use natural daylight or bright lamp' },
          { icon: '✋', tip: 'Rest phone against stable surface' },
        ].map(({ icon, tip }) => (
          <div key={tip} className="flex-1 rounded-xl p-3 flex gap-2 items-start" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
            <span className="text-[16px] leading-none">{icon}</span>
            <span className="text-[11px] text-med-blue-800 leading-snug font-medium">{tip}</span>
          </div>
        ))}
      </div>

      {/* Model metadata strip */}
      <div className="mx-6 mt-3 px-3 py-2 rounded-xl flex items-center justify-between" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <span className="font-mono text-[9px] text-ink-400 tracking-wider">MobileNetV2 · T={result?.model_metadata.temperature ?? 1.1672}</span>
        <span className="font-mono text-[9px] text-ink-400">AUC {result?.model_metadata.validation_auc ?? 0.8884} · ECE {result?.model_metadata.calibration_ece ?? 0.0730}</span>
      </div>

      <div className="flex-1"/>

      <div className="px-6 pb-20">
        <button
          onClick={() => navigate('camera')}
          className="w-full py-4 rounded-2xl font-display font-bold text-white text-[17px] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #1d56a8 0%, #2563c8 100%)',
            boxShadow: '0 8px 24px rgba(29,86,168,0.3)',
            letterSpacing: '-0.01em',
            minHeight: 56,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8.5" stroke="white" strokeWidth="1.5"/>
            <circle cx="10" cy="10" r="3.5" fill="white" fillOpacity="0.9"/>
          </svg>
          Retake Photo
        </button>
      </div>
    </div>
  )
}
