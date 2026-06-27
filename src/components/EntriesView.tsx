import { useState, useMemo } from 'react'
import type { Entry, VisitType } from '../types/entry'
import { databases, DB_ID, COLLECTION_ID, ID } from '../lib/appwrite'
import VisitButtons from './VisitButtons'
import EntriesTable from './EntriesTable'
import EntryPanel from './EntryPanel'

interface Props {
  entries: Entry[]
  loadingEntries: boolean
  selectedEntry: Entry | null
  onSelectEntry: (entry: Entry) => void
  onClosePanel: () => void
  onEntryCreated: (entry: Entry) => void
  onEntryUpdated: (entry: Entry) => void
}

export default function EntriesView({
  entries,
  loadingEntries,
  selectedEntry,
  onSelectEntry,
  onClosePanel,
  onEntryCreated,
  onEntryUpdated,
}: Props) {
  const [adding, setAdding] = useState<VisitType | null>(null)

  const counts = useMemo(() => ({
    Boat: entries.filter(e => e.visit_type === 'Boat').length,
    Paddleboard: entries.filter(e => e.visit_type === 'Paddleboard').length,
    Hiker: entries.filter(e => e.visit_type === 'Hiker').length,
    Other: entries.filter(e => e.visit_type === 'Other').length,
  }), [entries])

  async function handleAdd(type: VisitType) {
    setAdding(type)
    try {
      const doc = await databases.createDocument(DB_ID, COLLECTION_ID, ID.unique(), {
        site: 'Bead Lake Launch',
        visit_type: type,
        license_plate: '',
        state: '',
        vehicle_desc: '',
        contacted: 0,
        notes: '',
      })
      onEntryCreated(doc as unknown as Entry)
    } finally {
      setAdding(null)
    }
  }

  return (
    <div className="entries-view">
      <div className="entries-header">
        <h2 className="entries-title">
          Today's Entries
          <span className="entries-total">{entries.length} total</span>
        </h2>
        <p className="entries-date">
          {new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <VisitButtons counts={counts} onAdd={handleAdd} adding={adding} />

      {loadingEntries ? (
        <p className="loading-state">Loading entries…</p>
      ) : (
        <EntriesTable
          entries={entries}
          selectedId={selectedEntry?.$id ?? null}
          onRowClick={onSelectEntry}
        />
      )}

      <EntryPanel
        entry={selectedEntry}
        onClose={onClosePanel}
        onSave={onEntryUpdated}
      />
    </div>
  )
}
