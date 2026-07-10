import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@heroui/react'
import { BookOpen, BarChart3, PackageSearch, Play } from 'lucide-react'
import type { GameState } from '../../core/types/gameState'
import { getState, subscribe } from '../../core/state/gameStore'
import { fmt, getExpiringTomorrow } from '../utils'
import AlmanacDrawer from '../components/AlmanacDrawer'
import AdvanceModal from '../components/AdvanceModal'

export default function Layout() {
  const [state, setState] = useState<GameState>(getState())
  useEffect(() => subscribe(s => setState({ ...s })), [])

  const [almanacOpen, setAlmanacOpen] = useState(false)
  const [advanceOpen, setAdvanceOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const expiring = getExpiringTomorrow(state)

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-stone-700/50 bg-surface px-3 py-2 text-xs sm:px-4 sm:text-sm">
        {/* Left: day + balance stacked */}
        <div className="flex flex-col leading-tight">
          <span className="text-muted text-[10px] sm:text-xs">Day {state.currentDay}</span>
          <span className="font-semibold text-emerald-500 text-sm sm:text-base">
            {fmt(state.rubyBalance)} Ruby
          </span>
        </div>

        {/* Center: expiry warning chip */}
        {expiring.length > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-danger/20 px-2 py-0.5 text-[10px] text-danger font-medium">
            {expiring.length} expiring tomorrow
          </div>
        )}

        {/* Right: almanac */}
        <Button
          variant="secondary"
          size="sm"
          onPress={() => setAlmanacOpen(true)}
        >
          <BookOpen className="size-3.5" />
          <span className="hidden sm:inline">Almanac</span>
        </Button>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom dock */}
      <nav className="sticky bottom-0 z-50 flex items-center justify-around border-t border-stone-700/50 bg-surface px-2 py-1.5">
        <Button
          variant={location.pathname === '/' ? 'primary' : 'ghost'}
          size="sm"
          onPress={() => navigate('/')}
          className="flex flex-col items-center gap-0.5 min-w-0 h-auto py-1.5"
        >
          <BarChart3 className="size-5" />
          <span className="text-[10px]">Meta</span>
        </Button>

        <Button
          variant={location.pathname.startsWith('/resources') ? 'primary' : 'ghost'}
          size="sm"
          onPress={() => navigate('/resources')}
          className="flex flex-col items-center gap-0.5 min-w-0 h-auto py-1.5"
        >
          <PackageSearch className="size-5" />
          <span className="text-[10px]">Resources</span>
        </Button>

        <Button
          variant="primary"
          size="sm"
          onPress={() => setAdvanceOpen(true)}
          className="flex flex-col items-center gap-0.5 min-w-0 h-auto py-1.5 bg-emerald-600"
        >
          <Play className="size-5" />
          <span className="text-[10px]">Advance</span>
        </Button>
      </nav>

      {/* Overlays */}
      <AlmanacDrawer
        isOpen={almanacOpen}
        onClose={() => setAlmanacOpen(false)}
      />
      <AdvanceModal
        isOpen={advanceOpen}
        onClose={() => setAdvanceOpen(false)}
      />
    </>
  )
}
