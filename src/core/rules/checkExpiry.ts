import type { DailyReport } from '../types/dailyReport'
import type { InventoryBatch } from '../types/gameState'
import { INGREDIENT } from '../constants/lookup'

export const checkExpiry = (
  inventory: InventoryBatch[],
  currentDay: number,
): Pick<DailyReport, 'spoilageLoss' | 'expiredIngredients'> => {
  let spoilageLoss = 0
  const expiredIngredients: string[] = []

  for (const batch of inventory) {
    if (batch.qty <= 0) continue
    const ingredient = INGREDIENT.get(batch.ingredientId)
    if (!ingredient || !isFinite(ingredient.shelfLifeDays)) continue
    if (currentDay - batch.dayBought >= ingredient.shelfLifeDays) {
      spoilageLoss += (batch.qty / ingredient.bulkUnit) * ingredient.bulkCost
      batch.qty = 0
      if (!expiredIngredients.includes(ingredient.name)) {
        expiredIngredients.push(ingredient.name)
      }
    }
  }

  return { spoilageLoss, expiredIngredients }
}
