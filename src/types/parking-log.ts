export type ParkingAction = 'increment' | 'decrement'

export interface ParkingLog {
  $id: string
  $createdAt: string
  site: string
  action: ParkingAction
  date: string
}
