import { useState, useEffect, useCallback } from 'react'
import type { Role } from '../App'
import type { Entry } from '../types/entry'
import type { ParkingLog } from '../types/parking-log'
import type { TimeLog } from '../types/time-log'
import {
  fetchEntriesByRange,
  fetchParkingLogsByRange,
  fetchTimeLogsByRange,
  deleteEntry,
} from '../lib/appwrite'
import EntryPanel from './EntryPanel'

type Preset = 'day' | 'week' | 'month' | 'year'

type HistoryRow =
  | { kind: 'entry'; timestamp: string; data: Entry }
  | { kind: 'parking'; timestamp: string; data: ParkingLog }
  | { kind: 'timelog'; timestamp: string; data: TimeLog }

interface PeriodRange {
  start: Date
  end: Date
  label: string
}

function getPeriodRange(preset: Preset, offset: number): PeriodRange {
  const now = new Date()

  if (preset === 'day') {
    const d = new Date(now)
    d.setDate(d.getDate() + offset)
    const start = new Date(d)
    start.setHours(0, 0, 0, 0)
    const end = new Date(d)
    end.setHours(23, 59, 59, 999)
    const label = offset === 0
      ? 'Today'
      : d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    return { start, end, label }
  }

  if (preset === 'week') {
    const d = new Date(now)
    const dayOfWeek = d.getDay()
    d.setDate(d.getDate() - dayOfWeek + offset * 7)
    const start = new Date(d)
    start.setHours(0, 0, 0, 0)
    const end = new Date(d)
    end.setDate(end.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    const fmt = (dt: Date) => dt.toLocaleDateString([], { month: 'short', day: 'numeric' })
    const year = end.getFullYear()
    const label = `${fmt(start)} – ${fmt(end)}, ${year}`
    return { start, end, label }
  }

  if (preset === 'month') {
    const base = new Date(now.getFullYear(), now.getMonth() + offset, 1)
    const start = new Date(base.getFullYear(), base.getMonth(), 1, 0, 0, 0, 0)
    const end = new Date(base.getFullYear(), base.getMonth() + 1, 0, 23, 59, 59, 999)
    const label = start.toLocaleDateString([], { month: 'long', year: 'numeric' })
    return { start, end, label }
  }

  // year
  const year = now.getFullYear() + offset
  const start = new Date(year, 0, 1, 0, 0, 0, 0)
  const end = new Date(year, 11, 31, 23, 59, 59, 999)
  return { start, end, label: String(year) }
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' })
}

const PRESET_LABELS: { value: Preset; label: string }[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
]

interface Props {
  role: Role
}

export default function HistoryView({ role }: Props) {
  const [preset, setPreset] = useState<Preset>('day')
  const [offset, setOffset] = useState(0)
  const [rows, setRows] = useState<HistoryRow[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { start, end, label } = getPeriodRange(preset, offset)
  const startIso = start.toISOString()
  const endIso = end.toISOString()

  const loadData = useCallback(async () => {
    setLoading(true)
    setRows([])
    try {
      const [entries, parkingLogs, timeLogs] = await Promise.all([
        fetchEntriesByRange(start, end),
        fetchParkingLogsByRange(start, end),
        fetchTimeLogsByRange(start, end),
      ])
      const normalized: HistoryRow[] = [
        ...entries.map(e => ({ kind: 'entry' as const, timestamp: e.$createdAt, data: e })),
        ...parkingLogs.map(p => ({ kind: 'parking' as const, timestamp: p.$createdAt, data: p })),
        ...timeLogs.map(t => ({ kind: 'timelog' as const, timestamp: t.$createdAt, data: t })),
      ]
      normalized.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
      setRows(normalized)
    } finally {
      setLoading(false)
    }
  }, [startIso, endIso]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadData()
  }, [loadData])

  function handlePresetChange(p: Preset) {
    setPreset(p)
    setOffset(0)
  }

  function handleEntryUpdated(updated: Entry) {
    setRows(prev => prev.map(r =>
      r.kind === 'entry' && r.data.$id === updated.$id ? { ...r, data: updated } : r
    ))
    setSelectedEntry(null)
  }

  async function handleDelete(entryId: string) {
    setDeletingId(entryId)
    try {
      await deleteEntry(entryId)
      setRows(prev => prev.filter(r => !(r.kind === 'entry' && r.data.$id === entryId)))
      setSelectedEntry(null)
    } finally {
      setDeletingId(null)
    }
  }

  const isManager = role === 'manager'
  const showDateCol = preset !== 'day'

  return (
    <div className="history-view">
      <div className="history-filter-bar">
        <div className="history-presets">
          {PRESET_LABELS.map(({ value, label: pl }) => (
            <button
              key={value}
              className={`btn btn--sm history-preset-btn ${preset === value ? 'history-preset-btn--active' : ''}`}
              onClick={() => handlePresetChange(value)}
            >
              {pl}
            </button>
          ))}
        </div>
        <div className="history-nav">
          <button
            className="btn btn--sm btn--ghost history-nav-btn"
            onClick={() => setOffset(o => o - 1)}
            aria-label="Previous period"
          >
            ‹
          </button>
          <span className="history-period-label">{label}</span>
          <button
            className="btn btn--sm btn--ghost history-nav-btn"
            onClick={() => setOffset(o => o + 1)}
            disabled={offset >= 0}
            aria-label="Next period"
          >
            ›
          </button>
        </div>
      </div>

      {loading ? (
        <p className="loading-state">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="empty-state">No activity for this period.</p>
      ) : (
        <div className="table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>Time</th>
                {showDateCol && <th>Date</th>}
                <th>Type</th>
                <th>Details</th>
                {isManager && <th></th>}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <HistoryTableRow
                  key={row.kind + (row.data.$id)}
                  row={row}
                  isManager={isManager}
                  showDateCol={showDateCol}
                  deletingId={deletingId}
                  onRowClick={entry => setSelectedEntry(entry)}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <EntryPanel
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onSave={handleEntryUpdated}
        readOnly={!isManager}
        onDelete={isManager ? (id) => {
          setRows(prev => prev.filter(r => !(r.kind === 'entry' && r.data.$id === id)))
          setSelectedEntry(null)
        } : undefined}
      />
    </div>
  )
}

interface RowProps {
  row: HistoryRow
  isManager: boolean
  showDateCol: boolean
  deletingId: string | null
  onRowClick: (entry: Entry) => void
  onDelete: (id: string) => void
}

function HistoryTableRow({ row, isManager, showDateCol, deletingId, onRowClick, onDelete }: RowProps) {
  const time = formatTime(row.timestamp)
  const date = formatDate(row.timestamp)

  if (row.kind === 'entry') {
    const entry = row.data
    const isDeleting = deletingId === entry.$id

    return (
      <tr className="table-row" onClick={() => onRowClick(entry)}>
        <td className="td-time">{time}</td>
        {showDateCol && <td className="td-time">{date}</td>}
        <td className="ht-type">
          <span className={`badge badge--${entry.visit_type.toLowerCase()}`}>
            {entry.visit_type}
          </span>
        </td>
        <td className="history-details">
          {entry.license_plate
            ? <span className="history-plate">{entry.license_plate}{entry.state ? ` · ${entry.state}` : ''}</span>
            : null}
          {entry.vehicle_desc
            ? <span className="history-meta">{entry.vehicle_desc}</span>
            : null}
          {entry.notes
            ? <span className="history-meta history-notes">{entry.notes}</span>
            : null}
          {!entry.license_plate && !entry.vehicle_desc && !entry.notes
            ? <span className="history-meta">—</span>
            : null}
        </td>
        {isManager && (
          <td className="history-actions" onClick={e => e.stopPropagation()}>
            <button
              className="btn btn--sm history-delete-btn"
              disabled={isDeleting}
              onClick={() => onDelete(entry.$id)}
            >
              {isDeleting ? '…' : 'Delete'}
            </button>
          </td>
        )}
      </tr>
    )
  }

  if (row.kind === 'parking') {
    const log = row.data
    return (
      <tr>
        <td className="td-time">{time}</td>
        {showDateCol && <td className="td-time">{date}</td>}
        <td className="ht-type"><span className="badge badge--parking">Parking</span></td>
        <td className="history-details">
          <span className="history-meta">
            {log.action === 'increment' ? 'Spot occupied (+1)' : 'Spot freed (−1)'}
          </span>
        </td>
        {isManager && <td className="history-actions"></td>}
      </tr>
    )
  }

  // timelog
  const log = row.data
  return (
    <tr>
      <td className="td-time">{time}</td>
      {showDateCol && <td className="td-time">{date}</td>}
      <td className="ht-type"><span className="badge badge--clock">Clock</span></td>
      <td className="history-details">
        <span className="history-meta">
          {log.log_type === 'arrival' ? 'Clocked In' : 'Clocked Out'}
        </span>
      </td>
      {isManager && <td className="history-actions"></td>}
    </tr>
  )
}
