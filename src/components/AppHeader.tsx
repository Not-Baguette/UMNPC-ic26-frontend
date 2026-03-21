import { useState } from 'react'
import type { Contest, Team } from './../utils/types'
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
  liveContestTime,
  isFrozen,
  onViewChange,
  onLogout,
}: AppHeaderProps) {
  const { user } = useAuth()

  const [currPage, setCurrPage] = useState<'dashboard' | 'contest' | 'workspace'>('dashboard')

  const handleViewChange = (view: 'dashboard' | 'contest' | 'workspace') => {
    setCurrPage(view)
    onViewChange(view)
  }

  return (
    <>
      <header className="bg-[#f3f4f1] border-b-2 border-[#211f1f] sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto flex items-center h-20 px-6">

          {/* 1. Brand & Contest Identity (Left) */}
          <div className="flex items-center gap-4 shrink-0 pr-6 mr-6 border-r-2 border-[#211f1f] h-full">
            <div className="flex items-center gap-2.5">
              <div className="bg-[#211f1f] text-white font-black w-10 h-10 flex items-center justify-center rounded-full text-lg shadow-md" aria-hidden="true">
                DJ
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black uppercase tracking-tight text-[#211f1f] leading-none">
                  {contest?.formal_name || contest?.name || 'DOMjudge'}
                </h1>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className={`w-2 h-2 rounded-full ${isFrozen ? 'bg-[#fadb5e]' : 'bg-[#0736ff]'} animate-pulse`} />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700">
                    {isFrozen ? 'Frozen' : 'Live Arena'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Primary Navigation (Center) */}
          <nav className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleViewChange('dashboard')}
              className={`cursor-pointer px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider text-[#211f1f] hover:bg-primaryYellowLight transition-all active:scale-95 ${currPage === 'dashboard' ? 'bg-primaryYellow border-2 border-[#211f1f]' : ''}`}
            >
              Homepage
            </button>
            <button
              type="button"
              onClick={() => handleViewChange('contest')}
              className={`cursor-pointer px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider text-[#211f1f] hover:bg-primaryYellowLight transition-all active:scale-95 ${currPage === 'contest' ? 'bg-primaryYellow border-2 border-[#211f1f]' : ''}`}
            >
              Leaderboards
            </button>
            <button
              type="button"
              onClick={() => handleViewChange('workspace')}
              className={`cursor-pointer px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider text-[#211f1f] hover:bg-primaryYellowLight transition-all active:scale-95 ${currPage === 'workspace' ? 'bg-primaryYellow border-2 border-[#211f1f] shadow-md' : ''}`}
            >
              Problemset
            </button>
          </nav>

          {/* 3. Timer (Middle-Right) */}
          <div className="ml-auto text-right pr-6">
            <p className="text-[10px] text-gray-500 uppercase font-bold leading-none mb-1">Time Remaining</p>
            <span className="text-3xl font-mono font-black text-[#211f1f] tabular-nums leading-none tracking-tight">
              {liveContestTime}
            </span>
          </div>

          {/* 4. User Section & Logout (Right) */}
          <div className="flex items-center gap-4 pl-6 border-l-2 border-[#211f1f] h-full">
            <div className="hidden lg:block text-right">
              <p className="text-[10px] text-gray-500 font-bold uppercase leading-none">Contestant</p>
              <p className="text-sm font-extrabold text-[#211f1f] leading-tight mt-0.5">{user?.username ?? 'Guest'}</p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="bg-[#0736ff] text-white text-[11px] font-black px-6 py-2.5 rounded-lg transition-all uppercase tracking-wider shadow-lg hover:shadow-xl hover:translate-y-[-1px] active:scale-95 active:translate-y-[1px]"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
    </>
  )
}
