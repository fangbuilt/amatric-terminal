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
  popularityBoostEnd: number
}

export interface GameStats {
  highestDailyProfit: number
  highestDailyRevenue: number
  totalCupsSold: number
  fastestBreakEven: number | null
}

export interface PrestigeRecord {
  tier: number
  businessDay: number
  accumulatedNetProfit: number
}

import type { DailyReport } from './dailyReport'

export interface GameState {
  businessDay: number
  totalDaysElapsed: number
  dataVersion: number
  prestigeTier: number
  prestigeHistory: PrestigeRecord[]
  stats: GameStats
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
