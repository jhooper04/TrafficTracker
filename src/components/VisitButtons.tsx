import type { VisitType } from '../types/entry'

const VISIT_TYPES: VisitType[] = ['Boat', 'Paddleboard', 'Hiker', 'Other']

const ICONS: Record<VisitType, string> = {
  Boat: '⛵',
  Paddleboard: '🏄',
  Hiker: '🥾',
  Other: '🚗',
}

interface Props {
  counts: Record<VisitType, number>
  onAdd: (type: VisitType) => void
  adding: VisitType | null
}

export default function VisitButtons({ counts, onAdd, adding }: Props) {
  return (
    <div className="visit-buttons">
      {VISIT_TYPES.map(type => (
        <button
          key={type}
          className="visit-btn"
          onClick={() => onAdd(type)}
          disabled={adding !== null}
        >
          <span className="visit-btn__icon">{ICONS[type]}</span>
          <span className="visit-btn__label">{type}</span>
          <span className="visit-btn__count">
            {adding === type ? '…' : counts[type]}
          </span>
        </button>
      ))}
    </div>
  )
}
