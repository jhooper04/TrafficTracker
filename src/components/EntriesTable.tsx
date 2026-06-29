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

export default function EntriesTable({ entries, selectedId, onRowClick, onDelete, deletingId }: Props) {
  if (entries.length === 0) {
    return <p className="empty-state">No entries yet today. Press a button above to add one.</p>
  }

  return (
    <div className="table-wrapper">
      <table className="entries-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Type</th>
            <th>Plate</th>
            <th>State</th>
            <th>Vehicle</th>
            <th>Contacted</th>
            <th>Notes</th>
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
              <td><span className={`badge badge--${entry.visit_type.toLowerCase()}`}>{entry.visit_type}</span></td>
              <td>{entry.license_plate || '—'}</td>
              <td>{entry.state || '—'}</td>
              <td>{entry.vehicle_desc || '—'}</td>
              <td>{entry.contacted > 0 ? entry.contacted : '—'}</td>
              <td className="td-notes">{entry.notes || '—'}</td>
              <td className="history-actions" onClick={e => e.stopPropagation()}>
                <button
                  className="btn btn--sm history-delete-btn"
                  disabled={deletingId === entry.$id}
                  onClick={() => onDelete(entry.$id)}
                >
                  {deletingId === entry.$id ? '…' : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
