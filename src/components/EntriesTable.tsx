import type { Entry } from '../types/entry'

interface Props {
  entries: Entry[]
  selectedId: string | null
  onRowClick: (entry: Entry) => void
  onDelete: (id: string) => void
  deletingId: string | null
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

export default function EntriesTable({ entries, selectedId, onRowClick, onDelete, deletingId }: Props) {
  if (entries.length === 0) {
    return <p className="empty-state">No entries yet today. Press a button above to add one.</p>
  }

  return (
    <div className="table-wrapper">
      <table className="entries-table">
        <thead>
          <tr>
            <th className="td-time">Time</th>
            <th className="td-type">Type</th>
            <th className="td-desktop">Plate</th>
            <th className="td-desktop">State</th>
            <th className="td-desktop">Vehicle</th>
            <th className="td-desktop">Contacted</th>
            <th className="td-desktop td-notes">Notes</th>
            <th className="td-mobile">Details</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {entries.map(entry => (
            <tr
              key={entry.$id}
              className={`table-row ${selectedId === entry.$id ? 'table-row--selected' : ''}`}
              onClick={() => onRowClick(entry)}
            >
              <td className="td-time">{formatTime(entry.$createdAt)}</td>
              <td className="td-type"><span className={`badge badge--${entry.visit_type.toLowerCase()}`}>{entry.visit_type}</span></td>

              {/* Desktop-only columns */}
              <td className="td-desktop">{entry.license_plate || '—'}</td>
              <td className="td-desktop">{entry.state || '—'}</td>
              <td className="td-desktop">{entry.vehicle_desc || '—'}</td>
              <td className="td-desktop">{entry.contacted > 0 ? entry.contacted : '—'}</td>
              <td className="td-desktop td-notes">{entry.notes || '—'}</td>

              {/* Mobile-only stacked details cell */}
              <td className="td-mobile">
                <div className="history-details">
                  {entry.license_plate
                    ? <span className="history-plate">{entry.license_plate}{entry.state ? ` · ${entry.state}` : ''}</span>
                    : null}
                  {entry.vehicle_desc
                    ? <span className="history-meta">{entry.vehicle_desc}</span>
                    : null}
                  {entry.contacted > 0
                    ? <span className="history-meta">Contacted: {entry.contacted}</span>
                    : null}
                  {entry.notes
                    ? <span className="history-meta history-notes">{entry.notes}</span>
                    : null}
                  {!entry.license_plate && !entry.vehicle_desc && !entry.contacted && !entry.notes
                    ? <span className="history-meta">—</span>
                    : null}
                </div>
              </td>

              {/* Delete — always visible, icon button */}
              <td className="td-action" onClick={e => e.stopPropagation()}>
                <button
                  className="btn-icon btn-icon--danger"
                  disabled={deletingId === entry.$id}
                  onClick={() => onDelete(entry.$id)}
                  aria-label="Delete entry"
                >
                  {deletingId === entry.$id ? '…' : <TrashIcon />}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
