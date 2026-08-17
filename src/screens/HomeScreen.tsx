import type { Screen } from '../App'

interface Props { navigate: (s: Screen) => void }

export default function HomeScreen({ navigate }: Props) {
  return (
    <div className="flex flex-col h-full font-body" style={{ background: 'linear-gradient(170deg, #eff6ff 0%, #f8fafc 55%, #ffffff 100%)' }}>
      {/* Top space for status bar */}
      <div className="h-14" />

      {/* Header */}
      <div className="px-7 pt-6 pb-4">
        <div className="flex items-center gap-2.5 mb-1">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: '#1d56a8' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7" stroke="white" strokeWidth="1.5"/>
              <circle cx="9" cy="9" r="3.5" fill="white" fillOpacity="0.9"/>
              <path d="M9 2v2M9 14v2M2 9h2M14 9h2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-mono text-[11px] font-medium tracking-widest uppercase text-med-blue-700">DermaScan AI</span>
        </div>
        <h1
          className="font-display text-3xl font-bold text-ink-900 leading-tight mt-4"
          style={{ letterSpacing: '-0.02em' }}
        >
          Skin lesion<br />screening,<br />powered by AI.
        </h1>
        <p className="text-ink-500 text-[14px] leading-relaxed mt-3">
          Capture a photo of a skin lesion for AI-assisted analysis. Results are provided in seconds.
        </p>
      </div>

      {/* Illustration area */}
      <div className="mx-7 mt-2 rounded-2xl overflow-hidden relative" style={{ height: 200 }}>
        <div style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', height: '100%' }}>
          {/* Abstract medical illustration */}
          <svg width="100%" height="100%" viewBox="0 0 340 200" fill="none" preserveAspectRatio="xMidYMid meet">
            {/* Background circles - molecular/cellular feel */}
            <circle cx="270" cy="40" r="60" fill="#1d56a8" fillOpacity="0.08"/>
            <circle cx="310" cy="120" r="45" fill="#2563c8" fillOpacity="0.07"/>
            <circle cx="60" cy="160" r="50" fill="#1a4080" fillOpacity="0.06"/>
            {/* Grid lines */}
            {[0,40,80,120,160,200].map(y => (
              <line key={y} x1="0" y1={y} x2="340" y2={y} stroke="#1d56a8" strokeOpacity="0.06" strokeWidth="1"/>
            ))}
            {[0,40,80,120,160,200,240,280,320].map(x => (
              <line key={x} x1={x} y1="0" x2={x} y2="200" stroke="#1d56a8" strokeOpacity="0.06" strokeWidth="1"/>
            ))}
            {/* Central phone mockup */}
            <rect x="130" y="20" width="80" height="160" rx="14" fill="white" fillOpacity="0.9"/>
            <rect x="135" y="32" width="70" height="100" rx="4" fill="#dbeafe"/>
            {/* Scan overlay lines */}
            <rect x="148" y="50" width="44" height="44" rx="3" fill="none" stroke="#1d56a8" strokeWidth="1.5"/>
            <path d="M148 53 L148 50 L151 50" stroke="#2563c8" strokeWidth="2" strokeLinecap="round"/>
            <path d="M189 53 L189 50 L186 50" stroke="#2563c8" strokeWidth="2" strokeLinecap="round"/>
            <path d="M148 91 L148 94 L151 94" stroke="#2563c8" strokeWidth="2" strokeLinecap="round"/>
            <path d="M189 91 L189 94 L186 94" stroke="#2563c8" strokeWidth="2" strokeLinecap="round"/>
            {/* Lesion circle */}
            <circle cx="170" cy="72" r="10" fill="#3b7de8" fillOpacity="0.3"/>
            <circle cx="170" cy="72" r="6" fill="#1d56a8" fillOpacity="0.6"/>
            {/* Scan line */}
            <line x1="148" y1="72" x2="192" y2="72" stroke="#2563c8" strokeOpacity="0.7" strokeWidth="1" strokeDasharray="2 2"/>
            {/* Bottom button area */}
            <rect x="145" y="146" width="50" height="12" rx="6" fill="#1d56a8" fillOpacity="0.8"/>
            {/* Waveform / data */}
            <path d="M148 118 L155 110 L162 122 L169 108 L176 120 L183 112 L192 118" stroke="#3b7de8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            {/* Floating data points */}
            <circle cx="60" cy="70" r="4" fill="#1d56a8" fillOpacity="0.3"/>
            <circle cx="60" cy="70" r="2" fill="#1d56a8" fillOpacity="0.7"/>
            <circle cx="280" cy="80" r="5" fill="#2563c8" fillOpacity="0.25"/>
            <circle cx="280" cy="80" r="2.5" fill="#2563c8" fillOpacity="0.6"/>
            <circle cx="90" cy="140" r="3" fill="#1a4080" fillOpacity="0.3"/>
            <circle cx="90" cy="140" r="1.5" fill="#1a4080" fillOpacity="0.7"/>
          </svg>
        </div>
      </div>

      {/* Feature pills */}
      <div className="flex gap-2 px-7 mt-4">
        {['ABCDE Method', 'Instant Analysis', 'HIPAA Aware'].map(label => (
          <span
            key={label}
            className="flex-1 text-center font-mono text-[9px] font-medium tracking-wider uppercase py-1.5 rounded-lg"
            style={{ background: '#eff6ff', color: '#1d56a8', border: '1px solid #bfdbfe' }}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Disclaimer */}
      <div
        className="mx-7 mb-4 px-4 py-3 rounded-xl flex gap-3"
        style={{ background: '#fffbeb', border: '1px solid #fcd34d' }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0 mt-0.5">
          <path d="M9 1.5L16.5 14.5H1.5L9 1.5z" stroke="#d97706" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M9 7v3.5" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="9" cy="12.5" r="0.75" fill="#d97706"/>
        </svg>
        <p className="text-[11px] leading-snug font-medium" style={{ color: '#92400e' }}>
          <span className="font-semibold">Medical Disclaimer:</span> DermaScan is a screening tool only — not a diagnostic device. Always consult a qualified dermatologist for clinical evaluation.
        </p>
      </div>

      {/* CTA */}
      <div className="px-7 pb-20 flex flex-col gap-3">
        <button
          onClick={() => navigate('camera')}
          className="w-full py-4 rounded-2xl font-display font-bold text-white text-[17px] transition-all active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #1d56a8 0%, #2563c8 100%)',
            boxShadow: '0 8px 24px rgba(29,86,168,0.35)',
            letterSpacing: '-0.01em',
          }}
        >
          Scan Lesion
        </button>
        <button
          onClick={() => navigate('history')}
          className="w-full py-3 rounded-2xl font-display font-semibold text-ink-600 text-[15px] transition-all active:scale-[0.98]"
          style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}
        >
          View Scan History
        </button>
        <p className="text-center text-[11px] text-ink-500">
          By continuing, you acknowledge this is not a medical diagnosis.
        </p>
      </div>
    </div>
  )
}
