import { useState, useEffect } from 'react'
import {
  Card, CardHeader, CardContent, Chip, ProgressBar, Surface, toast,
} from '@heroui/react'
import { Package, AlertTriangle, Check } from 'lucide-react'
import type { GameState } from '../../core/types/gameState'
import { getState, subscribe } from '../../core/state/gameStore'
import { groupBy, sortBy } from 'lodash-es'
import { fmt, getIngredient, activeMenus, getExpiringTomorrow, totalOnHand } from '../utils'

export default function InventoryPage() {
  const [state, setState] = useState<GameState>(getState())
  useEffect(() => subscribe(s => setState({ ...s })), [])

  // Toast on mount if items expiring tomorrow
  useEffect(() => {
    const current = getState()
    const expiring = getExpiringTomorrow(current)
    if (expiring.length > 0) {
      toast.warning('Ingredients expiring tomorrow', {
        description: expiring.join(', '),
        indicator: <AlertTriangle className="size-5 text-amber-500" />,
      })
    }
  }, [])

  const sorted = sortBy(state.inventory, 'dayBought')
  const grouped = groupBy(sorted, 'ingredientId')
  const expiringTomorrow = getExpiringTomorrow(state)

  const active = activeMenus(state)
  const needed = new Set(active.flatMap(menu => menu.recipe.map(item => item.ingredientId)))
  const stocked = new Set(state.inventory.map(b => b.ingredientId))
  const outOfStock = [...needed].filter(id => !stocked.has(id))

  return (
    <div className="flex flex-col gap-3 p-3 pb-24 sm:p-4">
      {/* Expiring tomorrow alert */}
      {expiringTomorrow.length > 0 && (
        <Surface variant="tertiary" className="border border-danger/40 px-3 py-2 rounded-xl">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-danger">
            <AlertTriangle className="size-4" />
            Expiring Tomorrow
          </h3>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {expiringTomorrow.map(name => (
              <Chip key={name} color="danger" variant="soft" size="sm">{name}</Chip>
            ))}
          </div>
        </Surface>
      )}

      {/* Out of stock alert */}
      {outOfStock.length > 0 && (
        <Surface variant="tertiary" className="border border-warning/40 px-3 py-2 rounded-xl">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-warning">
            <AlertTriangle className="size-4" />
            Out of Stock (Active Menus)
          </h3>
          <ul className="mt-1 space-y-0.5">
            {outOfStock.map(id => {
              const ingredient = getIngredient(id)
              const usedIn = active
                .filter(menu => menu.recipe.some(r => r.ingredientId === id))
                .map(menu => menu.name)
              return (
                <li key={id} className="text-xs text-warning">
                  {ingredient.name} needed for: {usedIn.join(', ')}
                </li>
              )
            })}
          </ul>
        </Surface>
      )}

      {/* FIFO Warehouse */}
      {state.inventory.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-muted">
          <Package className="size-10" />
          <p className="text-sm">Your warehouse is empty. Buy ingredients from the supplier.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([id, batches]) => {
          const ingredient = getIngredient(id)
          const total = totalOnHand(state, id)
          return (
            <Card key={id}>
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <h3 className="font-semibold text-sm">{ingredient.name}</h3>
                  <span className="text-xs text-muted">
                    {fmt(total)} / {fmt(ingredient.bulkUnit)} {ingredient.unit}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {batches.map((batch, i) => {
                  const age = state.currentDay - batch.dayBought
                  const daysLeft = ingredient.shelfLifeDays - age
                  const isExpired = !isFinite(ingredient.shelfLifeDays) ? false : daysLeft <= 0
                  const pct = isFinite(ingredient.shelfLifeDays)
                    ? Math.max(0, (daysLeft / ingredient.shelfLifeDays) * 100)
                    : 100

                  return (
                    <div key={batch.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted font-mono">Batch {i + 1}</span>
                        <span className="text-muted font-mono">{fmt(batch.qty)} {ingredient.unit}</span>
                        <span className={
                          isExpired ? 'text-danger' :
                          daysLeft <= 1 ? 'text-warning' :
                          'text-muted'
                        }>
                          {isFinite(ingredient.shelfLifeDays)
                            ? isExpired ? 'Expired' : `${daysLeft}d left`
                            : 'Non-perishable'}
                        </span>
                      </div>
                      <ProgressBar
                        value={isExpired ? 0 : pct}
                        color={isExpired ? 'danger' : daysLeft <= 1 ? 'warning' : 'success'}
                        size="sm"
                        className="w-full"
                      >
                        <ProgressBar.Track>
                          <ProgressBar.Fill />
                        </ProgressBar.Track>
                      </ProgressBar>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )
        })
      )}

      {state.inventory.length > 0 && outOfStock.length === 0 && expiringTomorrow.length === 0 && (
        <p className="text-center text-xs text-emerald-500">
          All active menu items are in stock.
        </p>
      )}
    </div>
  )
}
