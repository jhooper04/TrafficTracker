import { useState, useEffect, type FormEvent } from 'react'
import type { Entry } from '../types/entry'
import { databases, DB_ID, COLLECTION_ID } from '../lib/appwrite'

interface Props {
  entry: Entry | null
  onClose: () => void
  onSave: (updated: Entry) => void
}

export default function EntryPanel({ entry, onClose, onSave }: Props) {
  const [plate, setPlate] = useState('')
  const [state, setState] = useState('')
  const [vehicleDesc, setVehicleDesc] = useState('')
  const [contacted, setContacted] = useState(0)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (entry) {
      setPlate(entry.license_plate || '')
      setState(entry.state || '')
      setVehicleDesc(entry.vehicle_desc || '')
      setContacted(entry.contacted ?? 0)
      setNotes(entry.notes || '')
      setError('')
    }
  }, [entry])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!entry) return
    setSaving(true)
    setError('')
    try {
      const updated = await databases.updateDocument(DB_ID, COLLECTION_ID, entry.$id, {
        license_plate: plate,
        state,
        vehicle_desc: vehicleDesc,
        contacted: Number(contacted),
        notes,
      })
      onSave(updated as unknown as Entry)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const isOpen = entry !== null

  return (
    <>
      {isOpen && <div className="panel-backdrop" onClick={onClose} />}
      <div className={`entry-panel ${isOpen ? 'entry-panel--open' : ''}`}>
        {entry && (
          <>
            <div className="panel-header">
              <div>
                <h2 className="panel-title">{entry.visit_type}</h2>
                <p className="panel-subtitle">{entry.site}</p>
              </div>
              <button className="panel-close" onClick={onClose} aria-label="Close">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="panel-form">
              <div className="form-row">
                <label className="form-label">
                  License Plate
                  <input
                    type="text"
                    className="form-input"
                    value={plate}
                    onChange={e => setPlate(e.target.value.toUpperCase())}
                    placeholder="ABC1234"
                  />
                </label>
                <label className="form-label">
                  State
                  <input
                    type="text"
                    className="form-input"
                    value={state}
                    onChange={e => setState(e.target.value.toUpperCase())}
                    placeholder="WA"
                    maxLength={2}
                  />
                </label>
              </div>
              <label className="form-label">
                Vehicle Description
                <input
                  type="text"
                  className="form-input"
                  value={vehicleDesc}
                  onChange={e => setVehicleDesc(e.target.value)}
                  placeholder="Red pickup truck"
                />
              </label>
              <label className="form-label">
                People Contacted
                <input
                  type="number"
                  className="form-input"
                  value={contacted}
                  onChange={e => setContacted(Number(e.target.value))}
                  min={0}
                />
              </label>
              <label className="form-label">
                Notes
                <textarea
                  className="form-input form-textarea"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any additional notes…"
                  rows={4}
                />
              </label>
              {error && <p className="form-error">{error}</p>}
              <div className="panel-actions">
                <button type="button" className="btn btn--ghost" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </>
  )
}
