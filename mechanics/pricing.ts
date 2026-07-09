import { DrinkMenu } from "../master/types";
import { INGREDIENTS } from "../master/data"

export const calculateCOGM = (menu: DrinkMenu): number => {
  return menu.recipe.reduce((totalCost, item) => {
    const ingredient = INGREDIENTS.find(i => i.id === item.ingredientId);
    if (!ingredient) return totalCost;
    const costPerUnit = ingredient.bulkCost / ingredient.bulkUnit;
    return totalCost + (costPerUnit * item.qtyNeeded);
  }, 0);
};

export const willCustomerBuy = (sellPrice: number, cogm: number): boolean => {
  const markupPercent = ((sellPrice - cogm) / cogm) * 100;
  const roll = Math.random();

  if (markupPercent < 30) return true; // Murah meriah
  if (markupPercent >= 30 && markupPercent <= 60) return roll <= 0.90; // Wajar
  if (markupPercent > 60 && markupPercent <= 100) return roll <= 0.60; // Agak mahal
  if (markupPercent > 100 && markupPercent <= 200) return roll <= 0.10; // Overpriced
  return false; // Absurd, Walkout
};
