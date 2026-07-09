export type Unit = 'g' | 'ml' | 'pcs';

export interface Ingredient {
  id: string;
  name: string;
  bulkCost: number;       // Harga Grosir (Ruby)
  bulkUnit: number;       // Jumlah isi per Grosir
  unit: Unit;
  shelfLifeDays: number;  // Infinity buat yang non-perishable
}

export interface RecipeLine {
  ingredientId: string;
  qtyNeeded: number;
}

export interface DrinkMenu {
  id: string;
  name: string;
  recipe: RecipeLine[];
  basePopularity: number;
}
