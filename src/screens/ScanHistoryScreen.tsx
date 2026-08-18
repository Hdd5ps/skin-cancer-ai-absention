import { useState, useEffect } from 'react'
import type { Screen } from '../App'
import type { ScanRecord, BodyLocation } from '../types/scanHistory'
import { getScanHistory, deleteScan, clearScanHistory, BODY_LOCATION_LABELS } from '../types/scanHistory'

interface Props { navigate: (s: Screen) => void }

const STYLE: Record<string, { color: string; bg: string; border: string }> = {
  'Benign Nevus':           { color: '#059669', bg: '#ecfdf5', border: '#6ee7b7' },
  'Melanoma':               { color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
  'Basal Cell Carcinoma':   { color: '#d97706', bg: '#fffbeb', border: '#fcd34d' },
}

export default function ScanHistoryScreen({ navigate }: Props) {
  const [history, setHistory] = useState<ScanRecord[]>([])
  const [selectedScan, setSelectedScan] = useState<ScanRecord | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'compare'>('list')
  const [compareScanId, setCompareScanId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Load history on mount
  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const data = await getScanHistory()
      setHistory(data)
    } catch (error) {
      console.error('Failed to load history:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this scan record?')) {
      await deleteScan(id)
      await loadHistory()
      if (selectedScan?.id === id) {
        setSelectedScan(null)
        setViewMode('list')
      }
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRiskLevel = (label: string) => {
    if (label === 'Benign Nevus') return 'Low Risk'
    if (label === 'Melanoma') return 'High Risk'
    return 'Moderate Risk'
  }

  if (viewMode === 'list' && history.length === 0) {
    return (
      <div className="flex flex-col h-full font-body" style={{ background: '#f8fafc' }}>
        <div className="h-14" />
        
        <div className="flex items-center justify-between px-6 py-3">
          <button
            onClick={() => navigate('home')}
            className="rounded-full flex items-center justify-center"
            style={{ width: 48, height: 48, minWidth: 48, minHeight: 48, background: '#f1f5f9' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 4L6 9l5 5" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="font-mono text-[11px] tracking-widest uppercase text-ink-500">Scan History</span>
          <div style={{ width: 48 }}/>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: '#eff6ff' }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M20 4c-8.8 0-16 7.2-16 16s7.2 16 16 16 16-7.2 16-16S28.8 4 20 4z" stroke="#1d56a8" strokeWidth="2" fill="none"/>
              <path d="M20 12v8M20 28v-4" stroke="#1d56a8" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className="font-display font-bold text-[20px] text-ink-900 mb-2">No scan history yet</h2>
          <p className="text-ink-500 text-[14px] text-center mb-6">
            Start scanning lesions to build your monitoring history
          </p>
          <button
            onClick={() => navigate('camera')}
            className="px-6 py-3 rounded-2xl font-display font-bold text-white text-[15px]"
            style={{
              background: 'linear-gradient(135deg, #1d56a8 0%, #2563c8 100%)',
              boxShadow: '0 8px 24px rgba(29,86,168,0.35)',
            }}
          >
            Start First Scan
          </button>
        </div>
      </div>
    )
  }

  if (viewMode === 'list') {
    return (
      <div className="flex flex-col h-full font-body" style={{ background: '#f8fafc' }}>
        <div className="h-14" />
        
        <div className="flex items-center justify-between px-6 py-3">
          <button
            onClick={() => navigate('home')}
            className="rounded-full flex items-center justify-center"
            style={{ width: 48, height: 48, minWidth: 48, minHeight: 48, background: '#f1f5f9' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 4L6 9l5 5" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="flex flex-col items-center">
            <span className="font-mono text-[11px] tracking-widest uppercase text-ink-500">Scan History</span>
            <span className="font-mono text-[9px] text-ink-400">{history.length} scans</span>
          </div>
          <button
            onClick={() => navigate('camera')}
            className="rounded-full flex items-center justify-center"
            style={{ width: 48, height: 48, minWidth: 48, minHeight: 48, background: '#1d56a8' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7" stroke="white" strokeWidth="1.5"/>
              <circle cx="9" cy="9" r="3.5" fill="white" fillOpacity="0.9"/>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ paddingBottom: 100 }}>
          <div className="flex flex-col gap-3">
            {history.map((scan) => {
              const label = scan.result.label ?? 'Unknown'
              const style = STYLE[label] || STYLE['Benign Nevus']
              const confPct = Math.round((scan.result.confidence ?? 0) * 100)
              
              return (
                <div
                  key={scan.id}
                  onClick={() => {
                    setSelectedScan(scan)
                    setViewMode('detail')
                  }}
                  className="rounded-2xl overflow-hidden cursor-pointer transition-all active:scale-[0.98]"
                  style={{ background: 'white', border: '1.5px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
                >
                  <div className="flex">
                    <div className="relative" style={{ width: 100, height: 100 }}>
                      <img 
                        src={scan.imageData} 
                        alt="Scan" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.3) 0%, transparent 50%)' }} />
                    </div>
                    <div className="flex-1 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-display font-bold text-[15px] text-ink-900 leading-tight">{label}</h3>
                          <p className="font-mono text-[10px] text-ink-400 mt-0.5">{formatDate(scan.timestamp)}</p>
                        </div>
                        <div
                          className="px-2 py-1 rounded-lg font-mono text-[9px] font-bold"
                          style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}
                        >
                          {confPct}%
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[11px] text-ink-500">{BODY_LOCATION_LABELS[scan.bodyLocation]}</span>
                        <span className="text-[11px] text-ink-400">•</span>
                        <span className="text-[11px]" style={{ color: style.color }}>{getRiskLevel(label)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={async () => {
              if (confirm('Clear all scan history?')) {
                await clearScanHistory()
                await loadHistory()
              }
            }}
            className="px-4 py-2 rounded-xl font-mono text-[10px] font-medium text-ink-400"
            style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #e2e8f0' }}
          >
            Clear History
          </button>
        </div>
      </div>
    )
  }

  if (viewMode === 'detail' && selectedScan) {
    const label = selectedScan.result.label ?? 'Unknown'
    const style = STYLE[label] || STYLE['Benign Nevus']
    const confPct = Math.round((selectedScan.result.confidence ?? 0) * 100)
    const isMalignant = label !== 'Benign Nevus'

    return (
      <div className="flex flex-col h-full font-body" style={{ background: '#f8fafc' }}>
        <div className="h-14" />
        
        <div className="flex items-center justify-between px-6 py-3">
          <button
            onClick={() => {
              setSelectedScan(null)
              setViewMode('list')
            }}
            className="rounded-full flex items-center justify-center"
            style={{ width: 48, height: 48, minWidth: 48, minHeight: 48, background: '#f1f5f9' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 4L6 9l5 5" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="font-mono text-[11px] tracking-widest uppercase text-ink-500">Scan Details</span>
          <button
            onClick={() => handleDelete(selectedScan.id)}
            className="rounded-full flex items-center justify-center"
            style={{ width: 48, height: 48, minWidth: 48, minHeight: 48, background: '#fef2f2' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 6h12M6 6v8a2 2 0 002 2h4a2 2 0 002-2V6M6 6L5 4M12 6l1-2" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ paddingBottom: 100 }}>
          {/* Image */}
          <div className="rounded-2xl overflow-hidden mb-4" style={{ height: 200 }}>
            <img 
              src={selectedScan.imageData} 
              alt="Scan" 
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 px-2 py-1 rounded-lg font-mono text-[9px] text-white" style={{ background: 'rgba(0,0,0,0.5)' }}>
              {formatDate(selectedScan.timestamp)}
            </div>
          </div>

          {/* Result card */}
          <div className="rounded-2xl p-4 mb-4" style={{ background: 'white', border: '1.5px solid #e2e8f0' }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h2 className="font-display font-bold text-[18px] text-ink-900">{label}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-[11px] font-medium px-2 py-0.5 rounded" style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}>
                    ICD-10: {selectedScan.result.icd10}
                  </span>
                  <span className="font-mono text-[11px] font-medium px-2 py-0.5 rounded" style={{ background: '#eff6ff', color: '#1d56a8', border: '1px solid #bfdbfe' }}>
                    {confPct}% Confident
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[24px] font-bold" style={{ color: style.color }}>{confPct}%</div>
                <div className="font-mono text-[8px] text-ink-400">CONFIDENCE</div>
              </div>
            </div>

            <div className="mt-3 pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-mono text-[9px] text-ink-400">LOCATION</span>
                  <p className="text-[13px] text-ink-700 font-medium">{BODY_LOCATION_LABELS[selectedScan.bodyLocation]}</p>
                </div>
                <div>
                  <span className="font-mono text-[9px] text-ink-400">BLUR VARIANCE</span>
                  <p className="text-[13px] text-ink-700 font-medium">σ² = {selectedScan.result.blur_variance.toFixed(0)}</p>
                </div>
              </div>
            </div>

            {selectedScan.notes && (
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
                <span className="font-mono text-[9px] text-ink-400">NOTES</span>
                <p className="text-[13px] text-ink-700 mt-1">{selectedScan.notes}</p>
              </div>
            )}
          </div>

          {/* Compare section */}
          {history.length > 1 && (
            <div className="rounded-2xl p-4" style={{ background: 'white', border: '1.5px solid #e2e8f0' }}>
              <h3 className="font-display font-bold text-[15px] text-ink-900 mb-3">Compare with previous scan</h3>
              <div className="flex flex-col gap-2">
                {history
                  .filter(s => s.id !== selectedScan.id)
                  .slice(0, 3)
                  .map(scan => (
                    <button
                      key={scan.id}
                      onClick={() => {
                        setCompareScanId(scan.id)
                        setViewMode('compare')
                      }}
                      className="flex items-center gap-3 p-2 rounded-xl transition-all active:scale-[0.98]"
                      style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                    >
                      <img 
                        src={scan.imageData} 
                        alt="Scan" 
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 text-left">
                        <p className="text-[13px] font-medium text-ink-900">{scan.result.label}</p>
                        <p className="font-mono text-[10px] text-ink-400">{formatDate(scan.timestamp)}</p>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 3l5 5-5 5" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pb-20">
          <button
            onClick={() => navigate('camera')}
            className="w-full py-4 rounded-2xl font-display font-bold text-white text-[17px] transition-all active:scale-[0.98]"
            style={{
              background: isMalignant ? 'linear-gradient(135deg, #991b1b 0%, #dc2626 100%)' : 'linear-gradient(135deg, #1d56a8 0%, #2563c8 100%)',
              boxShadow: `0 8px 24px ${style.color}40`,
              letterSpacing: '-0.01em',
              minHeight: 56,
            }}
          >
            {isMalignant ? 'Book Dermatologist Now' : 'Retake Scan'}
          </button>
        </div>
      </div>
    )
  }

  if (viewMode === 'compare' && selectedScan && compareScanId) {
    const compareScan = history.find(s => s.id === compareScanId)
    if (!compareScan) {
      setViewMode('detail')
      return null
    }

    return (
      <div className="flex flex-col h-full font-body" style={{ background: '#f8fafc' }}>
        <div className="h-14" />
        
        <div className="flex items-center justify-between px-6 py-3">
          <button
            onClick={() => {
              setCompareScanId(null)
              setViewMode('detail')
            }}
            className="rounded-full flex items-center justify-center"
            style={{ width: 48, height: 48, minWidth: 48, minHeight: 48, background: '#f1f5f9' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 4L6 9l5 5" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="font-mono text-[11px] tracking-widest uppercase text-ink-500">Comparison</span>
          <div style={{ width: 48 }}/>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ paddingBottom: 100 }}>
          <div className="grid grid-cols-2 gap-3">
            {/* Current scan */}
            <div>
              <p className="font-mono text-[10px] text-ink-400 mb-2 text-center">CURRENT</p>
              <div className="rounded-xl overflow-hidden" style={{ height: 150 }}>
                <img 
                  src={selectedScan.imageData} 
                  alt="Current" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-2 text-center">
                <p className="text-[13px] font-medium text-ink-900">{selectedScan.result.label}</p>
                <p className="font-mono text-[10px] text-ink-400">{formatDate(selectedScan.timestamp)}</p>
                <p className="text-[12px]" style={{ color: STYLE[selectedScan.result.label || 'Benign Nevus']?.color }}>
                  {Math.round((selectedScan.result.confidence ?? 0) * 100)}% confident
                </p>
              </div>
            </div>

            {/* Previous scan */}
            <div>
              <p className="font-mono text-[10px] text-ink-400 mb-2 text-center">PREVIOUS</p>
              <div className="rounded-xl overflow-hidden" style={{ height: 150 }}>
                <img 
                  src={compareScan.imageData} 
                  alt="Previous" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-2 text-center">
                <p className="text-[13px] font-medium text-ink-900">{compareScan.result.label}</p>
                <p className="font-mono text-[10px] text-ink-400">{formatDate(compareScan.timestamp)}</p>
                <p className="text-[12px]" style={{ color: STYLE[compareScan.result.label || 'Benign Nevus']?.color }}>
                  {Math.round((compareScan.result.confidence ?? 0) * 100)}% confident
                </p>
              </div>
            </div>
          </div>

          {/* Analysis */}
          <div className="mt-4 rounded-2xl p-4" style={{ background: 'white', border: '1.5px solid #e2e8f0' }}>
            <h3 className="font-display font-bold text-[15px] text-ink-900 mb-3">Evolution Analysis</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-ink-600">Time difference</span>
                <span className="font-mono text-[13px] font-medium text-ink-900">
                  {Math.round((selectedScan.timestamp - compareScan.timestamp) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-ink-600">Classification change</span>
                <span className="font-mono text-[13px] font-medium" style={{ 
                  color: selectedScan.result.label === compareScan.result.label ? '#059669' : '#d97706' 
                }}>
                  {selectedScan.result.label === compareScan.result.label ? 'No change' : 'Changed'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-ink-600">Confidence change</span>
                <span className="font-mono text-[13px] font-medium text-ink-900">
                  {Math.round(((selectedScan.result.confidence ?? 0) - (compareScan.result.confidence ?? 0)) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Medical note */}
          <div className="mt-3 px-4 py-3 rounded-xl flex gap-3 items-start" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
              <circle cx="8" cy="8" r="6.5" stroke="#1d56a8" strokeWidth="1.2"/>
              <path d="M8 5v.5M8 7.5v4" stroke="#1d56a8" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <p className="text-[11px] text-med-blue-800 leading-snug font-medium">
              Regular monitoring helps detect changes in lesion characteristics. Share comparisons with your dermatologist.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
}
