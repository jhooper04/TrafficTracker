import { useState, useMemo } from 'react'
import type { Role } from '../App'
import type { Entry, VisitType } from '../types/entry'
import { databases, DB_ID, COLLECTION_ID, ID, deleteEntry } from '../lib/appwrite'
import VisitButtons from './VisitButtons'
import EntriesTable from './EntriesTable'
import EntryPanel from './EntryPanel'
import SiteSwitch from './SiteSwitch'
import ParkingCounter from './ParkingCounter'

interface Props {
  entries: Entry[]
  loadingEntries: boolean
  selectedEntry: Entry | null
  onSelectEntry: (entry: Entry) => void
  onClosePanel: () => void
  onEntryCreated: (entry: Entry) => void
  onEntryUpdated: (entry: Entry) => void
  onEntryDeleted: (id: string) => void
  userId: string
  role: Role
}

export default function EntriesView({
  entries,
  loadingEntries,
  selectedEntry,
  onSelectEntry,
  onClosePanel,
  onEntryCreated,
  onEntryUpdated,
  onEntryDeleted,
  userId,
  role,
}: Props) {
  const [adding, setAdding] = useState<VisitType | null>(null)
  const [activeTab, setActiveTab] = useState<'visits' | 'operations'>('visits')
  const [deletingId, setDeletingId] = useState<string | null>(null)

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
        will_pay_online: false,
        online_receipt_confirmed: false,
      })
      onEntryCreated(doc as unknown as Entry)
    } finally {
      setAdding(null)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      await deleteEntry(id)
      onEntryDeleted(id)
    } finally {
      setDeletingId(null)
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

      <div className="ops-tabs">
        <div className="ops-tab-bar">
          <button
            className={`ops-tab${activeTab === 'visits' ? ' ops-tab--active' : ''}`}
            onClick={() => setActiveTab('visits')}
          >
            Visits
          </button>
          <button
            className={`ops-tab${activeTab === 'operations' ? ' ops-tab--active' : ''}`}
            onClick={() => setActiveTab('operations')}
          >
            Operations
          </button>
        </div>
        {activeTab === 'visits' ? (
          <VisitButtons counts={counts} onAdd={handleAdd} adding={adding} />
        ) : (
          <div className="ops-panel">
            <SiteSwitch userId={userId} />
            <ParkingCounter />
          </div>
        )}
      </div>

      {loadingEntries ? (
        <p className="loading-state">Loading entries…</p>
      ) : (
        <EntriesTable
          entries={entries}
          selectedId={selectedEntry?.$id ?? null}
          onRowClick={onSelectEntry}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      )}

      <EntryPanel
        entry={selectedEntry}
        onClose={onClosePanel}
        onSave={onEntryUpdated}
        onDelete={role === 'manager' ? (id) => onEntryDeleted(id) : undefined}
      />
    </div>
  )
}
