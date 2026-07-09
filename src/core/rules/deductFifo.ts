import type { InventoryBatch } from '../types/gameState'

export const deductFifo = (
  inventory: InventoryBatch[],
  recipe: { ingredientId: string; qtyNeeded: number }[],
): void => {
  for (const item of recipe) {
    let need = item.qtyNeeded
    const sorted = inventory
      .filter(b => b.ingredientId === item.ingredientId && b.qty > 0)
      .sort((a, b) => a.dayBought - b.dayBought)
    for (const batch of sorted) {
      const taken = Math.min(batch.qty, need)
      batch.qty -= taken
      need -= taken
      if (need <= 0) break
    }
  }
}
