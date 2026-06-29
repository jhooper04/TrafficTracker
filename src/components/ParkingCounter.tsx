import { useState, useEffect } from 'react'
import { databases, DB_ID, PARKING_LOGS_COLLECTION_ID, ID, fetchTodayParkingLogs } from '../lib/appwrite'

const SITE = 'Bead Lake Launch'

function todayString() {
  return new Date().toISOString().slice(0, 10)
}

export default function ParkingCounter() {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchTodayParkingLogs(SITE).then(logs => {
      const total = logs.reduce((sum, log) => sum + (log.action === 'increment' ? 1 : -1), 0)
      setCount(Math.max(0, total))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function record(action: 'increment' | 'decrement') {
    const next = action === 'increment' ? count + 1 : Math.max(0, count - 1)
    setCount(next)
    setSaving(true)
    try {
      await databases.createDocument(DB_ID, PARKING_LOGS_COLLECTION_ID, ID.unique(), {
        site: SITE,
        action,
        date: todayString(),
      })
    } catch {
      setCount(count)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="parking-counter">
      <p className="parking-counter__label">Parking Spots Occupied</p>
      <div className="parking-counter__controls">
        <button
          className="parking-counter__btn"
          onClick={() => record('decrement')}
          disabled={loading || saving || count === 0}
          aria-label="Decrease"
        >−</button>
        <span className="parking-counter__count">
          {loading ? '…' : count}
        </span>
        <button
          className="parking-counter__btn"
          onClick={() => record('increment')}
          disabled={loading || saving}
          aria-label="Increase"
        >+</button>
      </div>
    </div>
  )
}
