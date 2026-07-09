import { DrinkMenu, Ingredient } from "./types";

export const INGREDIENTS: Ingredient[] = [
  { id: 'coffee_beans', name: 'House Blend Beans (1kg)', bulkCost: 120, bulkUnit: 1000, unit: 'g', shelfLifeDays: Infinity },
  { id: 'fresh_milk', name: 'Fresh Milk (1L)', bulkCost: 20, bulkUnit: 1000, unit: 'ml', shelfLifeDays: 4 },
  { id: 'palm_sugar', name: 'Palm Sugar Syrup (500ml)', bulkCost: 25, bulkUnit: 500, unit: 'ml', shelfLifeDays: 30 },
  { id: 'matcha_powder', name: 'Matcha Powder (500g)', bulkCost: 150, bulkUnit: 500, unit: 'g', shelfLifeDays: 60 },
  { id: 'simple_syrup', name: 'Simple Syrup (1L)', bulkCost: 15, bulkUnit: 1000, unit: 'ml', shelfLifeDays: 90 },
  { id: 'water', name: 'Mineral Water (19L Gallon)', bulkCost: 25, bulkUnit: 19000, unit: 'ml', shelfLifeDays: Infinity },
  { id: 'ice_cubes', name: 'Crystal Ice (5kg)', bulkCost: 15, bulkUnit: 5000, unit: 'g', shelfLifeDays: Infinity },
  { id: 'cup_400ml', name: '400ml Cups (100 pcs)', bulkCost: 50, bulkUnit: 100, unit: 'pcs', shelfLifeDays: Infinity },
];

export const MENU: DrinkMenu[] = [
  {
    id: 'iced_brown_sugar_latte',
    name: 'Iced Brown Sugar Latte',
    basePopularity: 80,
    recipe: [
      { ingredientId: 'coffee_beans', qtyNeeded: 15 },
      { ingredientId: 'fresh_milk', qtyNeeded: 120 },
      { ingredientId: 'palm_sugar', qtyNeeded: 25 },
      { ingredientId: 'ice_cubes', qtyNeeded: 150 },
      { ingredientId: 'cup_400ml', qtyNeeded: 1 }
    ]
  },
  {
    id: 'iced_matcha_latte',
    name: 'Iced Matcha Latte',
    basePopularity: 50,
    recipe: [
      { ingredientId: 'matcha_powder', qtyNeeded: 10 },
      { ingredientId: 'fresh_milk', qtyNeeded: 120 },
      { ingredientId: 'simple_syrup', qtyNeeded: 15 },
      { ingredientId: 'water', qtyNeeded: 30 },
      { ingredientId: 'ice_cubes', qtyNeeded: 150 },
      { ingredientId: 'cup_400ml', qtyNeeded: 1 }
    ]
  },
  {
    id: 'iced_americano',
    name: 'Iced Americano',
    basePopularity: 30,
    recipe: [
      { ingredientId: 'coffee_beans', qtyNeeded: 15 },
      { ingredientId: 'water', qtyNeeded: 150 },
      { ingredientId: 'ice_cubes', qtyNeeded: 150 },
      { ingredientId: 'cup_400ml', qtyNeeded: 1 }
    ]
  }
];

export const CONSTANTS = {
  STARTING_CAPITAL: 5000,
  BASE_DAILY_TRAFFIC: 100,
  STAFF: {
    BARISTA: { dailyWage: 100, capacityBonus: 100 },
    CASHIER: { dailyWage: 70, capacityBonus: 60 }
  }
};
