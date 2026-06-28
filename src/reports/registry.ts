import type { Report } from './types'

const modules = import.meta.glob<{ default: Report }>('./*.tsx', { eager: true })

export const reports: Report[] = Object.values(modules)
  .map(m => m.default)
  .filter(Boolean)
  .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
