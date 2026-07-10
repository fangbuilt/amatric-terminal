import type { GameState } from '../core/types/gameState'
import { MENU } from '../core/constants/data'
import { INGREDIENT } from '../core/constants/lookup'

export const fmt = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const ing = (id: string) => INGREDIENT.get(id)!

export const activeMenus = (state: GameState) =>
  MENU.filter(menuDef =>
    state.activeMenus.find(menuSetting => menuSetting.menuId === menuDef.id && menuSetting.isActive),
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
