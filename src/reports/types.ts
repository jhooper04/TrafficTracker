import type { ComponentType } from 'react'
import type { Entry } from '../types/entry'

export interface ReportProps {
  entries: Entry[]
}

export interface Report {
  id: string
  title: string
  description: string
  order: number
  component: ComponentType<ReportProps>
}
