import { createStore } from 'zustand/vanilla'
import type { GameState } from '../types/gameState'
import { CONSTANTS } from '../constants/data'

const initialState: GameState = {
  currentDay: 1,
  rubyBalance: CONSTANTS.STARTING_CAPITAL,
  inventory: [],
  historicalPurchases: [],
  unlockedMenuIds: [],
  activeMenus: [],
  hasBarista: true,
  hasCashier: false,
  isBankrupt: false,
}

const store = createStore<GameState>(() => initialState)

export const getState = store.getState
export const setState = (next: GameState) => store.setState(next, true)
export const subscribe = store.subscribe
