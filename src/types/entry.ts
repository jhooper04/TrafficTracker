export type VisitType = 'Boat' | 'Paddleboard' | 'Hiker' | 'Other'

export interface Entry {
  $id: string
  $createdAt: string
  $updatedAt: string
  site: string
  visit_type: VisitType
  license_plate: string
  state: string
  vehicle_desc: string
  contacted: number
  notes: string
}
