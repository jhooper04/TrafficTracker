import { useState, useEffect } from 'react'
import type { Models } from 'appwrite'
import { account, fetchTodayEntries } from './lib/appwrite'
import type { Entry } from './types/entry'
import LoginForm from './components/LoginForm'
import NavBar from './components/NavBar'
import EntriesView from './components/EntriesView'
import ReportsView from './components/ReportsView'

type View = 'entries' | 'reports'

export default function App() {
  const [authChecked, setAuthChecked] = useState(false)
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null)
  const [view, setView] = useState<View>('entries')
  const [entries, setEntries] = useState<Entry[]>([])
  const [loadingEntries, setLoadingEntries] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)

  useEffect(() => {
    account.get()
      .then(u => { setUser(u); setAuthChecked(true) })
      .catch(() => { setUser(null); setAuthChecked(true) })
  }, [])

  useEffect(() => {
    if (user) {
      loadEntries()
    }
  }, [user])

  async function loadEntries() {
    setLoadingEntries(true)
    try {
      const docs = await fetchTodayEntries()
      setEntries(docs)
    } finally {
      setLoadingEntries(false)
    }
  }

  function handleLogin(u: Models.User<Models.Preferences>) {
    setUser(u)
  }

  async function handleLogout() {
    await account.deleteSession('current')
    setUser(null)
    setEntries([])
    setSelectedEntry(null)
  }

  function handleEntryCreated(entry: Entry) {
    setEntries(prev => [entry, ...prev])
  }

  function handleEntryUpdated(updated: Entry) {
    setEntries(prev => prev.map(e => e.$id === updated.$id ? updated : e))
    setSelectedEntry(null)
  }

  if (!authChecked) return null

  if (!user) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <div className="app">
      <NavBar view={view} onViewChange={setView} onLogout={handleLogout} />
      <main className="main-content">
        {view === 'entries' ? (
          <EntriesView
            entries={entries}
            loadingEntries={loadingEntries}
            selectedEntry={selectedEntry}
            onSelectEntry={setSelectedEntry}
            onClosePanel={() => setSelectedEntry(null)}
            onEntryCreated={handleEntryCreated}
            onEntryUpdated={handleEntryUpdated}
            userId={user.$id}
          />
        ) : (
          <ReportsView />
        )}
      </main>
    </div>
  )
}
