import type { Screen, PredictResponse } from '../App'

interface Props {
  navigate: (s: Screen, result?: PredictResponse) => void
  result: PredictResponse | null
  imageData: string | null
}

function arcPath(pct: number, r = 46, cx = 58, cy = 58) {
  const start = -Math.PI / 2
  const end = start + (pct / 100) * 2 * Math.PI
  const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start)
  const x2 = cx + r * Math.cos(end),   y2 = cy + r * Math.sin(end)
  return `M ${x1} ${y1} A ${r} ${r} 0 ${pct > 50 ? 1 : 0} 1 ${x2} ${y2}`
}

export default function ResultsScreen({ navigate, result, imageData }: Props) {
  if (!result || result.status !== 'success') {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center font-body" style={{ background: '#f8fafc' }}>
        <h1 className="font-display text-2xl font-bold text-ink-900">No scan result yet</h1>
        <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-ink-600">
          Complete a scan to view the model output. This screening tool is not a medical diagnosis.
        </p>
        <button onClick={() => navigate('camera')} className="mt-6 rounded-2xl px-6 py-3 font-display font-bold text-white" style={{ background: '#1d56a8' }}>
          Start a Scan
        </button>
      </div>
    )
  }

  const data = result
  const label = data.label ?? 'Model output unavailable'
  const confPct = data.confidence === null ? null : Math.round(data.confidence * 100)
  const style = { color: '#1d56a8', bg: '#eff6ff', border: '#bfdbfe' }
  const hasElevatedRiskLabel = label !== 'Benign Nevus'

  return (
    <div className="flex flex-col h-full font-body" style={{ background: '#f8fafc' }}>
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
        <div className="flex flex-col items-center">
          <span className="font-mono text-[11px] tracking-widest uppercase text-ink-500">AI Results</span>
          <span className="font-mono text-[9px] text-ink-400">Gate 1 ✓ · Gate 2 ✓</span>
          <span className="font-mono text-[8px] font-medium uppercase tracking-wider text-med-blue-700">Screening only · not a diagnosis</span>
        </div>
        <button
          onClick={() => navigate('history')}
          className="rounded-full flex items-center justify-center"
          style={{ width: 48, height: 48, minWidth: 48, minHeight: 48, background: '#eff6ff' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 9a6 6 0 016-6h2M15 9a6 6 0 01-6 6H7" stroke="#1d56a8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 3L3 5l2 2M13 11l2 2-2 2" stroke="#1d56a8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Main result card */}
      <div className="mx-6 mt-2 rounded-3xl overflow-hidden" style={{ background: 'white', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        {/* Lesion image */}
        <div className="relative" style={{ height: 130 }}>
          {imageData ? (
            <img src={imageData} alt="Captured skin image" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-100 text-[12px] text-ink-500">
              Captured image unavailable
            </div>
          )}
          {/* Prediction badge */}
          <div
            className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5"
            style={{ background: style.color, color: 'white', boxShadow: `0 4px 12px ${style.color}55` }}
          >
            {!hasElevatedRiskLabel
              ? <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              : <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1.5L8.5 7.5H1.5L5 1.5z" stroke="white" strokeWidth="1.2" strokeLinejoin="round"/></svg>
            }
            Model output: {label}
          </div>
          {/* Blur variance OK */}
          <div className="absolute top-3 right-3 px-2 py-1 rounded-lg font-mono text-[9px]" style={{ background: 'rgba(5,150,105,0.85)', color: 'white' }}>
            σ² = {data.blur_variance.toFixed(0)} ✓
          </div>
        </div>

        {/* Body */}
        <div className="px-5 pt-4 pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="font-display font-bold text-[19px] text-ink-900 leading-tight" style={{ letterSpacing: '-0.02em' }}>{label}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-[11px] font-medium px-2 py-0.5 rounded" style={{ background: '#eff6ff', color: '#1d56a8', border: '1px solid #bfdbfe' }}>
                  {confPct === null ? 'Confidence unavailable' : `${confPct}% Model confidence`}
                </span>
              </div>
            </div>
            {/* Confidence donut */}
            <div className="shrink-0 relative" style={{ width: 72, height: 72 }}>
              <svg width="116" height="116" viewBox="0 0 116 116" style={{ position: 'absolute', top: -22, left: -22 }}>
                <circle cx="58" cy="58" r="46" fill="none" stroke="#e2e8f0" strokeWidth="7"/>
                {confPct !== null && <path d={arcPath(confPct)} fill="none" stroke={style.color} strokeWidth="7" strokeLinecap="round"/>}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono font-bold text-[13px] text-ink-900">{confPct === null ? 'N/A' : `${confPct}%`}</span>
                <span className="font-mono text-[7px] text-ink-400 leading-none">CONF.</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Model validation metrics */}
      <div className="mx-6 mt-3 px-4 py-3 rounded-2xl" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
        <p className="font-mono text-[9px] tracking-widest uppercase text-ink-400 mb-2">Model Metadata</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Architecture', value: data.model_metadata.architecture },
            { label: 'Val AUC', value: data.model_metadata.validation_auc.toFixed(4) },
            { label: 'Calib. ECE', value: data.model_metadata.calibration_ece.toFixed(4) },
            { label: 'Temperature', value: `T=${data.model_metadata.temperature}` },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="font-mono text-[8px] text-ink-400 leading-none">{label}</span>
              <span className="font-mono text-[10px] font-medium text-ink-700">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mx-6 mt-3 px-4 py-3 rounded-2xl flex gap-3 items-start" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
          <circle cx="8" cy="8" r="6.5" stroke="#1d56a8" strokeWidth="1.2"/>
          <path d="M8 5v.5M8 7.5v4" stroke="#1d56a8" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        <p className="text-[11px] text-med-blue-800 leading-snug font-medium">
          Screening output only, not a medical diagnosis. Do not make clinical decisions from this result; consult a qualified dermatologist.
        </p>
      </div>

      <div className="flex-1"/>

      <div className="px-6 pb-20 flex flex-col gap-2.5">
        <button
          className="w-full py-4 rounded-2xl font-display font-bold text-white text-[17px] transition-all active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #1d56a8 0%, #2563c8 100%)',
            boxShadow: `0 8px 24px ${style.color}40`,
            letterSpacing: '-0.01em',
            minHeight: 56,
          }}
        >
          Discuss with a Dermatologist
        </button>
        <button
          onClick={() => navigate('home')}
          className="w-full rounded-2xl font-display font-semibold text-ink-600 text-[15px] transition-all active:scale-[0.98]"
          style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', minHeight: 52 }}
        >
          New Scan
        </button>
      </div>
    </div>
  )
}
