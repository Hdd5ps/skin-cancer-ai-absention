import type { Screen, PredictResponse } from '../App'

interface Props {
  navigate: (s: Screen) => void
  result: PredictResponse | null
}

export default function UncertaintyScreen({ navigate, result }: Props) {
  const confidence = result?.confidence ?? 0.31
  const threshold = result?.model_metadata.confidence_threshold ?? 0.80
  const confPct = Math.round(confidence * 100)
  const thresholdPct = Math.round(threshold * 100)

  return (
    <div className="flex flex-col h-full font-body bg-white">
      <div className="h-14" />

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
        <span className="font-mono text-[11px] tracking-widest uppercase text-ink-500">Analysis Result</span>
        <div style={{ width: 48 }}/>
      </div>

      {/* Warning banner — full-width, high visibility */}
      <div
        className="mx-6 mt-2 px-4 py-4 rounded-2xl flex items-start gap-3"
        style={{ background: '#fffbeb', border: '2px solid #fcd34d' }}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#fef3c7' }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 2L20.5 18.5H1.5L11 2z" stroke="#d97706" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M11 8.5v4.5" stroke="#d97706" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="11" cy="15.5" r="1.2" fill="#d97706"/>
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-display font-bold text-[15px] leading-tight" style={{ color: '#92400e' }}>
            Model confidence is low.
          </p>
          <p className="text-[12px] mt-0.5 font-medium" style={{ color: '#b45309' }}>
            Clinical evaluation required.
          </p>
        </div>
        <div className="shrink-0 font-mono text-[9px] font-medium px-2 py-1 rounded-lg" style={{ background: '#fde68a', color: '#92400e' }}>
          GATE 2
        </div>
      </div>

      {/* Image with prediction withheld */}
      <div className="mx-6 mt-4 rounded-3xl overflow-hidden relative" style={{ height: 180 }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #d4a574 10%, #c49a6c 40%, #8B6914 60%, #b8865a 100%)' }}/>
        <svg className="absolute inset-0" width="100%" height="100%" viewBox="0 0 340 180" preserveAspectRatio="xMidYMid slice">
          <ellipse cx="170" cy="90" rx="55" ry="50" fill="#7a4010" fillOpacity="0.45"/>
        </svg>
        {/* Uncertainty hatch */}
        <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%" viewBox="0 0 340 180" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="hatch2" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="10" stroke="#d97706" strokeWidth="1" strokeOpacity="0.25"/>
            </pattern>
          </defs>
          <rect width="340" height="180" fill="url(#hatch2)"/>
        </svg>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,18,32,0.55) 0%, transparent 60%)' }}/>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-1.5 px-6 py-3 rounded-2xl" style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
              <path d="M8 8l8 8M16 8l-8 8" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="font-mono text-[10px] tracking-widest uppercase text-white opacity-60">Prediction withheld</span>
          </div>
        </div>
        {/* Blur variance OK badge */}
        <div
          className="absolute top-3 right-3 px-2 py-1 rounded-lg font-mono text-[9px]"
          style={{ background: 'rgba(5,150,105,0.85)', color: 'white' }}
        >
          Gate 1 ✓ σ²={result?.blur_variance.toFixed(0) ?? 318}
        </div>
      </div>

      {/* Confidence meter */}
      <div className="mx-6 mt-4 px-4 py-4 rounded-2xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <h3 className="font-display font-bold text-ink-900 text-[15px] leading-tight mb-3" style={{ letterSpacing: '-0.01em' }}>
          Why no prediction?
        </h3>
        <p className="text-[12px] text-ink-600 leading-relaxed mb-3">
          The calibrated MobileNetV2 (T = {result?.model_metadata.temperature ?? 1.1672}) scored below the display threshold. Showing a low-confidence prediction would be clinically misleading.
        </p>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex-1 h-2.5 rounded-full" style={{ background: '#e2e8f0', position: 'relative' }}>
            {/* Threshold marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 rounded-full"
              style={{ left: `${thresholdPct}%`, background: '#0f172a', opacity: 0.3 }}
            />
            <div className="h-full rounded-full" style={{ width: `${confPct}%`, background: 'linear-gradient(90deg, #d97706, #fbbf24)' }}/>
          </div>
          <span className="font-mono text-[12px] font-bold" style={{ color: '#d97706', width: 44, textAlign: 'right' }}>{confPct}%</span>
        </div>
        <div className="flex justify-between">
          <span className="font-mono text-[9px] text-ink-400">Model confidence</span>
          <span className="font-mono text-[9px] text-ink-400">Threshold: ≥ {thresholdPct}%</span>
        </div>
      </div>

      {/* Next steps */}
      <div className="mx-6 mt-3 flex flex-col gap-1.5">
        {[
          { step: '01', text: 'Contact a board-certified dermatologist' },
          { step: '02', text: 'Share this screening record at appointment' },
          { step: '03', text: 'Monitor lesion for visible changes' },
        ].map(({ step, text }) => (
          <div key={step} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: '#eff6ff' }}>
            <span className="font-mono text-[10px] font-medium text-med-blue-600 shrink-0" style={{ width: 24 }}>{step}</span>
            <span className="text-[12px] text-ink-700 font-medium">{text}</span>
          </div>
        ))}
      </div>

      <div className="flex-1"/>

      <div className="px-6 pb-20 flex flex-col gap-3">
        <button
          className="w-full py-4 rounded-2xl font-display font-bold text-white text-[17px] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #1d56a8 0%, #2563c8 100%)',
            boxShadow: '0 8px 24px rgba(29,86,168,0.3)',
            letterSpacing: '-0.01em',
            minHeight: 56,
          }}
        >
          Consult Dermatologist
        </button>
        <button
          onClick={() => navigate('camera')}
          className="w-full rounded-2xl font-display font-semibold text-ink-600 text-[15px] transition-all active:scale-[0.98]"
          style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', minHeight: 52 }}
        >
          Retake Image
        </button>
      </div>
    </div>
  )
}
