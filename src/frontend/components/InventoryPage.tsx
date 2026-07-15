import { useState, useEffect } from 'react'
import {
  Card, CardHeader, CardContent, Chip, ProgressBar, Surface, toast,
  ModalBackdrop, ModalContainer, ModalDialog, ModalCloseTrigger,
  ModalHeader, ModalHeading, ModalBody,
} from '@heroui/react'
import { Package, AlertTriangle, Check } from 'lucide-react'
import type { GameState } from '../../core/types/gameState'
import { getState, subscribe } from '../../core/state/gameStore'
import { groupBy, sortBy } from 'lodash-es'
import { fmt, getIngredient, activeMenus, getExpiringTomorrow, totalOnHand } from '../utils'

export default function InventoryPage() {
  const [state, setState] = useState<GameState>(getState())
  useEffect(() => subscribe(s => setState({ ...s })), [])

  const [selectedId, setSelectedId] = useState<string | null>(null)

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

  const selectedIngredient = selectedId ? getIngredient(selectedId) : null
  const selectedBatches = selectedId ? grouped[selectedId] ?? [] : []

  return (
    <div className="flex flex-col gap-3">
      {/* Expiring tomorrow alert */}
      {expiringTomorrow.length > 0 && (
        <Surface variant="tertiary" className="border border-danger/40 px-3 py-2 rounded-xl">
          <h3 className="flex items-center gap-1.5 font-bold text-danger">
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
          <h3 className="flex items-center gap-1.5 font-bold text-warning">
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
                <li key={id} className="text-warning">
                  {ingredient.name} needed for: {usedIn.join(', ')}
                </li>
              )
            })}
          </ul>
        </Surface>
      )}

      {/* All in stock message */}
      {state.inventory.length > 0 && outOfStock.length === 0 && expiringTomorrow.length === 0 && (
        <p className="text-center text-emerald-500">
          All active menu items are in stock.
        </p>
      )}

      {/* FIFO Warehouse */}
      {state.inventory.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-muted">
          <Package className="size-10" />
          <p className="">Your warehouse is empty. Buy ingredients from the supplier.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {Object.entries(grouped).map(([id, batches]) => {
            const ingredient = getIngredient(id)
            const total = totalOnHand(state, id)
            const expiringCount = batches.filter(b => {
              const age = state.businessDay - b.dayBought
              const daysLeft = ingredient.shelfLifeDays - age
              return isFinite(ingredient.shelfLifeDays) && daysLeft <= 1
            }).length

            return (
              <Card
                key={id}
                className="cursor-pointer hover:shadow-md transition-shadow text-center"
                onClick={() => setSelectedId(id)}
              >
                <div className="flex justify-center pt-2">
                  <div className="aspect-square w-full max-w-24 rounded-xl bg-stone-200 dark:bg-stone-700" />
                </div>
                <CardHeader>
                  <div className="min-w-0 w-full">
                    <span className="font-medium truncate block">{ingredient.name}</span>
                    <div className="flex items-center justify-center gap-1 mt-0.5">
                      <span className="text-muted">
                        {fmt(total)} {ingredient.unit}
                      </span>
                      {expiringCount > 0 && (
                        <Chip color="danger" variant="soft" size="sm">
                          {expiringCount} expiring
                        </Chip>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted">
                    {batches.length} {batches.length === 1 ? 'batch' : 'batches'}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Batch details modal */}
      <ModalBackdrop isOpen={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
        <ModalContainer>
          <ModalDialog>
            <ModalCloseTrigger />
            <ModalHeader>
              <ModalHeading>{selectedIngredient?.name ?? ''}</ModalHeading>
            </ModalHeader>
            <ModalBody>
              {selectedIngredient && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Total on hand</span>
                    <span className="font-bold">
                      {fmt(totalOnHand(state, selectedId!))} / {fmt(selectedIngredient.bulkUnit)} {selectedIngredient.unit}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {selectedBatches.map((batch, i) => {
                      const age = state.businessDay - batch.dayBought
                      const daysLeft = selectedIngredient.shelfLifeDays - age
                      const isExpired = !isFinite(selectedIngredient.shelfLifeDays) ? false : daysLeft <= 0
                      const pct = isFinite(selectedIngredient.shelfLifeDays)
                        ? Math.max(0, (daysLeft / selectedIngredient.shelfLifeDays) * 100)
                        : 100

                      return (
                        <div key={batch.id} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-muted font-mono">Batch {i + 1}</span>
                            <span className="font-mono font-semibold">{fmt(batch.qty)} {selectedIngredient.unit}</span>
                            <span className={
                              isExpired ? 'text-danger' :
                              daysLeft <= 1 ? 'text-warning' :
                              'text-muted'
                            }>
                              {isFinite(selectedIngredient.shelfLifeDays)
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
                  </div>
                </div>
              )}
            </ModalBody>
          </ModalDialog>
        </ModalContainer>
      </ModalBackdrop>
    </div>
  )
}
