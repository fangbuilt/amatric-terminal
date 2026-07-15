import { MENU } from '../constants/data'

export const checkRecipeUnlocks = (
  historicalPurchases: string[],
  currentUnlocked: string[],
  businessDay: number,
): { unlockedIds: string[]; boostEnds: Record<string, number> } => {
  const newUnlocks: string[] = []
  const boostEnds: Record<string, number> = {}

  for (const menu of MENU) {
    if (currentUnlocked.includes(menu.id)) continue

    // Must have purchased all ingredients for this recipe
    if (!menu.recipe.every(req => historicalPurchases.includes(req.ingredientId))) continue

    // Sequential unlock: all recipes with lower unlockOrder must already be unlocked
    // (unlockOrder 0 items are always eligible)
    if (menu.unlockOrder > 0) {
      const lowerOrdersReady = MENU
        .filter(other => other.unlockOrder > 0 && other.unlockOrder < menu.unlockOrder)
        .every(other => currentUnlocked.includes(other.id) || newUnlocks.includes(other.id))
      if (!lowerOrdersReady) continue
    }

    newUnlocks.push(menu.id)
    // Boost lasts for 5 business days after unlock
    boostEnds[menu.id] = businessDay + 5
  }

  return { unlockedIds: newUnlocks, boostEnds }
}
