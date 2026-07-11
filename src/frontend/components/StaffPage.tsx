import { useState, useEffect } from 'react'
import {
  Card, CardHeader, CardContent, CardFooter, Button, Chip, Separator, toast,
} from '@heroui/react'
import { Coffee, ShoppingBag, UserPlus, UserX, Check, AlertTriangle, Info } from 'lucide-react'
import type { GameState } from '../../core/types/gameState'
import { getState, setState, subscribe } from '../../core/state/gameStore'
import { CONSTANTS } from '../../core/constants/data'
import { fmt } from '../utils'

export default function StaffPage() {
  const [state, setLocalState] = useState<GameState>(getState())
  useEffect(() => subscribe(s => setLocalState({ ...s })), [])

  const capacity =
    (state.hasBarista ? CONSTANTS.STAFF.BARISTA.capacityBonus : 0) +
    (state.hasCashier ? CONSTANTS.STAFF.CASHIER.capacityBonus : 0)

  const severanceCost = CONSTANTS.STAFF.CASHIER.dailyWage * 30 * CONSTANTS.SEVERANCE_MULTIPLIER

  const hireCashier = () => {
    const next = JSON.parse(JSON.stringify(getState())) as GameState
    next.hasCashier = true
    setState(next)
    setLocalState({ ...next })
    toast.success('Cashier hired', {
      description: `Wage: ${fmt(CONSTANTS.STAFF.CASHIER.dailyWage)} Ruby/day. Capacity now +${CONSTANTS.STAFF.CASHIER.capacityBonus} cups.`,
      indicator: <Check className="size-5 text-emerald-500" />,
    })
  }

  const fireCashier = () => {
    const next = JSON.parse(JSON.stringify(getState())) as GameState
    if (next.rubyBalance < severanceCost) {
      toast.danger('Cannot afford severance pay', {
        description: `Severance pay costs ${fmt(severanceCost)} Ruby but you only have ${fmt(next.rubyBalance)} Ruby.`,
        indicator: <AlertTriangle className="size-5 text-red-500" />,
      })
      return
    }
    next.rubyBalance -= severanceCost
    next.hasCashier = false
    setState(next)
    setLocalState({ ...next })
    toast.info('Cashier fired', {
      description: `Paid ${fmt(severanceCost)} Ruby severance pay.`,
      indicator: <Info className="size-5 text-blue-500" />,
    })
  }

  return (
    <div className="flex flex-col gap-3 max-w-lg mx-auto">
      {/* Staff info */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-bold">Staff</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Barista */}
          <div className="flex items-center justify-between rounded-lg bg-surface px-3 py-2.5">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-amber-600/20 p-1.5">
                <Coffee className="size-4 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Barista</p>
                <p className="text-[10px] text-muted">
                  {fmt(CONSTANTS.STAFF.BARISTA.dailyWage)} Ruby/day +{CONSTANTS.STAFF.BARISTA.capacityBonus} cups
                </p>
              </div>
            </div>
            <Chip color={state.hasBarista ? 'success' : 'danger'} variant="soft" size="sm">
              {state.hasBarista ? 'Employed' : 'Not hired'}
            </Chip>
          </div>

          {/* Cashier */}
          <div className="flex items-center justify-between rounded-lg bg-surface px-3 py-2.5">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-emerald-600/20 p-1.5">
                <ShoppingBag className="size-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Cashier</p>
                <p className="text-[10px] text-muted">
                  {fmt(CONSTANTS.STAFF.CASHIER.dailyWage)} Ruby/day +{CONSTANTS.STAFF.CASHIER.capacityBonus} cups
                </p>
              </div>
            </div>
            <Chip color={state.hasCashier ? 'success' : 'default'} variant="soft" size="sm">
              {state.hasCashier ? 'Employed' : 'Optional'}
            </Chip>
          </div>

          <Separator />

          <div className="text-center text-xs text-muted">
            Total capacity: {capacity} cups/day
          </div>
        </CardContent>
      </Card>

      {/* Cashier actions */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-bold">Cashier Actions</h3>
        </CardHeader>
        <CardContent>
          {!state.hasCashier ? (
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onPress={hireCashier}
            >
              <UserPlus className="size-4" />
              Hire Cashier ({fmt(CONSTANTS.STAFF.CASHIER.dailyWage)} Ruby/day)
            </Button>
          ) : (
            <div className="space-y-2">
              <Button
                variant="danger"
                size="lg"
                className="w-full"
                isDisabled={state.rubyBalance < severanceCost}
                onPress={fireCashier}
              >
                <UserX className="size-4" />
                Fire Cashier (pay {fmt(severanceCost)} Ruby severance pay)
              </Button>
              <p className="text-[10px] text-muted text-center">
                Severance pay = 3x monthly salary ({fmt(severanceCost)} Ruby)
              </p>
            </div>
          )}
        </CardContent>
      </Card>


    </div>
  )
}
