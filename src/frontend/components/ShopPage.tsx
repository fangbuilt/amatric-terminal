import { useState, useEffect } from 'react'
import {
  Card, CardHeader, CardContent, CardFooter,
  Button, TextField, Input, Select, ListBox, toast,
  Accordion, Chip,
  ModalBackdrop, ModalContainer, ModalDialog, ModalCloseTrigger,
  ModalHeader, ModalHeading, ModalBody,
} from '@heroui/react'
import { ShoppingCart, Plus, Minus, AlertTriangle, Check, ChevronDown } from 'lucide-react'
import type { GameState } from '../../core/types/gameState'
import { getState, setState, subscribe } from '../../core/state/gameStore'
import { INGREDIENTS, MENU } from '../../core/constants/data'
import { MENU_BY_ID } from '../../core/constants/lookup'
import { checkRecipeUnlocks } from '../../core/rules/progression'
import { calculateCOGM } from '../../core/rules/calculateCogm'
import { fmt, getRecipesUsingIngredient } from '../utils'
import { getIngredient } from '../utils'

export default function ShopPage() {
  const [state, setLocalState] = useState<GameState>(getState())
  useEffect(() => subscribe(s => setLocalState({ ...s })), [])

  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [cartExpanded, setCartExpanded] = useState<Set<string | number>>(new Set())
  const [ingredientDetailId, setIngredientDetailId] = useState<string | null>(null)

  const RECIPE_COLORS = ['success', 'warning', 'default'] as const

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

  const cartEntries = Object.entries(quantities).filter(([, qty]) => qty > 0)
  const cartTotal = cartEntries.reduce((sum, [id, qty]) => {
    const ingr = INGREDIENTS.find(i => i.id === id)
    return ingr ? sum + ingr.bulkCost * qty : sum
  }, 0)
  const cartItemCount = cartEntries.length

  const canAffordCart = cartTotal <= state.rubyBalance

  const buyAll = () => {
    const next = JSON.parse(JSON.stringify(getState())) as GameState
    const skipped: string[] = []

    for (const [id, qty] of cartEntries) {
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
        dayBought: next.businessDay,
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

    const { unlockedIds, boostEnds } = checkRecipeUnlocks(next.historicalPurchases, next.unlockedMenuIds, next.businessDay)
    for (const id of unlockedIds) {
      const menu = MENU_BY_ID.get(id)!
      next.unlockedMenuIds.push(id)
      next.activeMenus.push({ menuId: id, isActive: true, sellPrice: calculateCOGM(menu) * 2, popularityBoostEnd: boostEnds[id] ?? 0 })
      toast.success(`${menu.name} recipe unlocked`, {
        description: 'Check the Almanac to set your price.',
        indicator: <Check className="size-5 text-emerald-500" />,
      })
    }

    // Success toast for purchased items
    const purchasedCount = cartEntries.length - skipped.length
    if (purchasedCount > 0) {
      toast.success('Purchase complete', {
        description: `${purchasedCount} item${purchasedCount !== 1 ? 's' : ''} added to inventory.`,
        indicator: <Check className="size-5 text-emerald-500" />,
      })
    }

    setState(next)
    setLocalState({ ...next })
    setQuantities({})
  }

  const showCart = cartTotal > 0

  const shelfLabel = (shelfLifeDays: number) =>
    isFinite(shelfLifeDays) ? `${shelfLifeDays}d shelf` : 'Non-perishable'

  return (
    <div className="flex flex-col gap-3 pb-32 lg:pb-28">
      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <TextField
          className="flex-1"
          value={search}
          onChange={setSearch}
        >
          <Input placeholder="Search ingredients..." aria-label="Search ingredients" />
        </TextField>
        <Select
          className="sm:w-40"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map(i => {
          const qty = quantities[i.id] ?? 0
          const alreadyBought = unlockedIngredientIds.has(i.id)
          return (
            <Card key={i.id} className="text-center">
                <div className="flex justify-center pt-2">
                  <div className="relative w-full max-w-24">
                    <div className="aspect-square w-full rounded-xl bg-stone-200 dark:bg-stone-700" />
                    {alreadyBought && (
                      <div className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-[#f3f2ef] dark:border-[#0f0f0f] shadow-sm">
                        <Check className="size-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              <CardHeader>
                <span className="font-medium truncate block">{i.name}</span>
              </CardHeader>
              <CardContent className="pt-0 space-y-1">
                <p className="text-muted">
                  {fmt(i.bulkCost)} Ruby / {fmt(i.bulkUnit)} {i.unit}
                </p>
                <p className="text-muted">{shelfLabel(i.shelfLifeDays)}</p>
                {(() => {
                  const usedIn = getRecipesUsingIngredient(i.id)
                  if (usedIn.length === 0) return null
                  if (usedIn.length === MENU.length) {
                    return (
                      <div className="flex justify-center">
                        <Chip color="success" variant="soft" size="sm">Essential</Chip>
                      </div>
                    )
                  }
                  const maxVisible = 3
                  const visible = usedIn.slice(0, maxVisible)
                  const overflow = usedIn.length - maxVisible
                  return (
                    <div className="flex flex-wrap justify-center gap-1">
                      {visible.map((m, idx) => (
                        <Chip key={m.id} color={RECIPE_COLORS[idx % RECIPE_COLORS.length]} variant="soft" size="sm">
                          {m.name.replace(/^Iced /, '')}
                        </Chip>
                      ))}
                      {overflow > 0 && (
                        <Chip
                          color="default"
                          variant="soft"
                          size="sm"
                          className="cursor-pointer"
                          onClick={() => setIngredientDetailId(i.id)}
                        >
                          +{overflow} more
                        </Chip>
                      )}
                    </div>
                  )
                })()}
              </CardContent>
              <CardFooter className="flex flex-col gap-1.5">
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
                  <span className="w-6 text-center font-semibold tabular-nums">{qty}</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    isIconOnly
                    onPress={() => setQty(i.id, qty + 1)}
                  >
                    <Plus className="size-3" />
                  </Button>
                  {qty > 0 && (
                    <span className="text-muted tabular-nums">
                      {fmt(i.bulkCost * qty)} Ruby
                    </span>
                  )}
                </div>
              </CardFooter>
            </Card>
          )
        })}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-muted py-8">
            No ingredients match your filter.
          </p>
        )}
      </div>

      {/* Ingredient detail modal */}
      {ingredientDetailId && (() => {
        const detailIngredient = getIngredient(ingredientDetailId)
        const detailRecipes = getRecipesUsingIngredient(ingredientDetailId)
        return (
          <ModalBackdrop isOpen onOpenChange={(open) => !open && setIngredientDetailId(null)}>
            <ModalContainer>
              <ModalDialog className="max-w-sm">
                <ModalCloseTrigger />
                <ModalHeader>
                  <ModalHeading>{detailIngredient.name}</ModalHeading>
                </ModalHeader>
                <ModalBody>
                  <div className="flex flex-wrap gap-1.5">
                    {detailRecipes.map((m, idx) => (
                      <Chip key={m.id} color={RECIPE_COLORS[idx % RECIPE_COLORS.length]} variant="soft" size="sm">
                        {m.name}
                      </Chip>
                    ))}
                  </div>
                </ModalBody>
              </ModalDialog>
            </ModalContainer>
          </ModalBackdrop>
        )
      })()}

      {/* Cart island — pill on both mobile & desktop */}
      {showCart && (
        <>
          {/* Mobile */}
          <div className="fixed lg:hidden bottom-24 left-3 right-3 z-30 rounded-xl bg-surface shadow-sm px-4 py-2 flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <div className="shrink-0">
                <span className="text-muted">{cartItemCount} item{cartItemCount !== 1 ? 's' : ''}</span>
                <p className={`font-bold ${canAffordCart ? 'text-emerald-500' : 'text-danger'}`}>
                  {fmt(cartTotal)} Ruby
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Button variant="secondary" size="sm" onPress={() => setQuantities({})}>
                  Clear All
                </Button>
                <Button variant="primary" size="sm" isDisabled={!canAffordCart} onPress={buyAll}>
                  <ShoppingCart className="size-3.5" />
                  Purchase All
                </Button>
              </div>
            </div>
            <Accordion expandedKeys={cartExpanded} onExpandedChange={setCartExpanded}>
              <Accordion.Item id="cart-details">
                <Accordion.Heading>
                  <Accordion.Trigger className="flex items-center justify-between w-full text-muted">
                    Order details
                    <Accordion.Indicator />
                  </Accordion.Trigger>
                </Accordion.Heading>
                <Accordion.Panel>
                  <Accordion.Body className="pt-1 space-y-1">
                    {cartEntries.map(([id, qty]) => {
                      const ingr = INGREDIENTS.find(i => i.id === id)!
                      return (
                        <div key={id} className="flex items-center justify-between text-muted">
                          <span>{ingr.name}</span>
                          <span className="tabular-nums">{qty}× {fmt(ingr.bulkCost)} = {fmt(ingr.bulkCost * qty)}</span>
                        </div>
                      )
                    })}
                  </Accordion.Body>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </div>

          {/* Desktop */}
          <div className="hidden lg:flex fixed bottom-4 left-[15.5rem] right-3 z-30 rounded-xl bg-surface shadow-sm px-4 py-2 flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <div className="shrink-0">
                <span className="text-muted">{cartItemCount} item{cartItemCount !== 1 ? 's' : ''}</span>
                <p className={`font-bold ${canAffordCart ? 'text-emerald-500' : 'text-danger'}`}>
                  {fmt(cartTotal)} Ruby
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Button variant="secondary" size="sm" onPress={() => setQuantities({})}>
                  Clear All
                </Button>
                <Button variant="primary" size="sm" isDisabled={!canAffordCart} onPress={buyAll}>
                  <ShoppingCart className="size-3.5" />
                  Purchase All
                </Button>
              </div>
            </div>
            <Accordion expandedKeys={cartExpanded} onExpandedChange={setCartExpanded}>
              <Accordion.Item id="cart-details-desktop">
                <Accordion.Heading>
                  <Accordion.Trigger className="flex items-center justify-between w-full text-muted">
                    Order details
                    <Accordion.Indicator />
                  </Accordion.Trigger>
                </Accordion.Heading>
                <Accordion.Panel>
                  <Accordion.Body className="pt-1 space-y-1">
                    {cartEntries.map(([id, qty]) => {
                      const ingr = INGREDIENTS.find(i => i.id === id)!
                      return (
                        <div key={id} className="flex items-center justify-between text-muted">
                          <span>{ingr.name}</span>
                          <span className="tabular-nums">{qty}× {fmt(ingr.bulkCost)} = {fmt(ingr.bulkCost * qty)}</span>
                        </div>
                      )
                    })}
                  </Accordion.Body>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </div>
        </>
      )}
    </div>
  )
}
