import { MENU } from '../constants/data'

export const checkRecipeUnlocks = (
  historicalPurchases: string[],
  currentUnlocked: string[],
): string[] => {
  const newUnlocks: string[] = []
  for (const menu of MENU) {
    if (currentUnlocked.includes(menu.id)) continue
    if (menu.recipe.every(req => historicalPurchases.includes(req.ingredientId))) {
      newUnlocks.push(menu.id)
    }
  }
  return newUnlocks
}
