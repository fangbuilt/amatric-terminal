import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@heroui/react'
import { BookOpen, BarChart3, PackageSearch, Play, Coffee } from 'lucide-react'
import type { GameState } from '../../core/types/gameState'
import { getState, subscribe } from '../../core/state/gameStore'
import { fmt, getExpiringTomorrow } from '../utils'
import AlmanacDrawer from '../components/AlmanacDrawer'
import AdvanceModal from '../components/AdvanceModal'

function Layout() {
  const [state, setState] = useState<GameState>(getState())
  useEffect(() => subscribe(s => setState({ ...s })), [])

  const [almanacOpen, setAlmanacOpen] = useState(false)
  const [advanceOpen, setAdvanceOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const expiring = getExpiringTomorrow(state)

  return (
    <>
      {/* ---- Mobile layout ---- */}
      <div className="flex min-h-screen flex-col lg:hidden">
        <header className="sticky top-4 z-50 mx-3">
          <div className="flex items-center gap-1.5 justify-between">
            <div className="flex items-center gap-1.5">
              <div className="rounded-full bg-surface shadow-sm px-3 py-1.5 font-semibold">
                Day {state.currentDay}
              </div>
              <div className="rounded-full bg-surface shadow-sm px-3 py-1.5 font-semibold text-emerald-500">
                {fmt(state.rubyBalance)} Ruby
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {expiring.length > 0 && (
                <div className="rounded-full bg-danger/20 px-2 py-1 text-danger font-medium">
                  {expiring.length}
                </div>
              )}
              <Button variant="primary" size="sm" onPress={() => setAlmanacOpen(true)}>
                <BookOpen className="size-3.5" />
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto py-3">
          <Outlet />
        </main>
        <nav className="sticky bottom-4 z-50 mx-3 rounded-full bg-surface shadow-sm flex items-center justify-around px-4 py-1.5">
          <Button
            variant="ghost"
            size="sm"
            onPress={() => navigate('/')}
            className={`flex flex-col items-center gap-0.5 min-w-0 h-auto py-1.5 rounded-lg ${location.pathname === '/' ? 'bg-stone-100 dark:bg-stone-800 text-amber-600 dark:text-amber-400 font-medium' : 'text-muted'}`}
          >
            <BarChart3 className="size-5" />
            <span className="">Meta</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onPress={() => navigate('/resources')}
            className={`flex flex-col items-center gap-0.5 min-w-0 h-auto py-1.5 rounded-lg ${location.pathname.startsWith('/resources') ? 'bg-stone-100 dark:bg-stone-800 text-amber-600 dark:text-amber-400 font-medium' : 'text-muted'}`}
          >
            <PackageSearch className="size-5" />
            <span className="">Resources</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onPress={() => setAdvanceOpen(true)}
            className="flex flex-col items-center gap-0.5 min-w-0 h-auto py-1.5 bg-emerald-600"
          >
            <Play className="size-5" />
            <span className="">Advance</span>
          </Button>
        </nav>
      </div>

      {/* ---- Desktop / tablet-landscape layout ---- */}
      <div className="hidden lg:block min-h-screen pl-[15.5rem]">
        {/* Sidebar */}
        <nav className="fixed left-3 top-3 bottom-3 z-40 w-56 flex flex-col bg-surface p-3 gap-1.5 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 px-3 py-3 mb-1">
            <Coffee className="size-5 text-amber-500" />
            <span className="font-bold">Amatric</span>
          </div>
          <Button
            variant="ghost"
            onPress={() => navigate('/')}
            className={`w-full justify-start gap-3 h-auto py-2.5 ${location.pathname === '/' ? 'bg-stone-100 dark:bg-stone-800 text-amber-600 dark:text-amber-400 font-medium' : 'text-muted'}`}
          >
            <BarChart3 className="size-4 shrink-0" />
            <span className="">Meta</span>
          </Button>
          <Button
            variant="ghost"
            onPress={() => navigate('/resources')}
            className={`w-full justify-start gap-3 h-auto py-2.5 ${location.pathname.startsWith('/resources') ? 'bg-stone-100 dark:bg-stone-800 text-amber-600 dark:text-amber-400 font-medium' : 'text-muted'}`}
          >
            <PackageSearch className="size-4 shrink-0" />
            <span className="">Resources</span>
          </Button>
          <div className="flex-1" />
          {expiring.length > 0 && (
            <div className="mx-2 mb-1 rounded-full bg-danger/20 px-3 py-1 text-danger font-medium text-center">
              {expiring.length} expiring tomorrow
            </div>
          )}
          <Button
            variant="primary"
            onPress={() => setAdvanceOpen(true)}
            className="w-full gap-3 h-auto py-2.5 bg-emerald-600"
          >
            <Play className="size-4 shrink-0" />
            <span className="">Advance Day</span>
          </Button>
        </nav>

        {/* Content area */}
        <div className="flex flex-col min-h-screen">
          <header className="sticky top-4 z-50 mx-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Button variant="primary" size="sm" onPress={() => setAlmanacOpen(true)}>
                  <BookOpen className="size-3.5" />
                  Almanac
                </Button>
                <div className="rounded-full bg-surface shadow-sm px-3 py-1.5 font-semibold">
                  Day {state.currentDay}
                </div>
                <div className="rounded-full bg-surface shadow-sm px-3 py-1.5 font-semibold text-emerald-500">
                  {fmt(state.rubyBalance)} Ruby
                </div>
                {expiring.length > 0 && (
                  <div className="rounded-full bg-danger/20 px-2 py-1 text-danger font-medium">
                    {expiring.length} expiring tomorrow
                  </div>
                )}
              </div>
            </header>
          <main className="flex-1 overflow-y-auto py-3">
            <Outlet />
          </main>
        </div>
      </div>

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

export default Layout
