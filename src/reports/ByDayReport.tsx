import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { Report, ReportProps } from './types'
import { VISIT_TYPE_COLORS, VISIT_TYPES } from './utils'
import type { VisitType } from '../types/entry'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function ByDayReport({ entries }: ReportProps) {
  const chartData = useMemo(() => {
    const buckets = DAY_LABELS.map(day => ({
      day,
      Boat: 0,
      Paddleboard: 0,
      Hiker: 0,
      Other: 0,
      Total: 0,
    }))

    for (const e of entries) {
      const dow = new Date(e.$createdAt).getDay()
      buckets[dow][e.visit_type as VisitType]++
      buckets[dow].Total++
    }

    return buckets
  }, [entries])

  if (entries.length === 0) {
    return <p className="empty-report">No entries found for this date range.</p>
  }

  return (
    <div>
      <div className="chart-section">
        <h3 className="chart-title">Visits by Day of Week</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="day" tick={{ fontSize: 13 }} />
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

      <div className="chart-section">
        <h3 className="chart-title">Total by Day of Week</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="day" tick={{ fontSize: 13 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
            <Tooltip />
            <Bar dataKey="Total" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

const report: Report = {
  id: 'by-day',
  title: 'By Day of Week',
  description: 'Which days of the week see the most traffic.',
  order: 2,
  component: ByDayReport,
}

export default report
