import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { Report, ReportProps } from './types'
import { VISIT_TYPE_COLORS, VISIT_TYPES } from './utils'
import type { VisitType } from '../types/entry'

function ByYearReport({ entries }: ReportProps) {
  const chartData = useMemo(() => {
    const buckets: Record<string, { year: string; Boat: number; Paddleboard: number; Hiker: number; Other: number; Total: number }> = {}

    for (const e of entries) {
      const year = String(new Date(e.$createdAt).getFullYear())
      if (!buckets[year]) {
        buckets[year] = { year, Boat: 0, Paddleboard: 0, Hiker: 0, Other: 0, Total: 0 }
      }
      buckets[year][e.visit_type as VisitType]++
      buckets[year].Total++
    }

    return Object.keys(buckets).sort().map(k => buckets[k])
  }, [entries])

  const peakYear = useMemo(() => {
    if (chartData.length === 0) return null
    return chartData.reduce((best, cur) => cur.Total > best.Total ? cur : best)
  }, [chartData])

  if (entries.length === 0) {
    return <p className="empty-report">No entries found for this date range.</p>
  }

  return (
    <div>
      {peakYear && (
        <div className="stat-cards">
          <div className="stat-card">
            <span className="stat-card__value">{chartData.length}</span>
            <span className="stat-card__label">Years of Data</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__value">{entries.length}</span>
            <span className="stat-card__label">Total Visits</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__value">{peakYear.year}</span>
            <span className="stat-card__label">Busiest Year</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__value">{peakYear.Total}</span>
            <span className="stat-card__label">Peak Year Visits</span>
          </div>
        </div>
      )}

      <div className="chart-section">
        <h3 className="chart-title">Annual Visits by Type</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="year" tick={{ fontSize: 13 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
            <Tooltip />
            <Legend />
            {VISIT_TYPES.map(type => (
              <Bar
                key={type}
                dataKey={type}
                stackId="a"
                fill={VISIT_TYPE_COLORS[type]}
                radius={type === 'Other' ? [4, 4, 0, 0] : undefined}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

const report: Report = {
  id: 'by-year',
  title: 'By Year',
  description: 'Annual visit totals across all recorded years.',
  order: 4,
  component: ByYearReport,
}

export default report
