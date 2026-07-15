export type Unit = 'g' | 'ml' | 'pcs'

export interface Ingredient {
  id: string
  name: string
  bulkCost: number
  bulkUnit: number
  unit: Unit
  shelfLifeDays: number
}

export interface RecipeLine {
  ingredientId: string
  qtyNeeded: number
}

export interface DrinkMenu {
  id: string
  name: string
  recipe: RecipeLine[]
  basePopularity: number
  unlockOrder: number
}
