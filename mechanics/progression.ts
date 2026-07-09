import { MENU } from "../master/data";

export const checkRecipeUnlocks = (historicalPurchases: string[], currentUnlocked: string[]): string[] => {
  const newUnlocks: string[] = [];
  MENU.forEach(menu => {
    if (!currentUnlocked.includes(menu.id)) {
      // Cek apakah semua bahan di resep udah pernah dibeli player
      const hasAllIngredients = menu.recipe.every(req => historicalPurchases.includes(req.ingredientId));
      if (hasAllIngredients) {
        newUnlocks.push(menu.id);
      }
    }
  });
  return newUnlocks;
};
