import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card, CardHeader, CardContent, CardFooter,
  Button, ProgressBar, Surface, Chip, Separator,
} from '@heroui/react'
import { RotateCcw, Heart, Megaphone, Target, CircleDollarSign, TrendingUp, ArrowUpFromLine, ArrowDownToLine } from 'lucide-react'
import type { GameState } from '../../core/types/gameState'
import { getState, subscribe } from '../../core/state/gameStore'
import { CONSTANTS } from '../../core/constants/data'
import { downloadSave, uploadSave } from '../saveManager'
import { fmt } from '../utils'

export default function MetaPage() {
  const [state, setState] = useState<GameState>(getState())
  useEffect(() => subscribe(s => setState({ ...s })), [])
  const navigate = useNavigate()

  const beMet = state.accumulatedNetProfit >= CONSTANTS.BREAK_EVEN.target
  const beProgress = beMet
    ? 100
    : Math.min(100, (state.accumulatedNetProfit / CONSTANTS.BREAK_EVEN.target) * 100)
  const daysRemaining = Math.max(0, CONSTANTS.BREAK_EVEN.days - state.businessDay + 1)

  const replayIntro = () => {
    localStorage.removeItem('amatric_intro_shown')
    window.location.reload()
  }

  const fileInputRef = useRef<HTMLInputElement>(null)
  const handleExport = () => downloadSave(state)
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    uploadSave(file).then(imported => setState(imported)).catch(() => {})
    e.target.value = ''
  }

  return (
    <div className="flex flex-col gap-3 p-3 pb-24 sm:p-4">
      {/* Row 1: Patch Notes, Business Overview, Personal Bests */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Patch Notes */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <Megaphone className="size-4 text-amber-500" />
              <span className="font-bold">Patch Notes</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted text-center py-2">
              Stay tuned for updates. The game creator controls the meta.
            </p>
          </CardContent>
        </Card>

        {/* Business Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="size-4 text-amber-500" />
              <span className="font-bold">Business Overview</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Break-even progress */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-muted">Break-even target</span>
                <span className="font-semibold">
                  {fmt(state.accumulatedNetProfit)} / {fmt(CONSTANTS.BREAK_EVEN.target)} Ruby
                </span>
              </div>
              <ProgressBar value={beProgress} color={beMet ? 'success' : 'warning'} size="md">
                <ProgressBar.Track>
                  <ProgressBar.Fill />
                </ProgressBar.Track>
              </ProgressBar>
              <div className="flex items-center justify-between">
                <span className={beMet ? 'text-emerald-500' : 'text-warning'}>
                  {beMet ? 'Target met!' : `${daysRemaining} day${daysRemaining > 1 ? 's' : ''} remaining`}
                </span>
                <span className="text-muted">{Math.round(beProgress)}%</span>
              </div>
            </div>

            <Separator />

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <Surface variant="secondary" className="rounded-xl px-3 py-2.5 text-center">
                <p className="text-muted uppercase tracking-wider">Day</p>
                <p className="font-bold">{state.businessDay}</p>
              </Surface>
              <Surface variant="secondary" className="rounded-xl px-3 py-2.5 text-center">
                <p className="text-muted uppercase tracking-wider">Balance</p>
                <p className="font-bold text-emerald-500">{fmt(state.rubyBalance)}</p>
              </Surface>
              <Surface variant="secondary" className="rounded-xl px-3 py-2.5 text-center">
                <p className="text-muted uppercase tracking-wider">Gross Revenue</p>
                <p className="font-bold">{fmt(state.accumulatedGrossRevenue)}</p>
              </Surface>
              <Surface variant="secondary" className="rounded-xl px-3 py-2.5 text-center">
                <p className="text-muted uppercase tracking-wider">Net Profit</p>
                <p className={`font-bold ${state.accumulatedNetProfit >= 0 ? 'text-emerald-500' : 'text-danger'}`}>
                  {state.accumulatedNetProfit >= 0 ? '+' : ''}{fmt(state.accumulatedNetProfit)}
                </p>
              </Surface>
            </div>

            {/* Daily history count */}
            <div className="text-center text-muted">
              {state.dailyHistory.length} day{state.dailyHistory.length !== 1 ? 's' : ''} recorded
            </div>
          </CardContent>
        </Card>

        {/* Personal Bests */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="size-4 text-amber-500" />
              <span className="font-bold">Personal Bests</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Surface variant="secondary" className="rounded-xl px-3 py-2.5 text-center">
                <p className="text-muted uppercase tracking-wider">Best Daily Profit</p>
                <p className="font-bold text-emerald-500">{fmt(state.stats.highestDailyProfit)}</p>
              </Surface>
              <Surface variant="secondary" className="rounded-xl px-3 py-2.5 text-center">
                <p className="text-muted uppercase tracking-wider">Best Daily Revenue</p>
                <p className="font-bold text-emerald-500">{fmt(state.stats.highestDailyRevenue)}</p>
              </Surface>
              <Surface variant="secondary" className="rounded-xl px-3 py-2.5 text-center">
                <p className="text-muted uppercase tracking-wider">Total Cups Sold</p>
                <p className="font-bold">{state.stats.totalCupsSold}</p>
              </Surface>
              <Surface variant="secondary" className="rounded-xl px-3 py-2.5 text-center">
                <p className="text-muted uppercase tracking-wider">Fastest Break-Even</p>
                <p className="font-bold">{state.stats.fastestBreakEven != null ? `Day ${state.stats.fastestBreakEven}` : '—'}</p>
              </Surface>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Save Data, Support, Bayu's Mission */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Save Data */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <ArrowUpFromLine className="size-4 text-amber-500" />
              <span className="font-bold">Save Data</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="secondary" size="sm" className="w-full gap-1.5" onPress={handleExport}>
              <ArrowUpFromLine className="size-3.5 shrink-0" />
              Export Save
            </Button>
            <Button variant="secondary" size="sm" className="w-full gap-1.5" onPress={() => fileInputRef.current?.click()}>
              <ArrowDownToLine className="size-3.5 shrink-0" />
              Import Save
            </Button>
            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </CardContent>
        </Card>

        {/* Support / Donate */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <Heart className="size-4 text-red-500" />
              <span className="font-bold">Support the Author</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              isDisabled
            >
              <CircleDollarSign className="size-3.5" />
              Buy Me a Coffee
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              isDisabled
            >
              <CircleDollarSign className="size-3.5" />
              PayPal
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              isDisabled
            >
              <CircleDollarSign className="size-3.5" />
              Saweria
            </Button>
          </CardContent>
        </Card>

        {/* Bayu's Mission (replay intro) */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <Target className="size-4 text-amber-500" />
              <span className="font-bold">Bayu's Mission</span>
            </div>
          </CardHeader>
          <CardContent className="text-muted">
            <p>
              Bayu, a full-ride business student, was granted 5,000 Ruby by the campus
              to launch a coffee stall for his final grade. He must break even
              (accumulate {fmt(CONSTANTS.BREAK_EVEN.target)} Ruby net profit) within {CONSTANTS.BREAK_EVEN.days} days.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onPress={replayIntro}
            >
              <RotateCcw className="size-3.5" />
              Replay Intro
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Prestige (conditional, full width) */}
      {state.prestigeTier > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <span className="text-amber-500">★</span>
              <span className="font-bold">Prestige Tier {state.prestigeTier}</span>
            </div>
          </CardHeader>
          <CardContent>
            {state.prestigeHistory.length > 0 && (
              <div className="space-y-1.5">
                {state.prestigeHistory.map((rec, i) => (
                  <div key={i} className="flex items-center justify-between text-muted">
                    <span>Tier {rec.tier} — Day {rec.businessDay}</span>
                    <span>{fmt(rec.accumulatedNetProfit)} Ruby</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
