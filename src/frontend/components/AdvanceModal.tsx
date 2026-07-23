import { useState, useEffect } from 'react'
import {
  ModalBackdrop, ModalContainer, ModalDialog, ModalCloseTrigger,
  ModalHeader, ModalHeading, ModalBody, ModalFooter,
  Button, Card, CardContent, Surface,
} from '@heroui/react'
import { AlertTriangle, Check, Info, Trophy } from 'lucide-react'
import { toast } from '@heroui/react'
import type { GameState, DailyReport } from '../../core/types'
import { getState, setState, subscribe } from '../../core/state/gameStore'
import { CONSTANTS } from '../../core/constants/data'
import { simulateDay } from '../../core/rules/simulateDay'
import { fmt } from '../utils'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function AdvanceModal({ isOpen, onClose }: Props) {
  const [state, setLocalState] = useState<GameState>(getState())
  useEffect(() => subscribe(s => setLocalState({ ...s })), [])

  const [report, setReport] = useState<DailyReport | null>(null)
  const [phase, setPhase] = useState<'forecast' | 'result'>('forecast')
  const [confirmPrestige, setConfirmPrestige] = useState(false)

  const reset = () => {
    setReport(null)
    setPhase('forecast')
    setConfirmPrestige(false)
    onClose()
  }

  const handleAdvance = () => {
    const prev = getState()
    const { newState, report: r } = simulateDay(prev)
    setState(newState)
    setLocalState({ ...newState })
    setReport(r)
    setPhase('result')

    // Profit/loss toast
    if (r.netProfit > 0) {
      toast.success('Profitable day', {
        description: `Net profit: +${fmt(r.netProfit)} Ruby`,
        indicator: <Check className="size-5 text-emerald-500" />,
      })
    } else if (r.netProfit < 0) {
      toast.warning('Loss-making day', {
        description: `Net profit: ${fmt(r.netProfit)} Ruby. Review pricing and stock.`,
        indicator: <AlertTriangle className="size-5 text-amber-500" />,
      })
    } else {
      toast.info('Broke even', {
        description: 'Room for improvement.',
        indicator: <Info className="size-5 text-blue-500" />,
      })
    }

    // Expired ingredients toast
    if (r.expiredIngredients.length > 0) {
      toast.danger('Ingredients expired', {
        description: r.expiredIngredients.join(', '),
        indicator: <AlertTriangle className="size-5 text-red-500" />,
      })
    }

    // Out of stock toast
    if (r.outOfStockItems.length > 0) {
      toast.warning('Ran out of stock', {
        description: r.outOfStockItems.join(', '),
        indicator: <AlertTriangle className="size-5 text-amber-500" />,
      })
    }

    // Walkouts toast
    const totalWalkouts = r.walkouts.tooExpensive + r.walkouts.outOfStock + r.walkouts.queueTooLong
    if (totalWalkouts > 0) {
      const details = [
        r.walkouts.tooExpensive > 0 ? `${r.walkouts.tooExpensive} expensive` : '',
        r.walkouts.outOfStock > 0 ? `${r.walkouts.outOfStock} OOS` : '',
        r.walkouts.queueTooLong > 0 ? `${r.walkouts.queueTooLong} queue` : '',
      ].filter(Boolean).join(', ')
      toast.warning(`${totalWalkouts} walkouts`, {
        description: details,
        indicator: <AlertTriangle className="size-5 text-amber-500" />,
      })
    }
  }

  const capacity =
    CONSTANTS.BASE_CAPACITY +
    (state.hasBarista ? CONSTANTS.STAFF.BARISTA.capacityBonus : 0) +
    (state.hasCashier ? CONSTANTS.STAFF.CASHIER.capacityBonus : 0)
  const activeCount = state.activeMenus.filter(m => m.isActive).length
  const breakEvenMet = state.accumulatedNetProfit >= CONSTANTS.BREAK_EVEN.target

  const handlePrestige = () => {
    const prev = getState()
    const next: GameState = JSON.parse(JSON.stringify(prev))
    next.prestigeHistory = [...next.prestigeHistory, {
      tier: next.prestigeTier,
      businessDay: next.businessDay,
      accumulatedNetProfit: next.accumulatedNetProfit,
    }]
    next.prestigeTier += 1
    next.businessDay = 1
    next.totalDaysElapsed = 1
    next.rubyBalance = CONSTANTS.STARTING_CAPITAL + CONSTANTS.PRESTIGE_CAPITAL_BONUS * next.prestigeTier
    next.inventory = []
    next.accumulatedGrossRevenue = 0
    next.accumulatedNetProfit = 0
    next.dailyHistory = []
    next.isBankrupt = false
    setState(next)
    setLocalState({ ...next })
    setConfirmPrestige(false)
    reset()
  }

  const prestigeMultiplier = 1 + state.prestigeTier * CONSTANTS.PRESTIGE_TRAFFIC_BONUS
  const minTraffic = Math.round(CONSTANTS.BASE_DAILY_TRAFFIC * prestigeMultiplier * (1 - CONSTANTS.TRAFFIC_VARIANCE))
  const maxTraffic = Math.round(CONSTANTS.BASE_DAILY_TRAFFIC * prestigeMultiplier * (1 + CONSTANTS.TRAFFIC_VARIANCE + CONSTANTS.BUSY_DAY_BONUS))

  return (
    <ModalBackdrop isOpen={isOpen} onOpenChange={(open) => !open && reset()}>
      <ModalContainer>
        <ModalDialog>
          <ModalCloseTrigger />
          <ModalHeader>
            <ModalHeading>
              {phase === 'forecast' ? 'Advance Day' : 'Daily Report'}
            </ModalHeading>
          </ModalHeader>
          <ModalBody>
            {phase === 'forecast' && (
              <div className="space-y-3">
                <Surface variant="secondary" className="px-4 py-3 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Customers expected</span>
                    <span className="font-bold text-emerald-500">{minTraffic}-{maxTraffic}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Staff capacity</span>
                    <span className="font-bold">{capacity} cups/day</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Active menus</span>
                    <span className="font-bold">{activeCount}</span>
                  </div>
                </Surface>

                {!breakEvenMet && (
                  <p className="text-muted text-center">
                    Break-even needed: {fmt(CONSTANTS.BREAK_EVEN.target)} Ruby accumulated net profit within {CONSTANTS.BREAK_EVEN.days} days.
                    The campus is watching.
                  </p>
                )}

                {activeCount === 0 && (
                  <p className="text-warning text-center">
                    No active menus. Enable some in the Almanac first.
                  </p>
                )}
              </div>
            )}

            {phase === 'result' && report && (
              <div className="space-y-3">
                {/* Sales */}
                <Surface variant="secondary" className="px-4 py-2.5 rounded-xl">
                  <h3 className="font-bold text-emerald-500 mb-1.5">Sales</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <span className="text-muted">Traffic</span>
                    <span className="text-right font-semibold">
                      {report.dailyTraffic} customers
                      {report.isBusyDay && (
                        <span className="ml-1.5 inline-block rounded-full bg-amber-500/20 px-1.5 py-0.5 font-medium text-amber-500">Busy Day!</span>
                      )}
                    </span>
                    <span className="text-muted">Served</span>
                    <span className="text-right font-semibold">{report.cupsSold} / {report.dailyTraffic}</span>
                    <span className="text-muted">Revenue</span>
                    <span className="text-right font-semibold text-emerald-500">+{fmt(report.grossRevenue)}</span>
                    <span className="text-muted">COGS</span>
                    <span className="text-right font-semibold text-danger">-{fmt(report.cogs)}</span>
                  </div>
                </Surface>

                {/* Expenses */}
                <Surface variant="secondary" className="px-4 py-2.5 rounded-xl">
                  <h3 className="font-bold text-danger mb-1.5">Expenses</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <span className="text-muted">Staff (opex)</span>
                    <span className="text-right font-semibold text-danger">-{fmt(report.opex)}</span>
                    {report.spoilageLoss > 0 && (
                      <>
                        <span className="text-muted">Spoilage</span>
                        <span className="text-right font-semibold text-danger">-{fmt(report.spoilageLoss)}</span>
                      </>
                    )}
                  </div>
                </Surface>

                {/* Net Profit */}
                <Card>
                  <CardContent className="flex items-center justify-between py-2.5">
                    <span className="font-bold">Net Profit</span>
                    <span className={`font-bold ${report.netProfit >= 0 ? 'text-emerald-500' : 'text-danger'}`}>
                      {report.netProfit >= 0 ? '+' : ''}{fmt(report.netProfit)}
                    </span>
                  </CardContent>
                </Card>

                {/* Walkouts */}
                {(report.walkouts.tooExpensive > 0 || report.walkouts.outOfStock > 0 || report.walkouts.queueTooLong > 0) && (
                  <Surface variant="secondary" className="px-4 py-2.5 rounded-xl">
                    <h3 className="font-bold text-warning mb-1.5">Walkouts</h3>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-warning font-bold">{report.walkouts.tooExpensive}</p>
                        <p className="text-muted">Too expensive</p>
                      </div>
                      <div>
                        <p className="text-warning font-bold">{report.walkouts.outOfStock}</p>
                        <p className="text-muted">Out of stock</p>
                      </div>
                      <div>
                        <p className="text-warning font-bold">{report.walkouts.queueTooLong}</p>
                        <p className="text-muted">Queue too long</p>
                      </div>
                    </div>
                  </Surface>
                )}

                {/* Out of stock / expired */}
                {report.outOfStockItems.length > 0 && (
                  <Surface variant="tertiary" className="px-4 py-2 text-danger rounded-xl">
                    Ran out: {report.outOfStockItems.join(', ')}
                  </Surface>
                )}
                {report.expiredIngredients.length > 0 && (
                  <Surface variant="tertiary" className="px-4 py-2 text-danger rounded-xl">
                    Expired: {report.expiredIngredients.join(', ')}
                  </Surface>
                )}

                {/* Advice */}
                <p className="text-center text-muted pt-1">
                  {report.netProfit > 0
                    ? 'Profitable day. Keep it up, Bayu.'
                    : report.netProfit < 0
                      ? 'Loss-making day. Review pricing and stock.'
                      : 'Broke even. Room for improvement.'}
                </p>

                {/* Break-even check */}
                {state.businessDay >= CONSTANTS.BREAK_EVEN.days && (
                  <Surface variant="tertiary" className={`px-4 py-2.5 text-center rounded-xl border ${breakEvenMet ? 'border-emerald-700/50' : 'border-danger/50'}`}>
                    <p className={`font-bold ${breakEvenMet ? 'text-emerald-500' : 'text-danger'}`}>
                      {breakEvenMet
                        ? 'Break-even target met'
                        : `Break-even: ${fmt(state.accumulatedNetProfit)} / ${fmt(CONSTANTS.BREAK_EVEN.target)} Ruby required. The campus is not pleased.`
                      }
                    </p>
                  </Surface>
                )}

                {/* Break-even reached → prestige section */}
                {breakEvenMet && (
                  <Surface variant="tertiary" className="px-4 py-3 text-center rounded-xl border border-emerald-700/50">
                    {!confirmPrestige ? (
                      <div className="space-y-2">
                        <p className="font-bold text-emerald-500">🎉 Break-even reached!</p>
                        {state.stats.fastestBreakEven != null && state.businessDay === state.stats.fastestBreakEven && (
                          <p className="text-muted">Break-even reached on Day {state.stats.fastestBreakEven}!</p>
                        )}
                        <Button variant="primary" size="sm" onPress={() => setConfirmPrestige(true)}>
                          <Trophy className="size-4" />
                          Expand Stall (Prestige)
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="font-bold text-warning">Confirm Prestige?</p>
                        <p className="text-muted">
                          This will reset your Day count, balance, and inventory,
                          but you'll keep your unlocked menus, staff, stats, and gain a permanent traffic bonus.
                        </p>
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm" className="flex-1" onPress={() => setConfirmPrestige(false)}>
                            Cancel
                          </Button>
                          <Button variant="primary" size="sm" className="flex-1" onPress={handlePrestige}>
                            Confirm
                          </Button>
                        </div>
                      </div>
                    )}
                  </Surface>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            {phase === 'forecast' ? (
              <div className="flex gap-2 w-full">
                <Button variant="secondary" className="flex-1" onPress={reset}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  isDisabled={activeCount === 0}
                  onPress={handleAdvance}
                >
                  Open Cafe
                </Button>
              </div>
            ) : (
              <Button variant="primary" className="w-full" onPress={reset}>
                Sleep & Wake Up (Day {state.businessDay})
              </Button>
            )}
          </ModalFooter>
        </ModalDialog>
      </ModalContainer>
    </ModalBackdrop>
  )
}
