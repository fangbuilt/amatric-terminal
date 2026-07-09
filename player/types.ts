export interface InventoryBatch {
  id: string; // Unique ID per batch belanja
  ingredientId: string;
  qty: number;
  dayBought: number;
}

export interface PlayerMenuSetting {
  menuId: string;
  isActive: boolean;
  sellPrice: number;
}

export interface GameState {
  currentDay: number;
  rubyBalance: number;
  inventory: InventoryBatch[];
  historicalPurchases: string[]; // Buat nge-track Recipe Unlocks
  unlockedMenuIds: string[];
  activeMenus: PlayerMenuSetting[];
  hasBarista: boolean;
  hasCashier: boolean;
  isBankrupt: boolean;
}
