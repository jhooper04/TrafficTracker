export type LogType = 'arrival' | 'departure'

export interface TimeLog {
  $id: string
  $createdAt: string
  site: string
  log_type: LogType
  user_id: string
}
