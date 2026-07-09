import type { DrinkMenu } from '../types/ingredient'
import { INGREDIENT } from '../constants/lookup'

export const calculateCOGM = (menu: DrinkMenu): number =>
  menu.recipe.reduce((sum, item) => {
    const ingredient = INGREDIENT.get(item.ingredientId)
    return ingredient
      ? sum + (ingredient.bulkCost / ingredient.bulkUnit) * item.qtyNeeded
      : sum
  }, 0)
