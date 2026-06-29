type View = 'entries' | 'history' | 'reports'

interface Props {
  view: View
  onViewChange: (v: View) => void
  onLogout: () => void
}

export default function NavBar({ view, onViewChange, onLogout }: Props) {
  return (
    <nav className="navbar">
      <span className="navbar-brand">Bead Lake</span>
      <div className="navbar-links">
        <button
          className={`nav-link ${view === 'entries' ? 'nav-link--active' : ''}`}
          onClick={() => onViewChange('entries')}
        >
          Entries
        </button>
        <button
          className={`nav-link ${view === 'history' ? 'nav-link--active' : ''}`}
          onClick={() => onViewChange('history')}
        >
          History
        </button>
        <button
          className={`nav-link ${view === 'reports' ? 'nav-link--active' : ''}`}
          onClick={() => onViewChange('reports')}
        >
          Reports
        </button>
      </div>
      <button className="btn btn--ghost btn--sm" onClick={onLogout}>
        Sign Out
      </button>
    </nav>
  )
}
