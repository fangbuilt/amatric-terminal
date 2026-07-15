import { useState, useEffect } from 'react'
import {
  Card, CardHeader, CardContent, Button, Chip, Surface, Separator,
} from '@heroui/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { GameState } from '../../core/types/gameState'
import { getState, subscribe } from '../../core/state/gameStore'
import { fmt } from '../utils'
import { CONSTANTS } from '../../core/constants/data'

export default function HistoryPage() {
  const [state, setState] = useState<GameState>(getState())
  useEffect(() => subscribe(s => setState({ ...s })), [])

  const { dailyHistory } = state
  const [index, setIndex] = useState(dailyHistory.length - 1)
  const [looping, setLooping] = useState(true)

  useEffect(() => {
    setIndex(dailyHistory.length - 1)
  }, [dailyHistory.length])

  const [touchStart, setTouchStart] = useState(0)

  if (dailyHistory.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-muted p-4">
        <p className="">No days recorded yet. Advance a day to start tracking.</p>
      </div>
    )
  }

  const clampedIndex = Math.max(0, Math.min(index, dailyHistory.length - 1))
  const day = dailyHistory[clampedIndex]
  const dayNum = clampedIndex + 1

  const goPrev = () => {
    if (clampedIndex <= 0) {
      if (looping) setIndex(dailyHistory.length - 1)
    } else {
      setIndex(clampedIndex - 1)
    }
  }

  const goNext = () => {
    if (clampedIndex >= dailyHistory.length - 1) {
      if (looping) setIndex(0)
    } else {
      setIndex(clampedIndex + 1)
    }
  }

  // Swipe support
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX)
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStart
    if (Math.abs(diff) > 50) {
      if (diff > 0) goPrev()
      else goNext()
    }
  }

  const beMet = state.accumulatedNetProfit >= CONSTANTS.BREAK_EVEN.target

  return (
    <div
      className="flex flex-col gap-3"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Cumulative stats */}
      <Card>
        <CardContent className="grid grid-cols-2 gap-3 text-center py-3">
          <div>
            <p className="text-muted uppercase tracking-wider">Gross Revenue</p>
            <p className="font-bold text-emerald-500">{fmt(state.accumulatedGrossRevenue)}</p>
          </div>
          <div>
            <p className="text-muted uppercase tracking-wider">Net Profit</p>
            <p className={`font-bold ${state.accumulatedNetProfit >= 0 ? 'text-emerald-500' : 'text-danger'}`}>
              {state.accumulatedNetProfit >= 0 ? '+' : ''}{fmt(state.accumulatedNetProfit)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Day navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" isIconOnly onPress={goPrev}>
          <ChevronLeft className="size-4" />
        </Button>
        <Chip color="warning" variant="primary" size="sm">Day {dayNum}</Chip>
        <Button variant="ghost" size="sm" isIconOnly onPress={goNext}>
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Day report */}
      <Card>
        <CardContent className="space-y-2 py-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            <span className="text-muted">Traffic</span>
            <span className="text-right font-semibold">
              {day.dailyTraffic} customers
              {day.isBusyDay && (
                <span className="ml-1.5 inline-block rounded-full bg-amber-500/20 px-1.5 py-0.5 font-medium text-amber-500">Busy Day!</span>
              )}
            </span>

            <span className="text-muted">Cups Sold</span>
            <span className="text-right font-semibold">{day.cupsSold}</span>

            <span className="text-muted">Revenue</span>
            <span className="text-right font-semibold text-emerald-500">+{fmt(day.grossRevenue)}</span>

            <span className="text-muted">COGS</span>
            <span className="text-right font-semibold text-danger">-{fmt(day.cogs)}</span>

            <span className="text-muted">Staff (Opex)</span>
            <span className="text-right font-semibold text-danger">-{fmt(day.opex)}</span>

            {day.spoilageLoss > 0 && (
              <>
                <span className="text-muted">Spoilage</span>
                <span className="text-right font-semibold text-danger">-{fmt(day.spoilageLoss)}</span>
              </>
            )}

            <Separator className="col-span-2 my-1" />

            <span className="text-muted font-bold">Net Profit</span>
            <span className={`text-right font-bold ${day.netProfit >= 0 ? 'text-emerald-500' : 'text-danger'}`}>
              {day.netProfit >= 0 ? '+' : ''}{fmt(day.netProfit)}
            </span>
          </div>

          {/* Walkouts */}
          {(day.walkouts.tooExpensive > 0 || day.walkouts.outOfStock > 0 || day.walkouts.queueTooLong > 0) && (
            <div className="pt-2 border-t border-stone-700/50 text-muted">
              <p>
                Walkouts: {day.walkouts.tooExpensive} expensive,
                {day.walkouts.outOfStock} OOS,
                {day.walkouts.queueTooLong} queue
              </p>
            </div>
          )}

          {/* Expired items */}
          {day.expiredIngredients.length > 0 && (
            <div className="text-danger">
              Expired: {day.expiredIngredients.join(', ')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Looping toggle */}
      <Button
        variant={looping ? 'primary' : 'ghost'}
        size="sm"
        onPress={() => setLooping(!looping)}
        className="self-center"
      >
        Loop: {looping ? 'On' : 'Off'}
      </Button>

      <p className="text-center text-muted">Swipe or use arrows</p>

      {/* Break-even status */}
      <Card className={beMet ? 'border border-emerald-700/50' : 'border border-danger/50'}>
        <CardContent className="py-3 text-center">
          <p className={`font-bold ${beMet ? 'text-emerald-500' : 'text-danger'}`}>
            {beMet
              ? 'Break-even target met. The campus is pleased.'
              : `Break-even: ${fmt(state.accumulatedNetProfit)} / ${fmt(CONSTANTS.BREAK_EVEN.target)} Ruby needed. ${Math.max(0, CONSTANTS.BREAK_EVEN.days - state.businessDay + 1)} days remaining.`
            }
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
