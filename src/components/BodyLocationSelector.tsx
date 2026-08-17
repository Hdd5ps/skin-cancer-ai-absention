
import type { BodyLocation } from '../types/scanHistory'
import { BODY_LOCATION_LABELS } from '../types/scanHistory'

interface Props {
  selected: BodyLocation
  onSelect: (location: BodyLocation) => void
}

export default function BodyLocationSelector({ selected, onSelect }: Props) {
  const locations: { key: BodyLocation; label: string; icon: string }[] = [
    { key: 'head', label: 'Head/Scalp', icon: '👤' },
    { key: 'neck', label: 'Neck', icon: '🦒' },
    { key: 'chest', label: 'Chest', icon: '🫁' },
    { key: 'back', label: 'Back', icon: '🦔' },
    { key: 'arm-left', label: 'Left Arm', icon: '💪' },
    { key: 'arm-right', label: 'Right Arm', icon: '💪' },
    { key: 'leg-left', label: 'Left Leg', icon: '🦵' },
    { key: 'leg-right', label: 'Right Leg', icon: '🦵' },
    { key: 'other', label: 'Other', icon: '📍' },
  ]

  return (
    <div className="grid grid-cols-3 gap-2">
      {locations.map(({ key, label, icon }) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all active:scale-[0.95]"
          style={{
            background: selected === key ? '#eff6ff' : '#f8fafc',
            border: selected === key ? '2px solid #3b7de8' : '1px solid #e2e8f0',
          }}
        >
          <span className="text-[20px]">{icon}</span>
          <span className="text-[10px] font-medium text-ink-600 text-center leading-tight">{label}</span>
        </button>
      ))}
    </div>
  )
}
