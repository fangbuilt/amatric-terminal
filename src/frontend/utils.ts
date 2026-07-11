import type { GameState } from '../core/types/gameState'
import { MENU } from '../core/constants/data'
import { INGREDIENT } from '../core/constants/lookup'

/** Format a number as currency (Ruby). Whole numbers show without decimals. */
export const fmt = (n: number) =>
  n.toLocaleString('en-US', {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 1,
    maximumFractionDigits: 2,
  })

/** Look up an ingredient definition by ID. */
export const getIngredient = (id: string) => INGREDIENT.get(id)!

/** Get menu definitions that are currently active (enabled for sale). */
export const activeMenus = (state: GameState) =>
  MENU.filter(menuDef =>
    state.activeMenus.find(setting => setting.menuId === menuDef.id && setting.isActive),
  )

/** Names of ingredients with at least one batch expiring tomorrow. */
export const getExpiringTomorrow = (state: GameState): string[] => {
  const names: string[] = []
  for (const batch of state.inventory) {
    if (batch.qty <= 0) continue
    const ingredient = INGREDIENT.get(batch.ingredientId)
    if (!ingredient || !isFinite(ingredient.shelfLifeDays)) continue
    if (state.currentDay + 1 - batch.dayBought >= ingredient.shelfLifeDays) {
      if (!names.includes(ingredient.name)) names.push(ingredient.name)
    }
  }
  return names
}

/** Total quantity on hand for a given ingredient (summed across FIFO batches). */
export const totalOnHand = (state: GameState, ingredientId: string): number =>
  state.inventory
    .filter(b => b.ingredientId === ingredientId)
    .reduce((sum, b) => sum + Math.max(0, b.qty), 0)
