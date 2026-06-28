import type { VisitType } from '../types/entry'

export const VISIT_TYPES: VisitType[] = ['Boat', 'Paddleboard', 'Hiker', 'Other']

export const VISIT_TYPE_COLORS: Record<VisitType, string> = {
  Boat: '#0ea5e9',
  Paddleboard: '#10b981',
  Hiker: '#f59e0b',
  Other: '#8b5cf6',
}
