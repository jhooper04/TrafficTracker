import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line,
} from 'recharts'
import type { Report, ReportProps } from './types'
import { VISIT_TYPE_COLORS, VISIT_TYPES } from './utils'
import type { VisitType } from '../types/entry'

function ByMonthReport({ entries }: ReportProps) {
  const chartData = useMemo(() => {
    const buckets: Record<string, { month: string; Boat: number; Paddleboard: number; Hiker: number; Other: number; Total: number }> = {}

    for (const e of entries) {
      const d = new Date(e.$createdAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleDateString([], { month: 'short', year: 'numeric' })
      if (!buckets[key]) {
        buckets[key] = { month: label, Boat: 0, Paddleboard: 0, Hiker: 0, Other: 0, Total: 0 }
      }
      buckets[key][e.visit_type as VisitType]++
      buckets[key].Total++
    }

    return Object.keys(buckets).sort().map(k => buckets[k])
  }, [entries])

  if (entries.length === 0) {
    return <p className="empty-report">No entries found for this date range.</p>
  }

  return (
    <div>
      <div className="chart-section">
        <h3 className="chart-title">Visits by Month (stacked by type)</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
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
        <h3 className="chart-title">Monthly Trend (total)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="Total"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

const report: Report = {
  id: 'by-month',
  title: 'By Month',
  description: 'Monthly visit totals and seasonal trends.',
  order: 3,
  component: ByMonthReport,
}

export default report
