import { createStore } from 'zustand/vanilla'
import type { GameState } from '../types/gameState'
import { CONSTANTS, DATA_VERSION } from '../constants/data'

const initialState: GameState = {
  businessDay: 1,
  totalDaysElapsed: 1,
  dataVersion: DATA_VERSION,
  prestigeTier: 0,
  prestigeHistory: [],
  stats: {
    highestDailyProfit: 0,
    highestDailyRevenue: 0,
    totalCupsSold: 0,
    fastestBreakEven: null,
  },
  rubyBalance: CONSTANTS.STARTING_CAPITAL,
  inventory: [],
  historicalPurchases: [],
  unlockedMenuIds: [],
  activeMenus: [],
  hasBarista: true,
  hasCashier: false,
  isBankrupt: false,
  accumulatedGrossRevenue: 0,
  accumulatedNetProfit: 0,
  dailyHistory: [],
}

const store = createStore<GameState>(() => initialState)

export const getState = store.getState
export const setState = (next: GameState) => store.setState(next, true)
export const subscribe = store.subscribe
