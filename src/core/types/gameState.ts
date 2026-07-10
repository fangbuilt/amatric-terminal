export interface InventoryBatch {
  id: string
  ingredientId: string
  qty: number
  dayBought: number
}

export interface PlayerMenuSetting {
  menuId: string
  isActive: boolean
  sellPrice: number
}

import type { DailyReport } from './dailyReport'

export interface GameState {
  currentDay: number
  rubyBalance: number
  inventory: InventoryBatch[]
  historicalPurchases: string[]
  unlockedMenuIds: string[]
  activeMenus: PlayerMenuSetting[]
  hasBarista: boolean
  hasCashier: boolean
  isBankrupt: boolean
  accumulatedGrossRevenue: number
  accumulatedNetProfit: number
  dailyHistory: DailyReport[]
}
