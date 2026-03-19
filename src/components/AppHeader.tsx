import type { Contest, Team } from '../types'
import { useAuth } from '../contexts/AuthContext'

interface AppHeaderProps {
  contest: Contest | null
  teams: Team[]
  problemCount: number
  liveContestTime: string
  isFrozen: boolean
  onViewChange: (view: 'dashboard' | 'contest' | 'workspace') => void
  onLogout: () => void
}

export function AppHeader({
  contest,
  teams,
  problemCount,
  liveContestTime,
  isFrozen,
  onViewChange,
  onLogout,
}: AppHeaderProps) {
  const { user } = useAuth()

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <span className="logo-mark" aria-hidden="true">
            DJ
          </span>
          <div>
            <p className="brand-name">DOMjudge</p>
            <p className="brand-sub">ICPC Contest Arena</p>
          </div>
        </div>
        <nav className="actions">
          <button type="button" onClick={() => onViewChange('dashboard')}>
            Dashboard
          </button>
          <button type="button" onClick={() => onViewChange('contest')}>
            Contest
          </button>
          <button type="button" onClick={() => onViewChange('workspace')}>
            Workspace
          </button>
          <button type="button" disabled>
            Contest: {contest?.id ?? '...'}
          </button>
          <button type="button" disabled>
            Teams: {teams.length}
          </button>
          <button type="button" disabled>
            Problems: {problemCount}
          </button>
          <span className="timer">{liveContestTime}</span>
          <span style={{ marginLeft: 'auto', paddingRight: '1rem', fontSize: '0.9rem' }}>{user?.username ?? 'Guest'}</span>
          <button type="button" onClick={onLogout} style={{ background: '#f44336', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Logout
          </button>
        </nav>
      </header>

      <section className="hero-strip">
        <h1>{contest?.formal_name || contest?.name || 'DOMjudge Contest'}</h1>
        <p>
          {isFrozen ? 'Scoreboard is currently frozen. Pending submissions may not be visible yet.' : 'Scoreboard is live. Updates refresh automatically every 15 seconds.'}
        </p>
      </section>
    </>
  )
}
