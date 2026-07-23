import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastProvider, Button } from '@heroui/react'
import type { GameState } from '../core/types/gameState'
import { getState, setState, subscribe } from '../core/state/gameStore'
import { CONSTANTS } from '../core/constants/data'
import Layout from './routes/Layout'
import MetaPage from './routes/MetaPage'
import ResourcesPage from './routes/ResourcesPage'
import IntroOverlay from './components/IntroOverlay'
import { loadGame, clearSave, autoSave, migrateSave } from './saveManager'
import { fmt } from './utils'

export default function App() {
  const [state, setLocalState] = useState<GameState>(getState())
  const [showIntro, setShowIntro] = useState(() => !localStorage.getItem('amatric_intro_shown'))
  const [loaded, setLoaded] = useState(false)

  // Load saved game from IndexedDB on mount
  useEffect(() => {
    loadGame().then(saved => {
      if (saved) {
        const migrated = migrateSave(saved)
        setState(migrated)
        setLocalState({ ...migrated })
      }
      setLoaded(true)
    }).catch(() => setLoaded(true))

    // Register service worker
    navigator.serviceWorker?.register('/sw.js')
  }, [])

  // Subscribe to state changes for local rendering + auto-save
  useEffect(() => {
    const unsub = subscribe(s => {
      setLocalState({ ...s })
      autoSave(s)
    })
    return unsub
  }, [])

  // Game-over: bankruptcy
  if (state.isBankrupt) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="max-w-sm text-center">
          <h1 className="font-bold text-danger mb-2">Game Over</h1>
          <p className="text-muted mb-4">
            Bayu is bankrupt. The campus revoked your license due to negative cash flow.
          </p>
          <Button
            variant="primary"
            onPress={() => { clearSave().then(() => window.location.reload()) }}
          >
            Restart Game
          </Button>
        </div>
      </div>
    )
  }

  // Game-over: break-even deadline failed
  const breakEvenFailed =
    state.businessDay > CONSTANTS.BREAK_EVEN.days &&
    state.accumulatedNetProfit < CONSTANTS.BREAK_EVEN.target

  return (
    <>
      <ToastProvider placement="top end" className="toast-container z-[9999]" />

      {showIntro && <IntroOverlay onFinish={(name) => {
        const next = JSON.parse(JSON.stringify(getState())) as GameState
        next.cafeName = name
        setState(next)
        setLocalState({ ...next })
        setShowIntro(false)
      }} />}

      {!showIntro && (
        <div className="flex min-h-screen flex-col">
          {breakEvenFailed && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
              <div className="max-w-sm text-center rounded-2xl bg-surface p-6 border border-danger/50">
                <h1 className="font-bold text-danger mb-2">30-Day Deadline Failed</h1>
                <p className="text-muted mb-4">
                  Accumulated net profit: {fmt(state.accumulatedNetProfit)} Ruby
                  <br />
                  Required: {fmt(CONSTANTS.BREAK_EVEN.target)} Ruby
                </p>
                <p className="text-muted mb-4">
                  The campus revoked your license. Bayu did not pass.
                </p>
                <Button
                  variant="primary"
                  onPress={() => { clearSave().then(() => window.location.reload()) }}
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<MetaPage />} />
                <Route path="resources" element={<ResourcesPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </div>
      )}
    </>
  )
}
