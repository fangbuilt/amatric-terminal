import { useState, useEffect } from 'react'
import {
  Card, CardHeader, CardContent, CardFooter,
  Button, TextField, Input, Select, ListBox, toast,
} from '@heroui/react'
import { ShoppingCart, Plus, Minus, AlertTriangle, Check } from 'lucide-react'
import type { GameState } from '../../core/types/gameState'
import { getState, setState, subscribe } from '../../core/state/gameStore'
import { INGREDIENTS } from '../../core/constants/data'
import { MENU_BY_ID } from '../../core/constants/lookup'
import { checkRecipeUnlocks } from '../../core/rules/progression'
import { calculateCOGM } from '../../core/rules/calculateCogm'
import { fmt } from '../utils'

export default function ShopPage() {
  const [state, setLocalState] = useState<GameState>(getState())
  useEffect(() => subscribe(s => setLocalState({ ...s })), [])

  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const unlockedIngredientIds = new Set(state.historicalPurchases)
  const activeIngredientIds = new Set(
    state.activeMenus
      .filter(m => m.isActive)
      .flatMap(m => MENU_BY_ID.get(m.menuId)?.recipe.map(r => r.ingredientId) ?? []),
  )

  const filtered = INGREDIENTS.filter(i => {
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false
    if (filter === 'active') return activeIngredientIds.has(i.id)
    return true
  })

  const setQty = (id: string, n: number) => {
    setQuantities(q => ({ ...q, [id]: Math.max(0, Math.min(n, 999)) }))
  }

  const cartTotal = Object.entries(quantities).reduce((sum, [id, qty]) => {
    const ingr = INGREDIENTS.find(i => i.id === id)
    return ingr ? sum + ingr.bulkCost * qty : sum
  }, 0)

  const canAffordCart = cartTotal <= state.rubyBalance

  const buyAll = () => {
    const next = JSON.parse(JSON.stringify(getState())) as GameState
    const skipped: string[] = []

    for (const [id, qty] of Object.entries(quantities)) {
      if (qty <= 0) continue
      const ingr = INGREDIENTS.find(i => i.id === id)!
      const totalCost = ingr.bulkCost * qty
      if (next.rubyBalance < totalCost) {
        skipped.push(ingr.name)
        continue
      }

      next.rubyBalance -= totalCost
      next.inventory.push({
        id: Math.random().toString(36).substr(2, 9),
        ingredientId: ingr.id,
        qty: ingr.bulkUnit * qty,
        dayBought: next.currentDay,
      })
      if (!next.historicalPurchases.includes(ingr.id)) {
        next.historicalPurchases.push(ingr.id)
      }
    }

    if (skipped.length > 0) {
      toast.warning('Insufficient Ruby', {
        description: `Could not purchase: ${skipped.join(', ')}`,
        indicator: <AlertTriangle className="size-5 text-amber-500" />,
      })
    }

    const unlocks = checkRecipeUnlocks(next.historicalPurchases, next.unlockedMenuIds)
    for (const id of unlocks) {
      const menu = MENU_BY_ID.get(id)!
      next.unlockedMenuIds.push(id)
      next.activeMenus.push({ menuId: id, isActive: true, sellPrice: calculateCOGM(menu) * 2 })
      toast.success(`${menu.name} recipe unlocked`, {
        description: 'Check the Almanac to set your price.',
        indicator: <Check className="size-5 text-emerald-500" />,
      })
    }

    setState(next)
    setLocalState({ ...next })
    setQuantities({})
  }

  const showCart = cartTotal > 0

  return (
    <div className="flex flex-col gap-3 p-3 pb-24 sm:p-4">
      {/* Search + filter */}
      <div className="flex items-center gap-2">
        <TextField
          className="flex-1"
          value={search}
          onChange={setSearch}
        >
          <Input placeholder="Search ingredients..." />
        </TextField>
        <Select
          className="w-40"
          placeholder="Filter"
          selectedKey={filter}
          onSelectionChange={(k) => setFilter(k as string)}
        >
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="all" textValue="All">All</ListBox.Item>
              <ListBox.Item id="active" textValue="For Active Menu">For Active Menu</ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>
      </div>

      {/* Ingredient grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map(i => {
          const qty = quantities[i.id] ?? 0
          const alreadyBought = unlockedIngredientIds.has(i.id)
          return (
            <Card key={i.id} className="text-center">
                <div className="flex justify-center pt-2">
                  <div className="aspect-square w-full max-w-24 rounded-xl bg-stone-200 dark:bg-stone-700" />
                </div>
              <CardHeader>
                <div className="flex items-center justify-center gap-1.5 w-full">
                  <span className="font-medium text-sm truncate">{i.name}</span>
                  {alreadyBought && (
                    <span className="text-[10px] text-emerald-500 shrink-0">owned</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted">
                  {fmt(i.bulkCost)} Ruby
                </p>
              </CardContent>
              <CardFooter className="flex items-center justify-center gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    isIconOnly
                    isDisabled={qty <= 0}
                    onPress={() => setQty(i.id, qty - 1)}
                  >
                    <Minus className="size-3" />
                  </Button>
                  <span className="w-6 text-center text-sm font-semibold tabular-nums">{qty}</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    isIconOnly
                    onPress={() => setQty(i.id, qty + 1)}
                  >
                    <Plus className="size-3" />
                  </Button>
                </div>
                {qty > 0 && (
                  <span className="text-xs text-muted">
                    {fmt(i.bulkCost * qty)}
                  </span>
                )}
              </CardFooter>
            </Card>
          )
        })}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-muted py-8 text-sm">
            No ingredients match your filter.
          </p>
        )}
      </div>

      {/* Floating cart island */}
      {showCart && (
        <>
          {/* Spacer to prevent last card from being hidden behind the island */}
          <div className="h-20" />
          <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-stone-700/50 bg-surface px-3 py-3">
            <div className="flex items-center justify-between max-w-lg mx-auto">
              <div>
                <span className="text-xs text-muted">Cart total</span>
                <p className={`text-lg font-bold ${canAffordCart ? 'text-emerald-500' : 'text-danger'}`}>
                  {fmt(cartTotal)} Ruby
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="lg"
                  onPress={() => setQuantities({})}
                >
                  Clear All
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  isDisabled={!canAffordCart}
                  onPress={buyAll}
                >
                  <ShoppingCart className="size-4" />
                  Purchase All
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
