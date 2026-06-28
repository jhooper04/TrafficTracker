import { useMemo } from 'react'
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { Report, ReportProps } from './types'
import { VISIT_TYPE_COLORS, VISIT_TYPES } from './utils'

function OverviewReport({ entries }: ReportProps) {
  const stats = useMemo(() => {
    const counts = { Boat: 0, Paddleboard: 0, Hiker: 0, Other: 0 }
    let totalContacted = 0
    for (const e of entries) {
      if (e.visit_type in counts) counts[e.visit_type as keyof typeof counts]++
      totalContacted += e.contacted ?? 0
    }
    return { counts, totalContacted }
  }, [entries])

  const chartData = VISIT_TYPES.map(type => ({
    type,
    Count: stats.counts[type],
  }))

  const dateRange = useMemo(() => {
    if (entries.length === 0) return null
    const first = new Date(entries[0].$createdAt)
    const last = new Date(entries[entries.length - 1].$createdAt)
    const fmt = (d: Date) => d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
    return first.toDateString() === last.toDateString()
      ? fmt(first)
      : `${fmt(first)} – ${fmt(last)}`
  }, [entries])

  if (entries.length === 0) {
    return <p className="empty-report">No entries found for this date range.</p>
  }

  return (
    <div>
      {dateRange && <p className="report-date-range">{dateRange}</p>}

      <div className="stat-cards">
        <div className="stat-card">
          <span className="stat-card__value">{entries.length}</span>
          <span className="stat-card__label">Total Visits</span>
        </div>
        {VISIT_TYPES.map(type => (
          <div className="stat-card" key={type}>
            <span className="stat-card__value" style={{ color: VISIT_TYPE_COLORS[type] }}>
              {stats.counts[type]}
            </span>
            <span className="stat-card__label">{type}</span>
          </div>
        ))}
        <div className="stat-card">
          <span className="stat-card__value">{stats.totalContacted}</span>
          <span className="stat-card__label">People Contacted</span>
        </div>
      </div>

      <div className="chart-section">
        <h3 className="chart-title">Visits by Type</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="type" tick={{ fontSize: 13 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
            <Tooltip />
            <Bar dataKey="Count" radius={[4, 4, 0, 0]}>
              {chartData.map(d => (
                <Cell key={d.type} fill={VISIT_TYPE_COLORS[d.type]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

const report: Report = {
  id: 'overview',
  title: 'Overview',
  description: 'Total visitor counts and breakdown by type.',
  order: 1,
  component: OverviewReport,
}

export default report
