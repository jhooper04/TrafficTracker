import { useState, useEffect } from 'react'
import { databases, DB_ID, TIME_LOGS_COLLECTION_ID, ID, fetchLatestTimeLog } from '../lib/appwrite'

interface Props {
  userId: string
}

const SITE = 'Bead Lake Launch'

export default function SiteSwitch({ userId }: Props) {
  const [onSite, setOnSite] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    fetchLatestTimeLog(SITE).then(log => {
      setOnSite(log?.log_type === 'arrival')
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function handleToggle() {
    setToggling(true)
    const nextType = onSite ? 'departure' : 'arrival'
    try {
      await databases.createDocument(DB_ID, TIME_LOGS_COLLECTION_ID, ID.unique(), {
        site: SITE,
        log_type: nextType,
        user_id: userId,
      })
      setOnSite(!onSite)
    } finally {
      setToggling(false)
    }
  }

  return (
    <div className="site-switch">
      <div className="site-switch__label">
        <span className={`site-switch__dot ${onSite ? 'site-switch__dot--on' : ''}`} />
        <span className="site-switch__status">
          {loading ? 'Loading…' : onSite ? 'On Site' : 'Off Site'}
        </span>
      </div>
      <button
        className={`site-switch__toggle ${onSite ? 'site-switch__toggle--on' : ''}`}
        onClick={handleToggle}
        disabled={loading || toggling}
        aria-label={onSite ? 'Clock out' : 'Clock in'}
      >
        <span className="site-switch__thumb" />
      </button>
      <span className="site-switch__action">
        {onSite ? 'Tap to clock out' : 'Tap to clock in'}
      </span>
    </div>
  )
}
