import { useState, useEffect, useCallback } from 'react'
import { reports } from '../reports/registry'
import { fetchEntriesByRange } from '../lib/appwrite'
import type { Entry } from '../types/entry'

type Preset = 'today' | 'week' | 'month' | 'year' | 'all' | 'custom'

function toDateInput(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function presetRange(preset: Exclude<Preset, 'custom'>): { start: Date; end: Date } {
  const now = new Date()
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)

  switch (preset) {
    case 'today': {
      const start = new Date(now)
      start.setHours(0, 0, 0, 0)
      return { start, end }
    }
    case 'week': {
      const start = new Date(now)
      start.setDate(now.getDate() - now.getDay())
      start.setHours(0, 0, 0, 0)
      return { start, end }
    }
    case 'month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      return { start, end }
    }
    case 'year': {
      const start = new Date(now.getFullYear(), 0, 1)
      return { start, end }
    }
    case 'all': {
      const start = new Date(2020, 0, 1)
      return { start, end }
    }
  }
}

const PRESETS: { id: Preset; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'year', label: 'This Year' },
  { id: 'all', label: 'All Time' },
]

const defaultRange = presetRange('month')

export default function ReportsView() {
  const [selectedId, setSelectedId] = useState(reports[0]?.id ?? '')
  const [activePreset, setActivePreset] = useState<Preset>('month')
  const [startDate, setStartDate] = useState(toDateInput(defaultRange.start))
  const [endDate, setEndDate] = useState(toDateInput(defaultRange.end))
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)

  const loadEntries = useCallback(async (start: string, end: string) => {
    setLoading(true)
    try {
      const startDt = new Date(start + 'T00:00:00')
      const endDt = new Date(end + 'T23:59:59.999')
      const data = await fetchEntriesByRange(startDt, endDt)
      setEntries(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEntries(startDate, endDate)
  }, [startDate, endDate, loadEntries])

  function applyPreset(preset: Exclude<Preset, 'custom'>) {
    const range = presetRange(preset)
    setActivePreset(preset)
    setStartDate(toDateInput(range.start))
    setEndDate(toDateInput(range.end))
  }

  function handleStartChange(val: string) {
    setStartDate(val)
    setActivePreset('custom')
  }

  function handleEndChange(val: string) {
    setEndDate(val)
    setActivePreset('custom')
  }

  const activeReport = reports.find(r => r.id === selectedId)
  const ActiveComponent = activeReport?.component

  return (
    <div className="reports-view">
      <aside className="reports-sidebar">
        <div className="reports-controls">
          <p className="reports-controls__label">Date Range</p>
          <div className="date-presets">
            {PRESETS.map(p => (
              <button
                key={p.id}
                className={`btn btn--sm date-preset-btn${activePreset === p.id ? ' date-preset-btn--active' : ''}`}
                onClick={() => applyPreset(p.id as Exclude<Preset, 'custom'>)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="date-inputs">
            <label className="date-input-label">
              From
              <input
                type="date"
                className="form-input"
                value={startDate}
                max={endDate}
                onChange={e => handleStartChange(e.target.value)}
              />
            </label>
            <label className="date-input-label">
              To
              <input
                type="date"
                className="form-input"
                value={endDate}
                min={startDate}
                onChange={e => handleEndChange(e.target.value)}
              />
            </label>
          </div>
        </div>

        <nav className="reports-nav">
          <p className="reports-nav__label">Reports</p>
          {reports.map(r => (
            <button
              key={r.id}
              className={`reports-nav-item${selectedId === r.id ? ' reports-nav-item--active' : ''}`}
              onClick={() => setSelectedId(r.id)}
            >
              <span className="reports-nav-item__title">{r.title}</span>
              <span className="reports-nav-item__desc">{r.description}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="reports-content">
        {activeReport && (
          <div className="report-header">
            <h2 className="report-header__title">{activeReport.title}</h2>
            <p className="report-header__desc">{activeReport.description}</p>
          </div>
        )}

        {loading ? (
          <p className="loading-state">Loading data…</p>
        ) : ActiveComponent ? (
          <ActiveComponent entries={entries} />
        ) : (
          <p className="empty-report">Select a report from the sidebar.</p>
        )}
      </div>
    </div>
  )
}
