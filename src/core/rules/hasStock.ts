import { sumBy } from 'lodash-es'
import type { InventoryBatch } from '../types/gameState'
import type { RecipeLine } from '../types/ingredient'
import { INGREDIENT } from '../constants/lookup'

/** Check if inventory has enough of each recipe item. Collects missing ingredient names. */
export const hasStock = (
  inventory: InventoryBatch[],
  recipe: RecipeLine[],
  missing: Set<string>,
): boolean => {
  for (const item of recipe) {
    const onHand = sumBy(
      inventory.filter(b => b.ingredientId === item.ingredientId),
      'qty',
    )
    if (onHand < item.qtyNeeded) {
      const ingredient = INGREDIENT.get(item.ingredientId)
      if (ingredient) missing.add(ingredient.name)
      return false
    }
  }
  return true
}
