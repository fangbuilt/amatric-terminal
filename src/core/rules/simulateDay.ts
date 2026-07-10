import type { GameState } from '../types/gameState'
import type { DailyReport } from '../types/dailyReport'
import { CONSTANTS, MENU } from '../constants/data'
import { calculateCOGM } from './calculateCogm'
import { willCustomerBuy } from './willCustomerBuy'
import { deductFifo } from './deductFifo'
import { checkExpiry } from './checkExpiry'
import { pickMenu } from './pickMenu'
import { hasStock } from './hasStock'

/** Deep-clone state to simulate day without mutation side effects. */
const cloneState = (state: GameState): GameState =>
  JSON.parse(JSON.stringify(state))

/** Calculate staff opex for the day. */
const calculateOpex = (state: GameState): number => {
  let opex = 0
  if (state.hasBarista) opex += CONSTANTS.STAFF.BARISTA.dailyWage
  if (state.hasCashier) opex += CONSTANTS.STAFF.CASHIER.dailyWage
  return opex
}

/** Calculate max cups the cafe can produce in a day. */
const calculateCapacity = (state: GameState): number => {
  let cap = 0
  if (state.hasBarista) cap += CONSTANTS.STAFF.BARISTA.capacityBonus
  if (state.hasCashier) cap += CONSTANTS.STAFF.CASHIER.capacityBonus
  return cap
}

/** Filter to currently active menu definitions. */
const getActiveMenus = (state: GameState) =>
  MENU.filter(m =>
    state.activeMenus.find(s => s.menuId === m.id && s.isActive),
  )

/** Serve one customer at a time. Returns true if a sale was made. */
const serveCustomer = (
  state: GameState,
  report: DailyReport,
  activeMenus: typeof MENU,
  outOfStock: Set<string>,
): boolean => {
  const menu = pickMenu(activeMenus)
  const setting = state.activeMenus.find(s => s.menuId === menu.id)!
  const cogm = calculateCOGM(menu)

  if (!willCustomerBuy(setting.sellPrice, cogm)) {
    report.walkouts.tooExpensive++
    return false
  }
  if (!hasStock(state.inventory, menu.recipe, outOfStock)) {
    report.walkouts.outOfStock++
    return false
  }

  deductFifo(state.inventory, menu.recipe)
  report.cupsSold++
  report.grossRevenue += setting.sellPrice
  report.cogs += cogm
  return true
}

/** Close the day's finances. */
const closeDayFinances = (state: GameState, report: DailyReport): void => {
  report.netProfit =
    report.grossRevenue - report.cogs - report.opex - report.spoilageLoss
  state.rubyBalance += report.grossRevenue - report.opex
  state.accumulatedGrossRevenue += report.grossRevenue
  state.accumulatedNetProfit += report.netProfit
  state.dailyHistory.push(report)
  state.currentDay++
  if (state.rubyBalance < 0) state.isBankrupt = true
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const simulateDay = (
  state: GameState,
): { newState: GameState; report: DailyReport } => {
  const cloned = cloneState(state)

  const report: DailyReport = {
    grossRevenue: 0,
    cogs: 0,
    opex: 0,
    spoilageLoss: 0,
    netProfit: 0,
    cupsSold: 0,
    walkouts: { tooExpensive: 0, outOfStock: 0, queueTooLong: 0 },
    expiredIngredients: [],
    outOfStockItems: [],
  }

  // 1. Staff costs
  report.opex = calculateOpex(cloned)
  const capacity = calculateCapacity(cloned)
  const active = getActiveMenus(cloned)

  // 2. Customer service loop
  const outOfStock = new Set<string>()
  for (let i = 0; i < CONSTANTS.BASE_DAILY_TRAFFIC; i++) {
    if (active.length === 0) break
    if (report.cupsSold >= capacity) {
      report.walkouts.queueTooLong++
      continue
    }
    serveCustomer(cloned, report, active, outOfStock)
  }
  report.outOfStockItems = [...outOfStock]

  // 3. Handle expiration
  const expired = checkExpiry(cloned.inventory, cloned.currentDay)
  report.spoilageLoss = expired.spoilageLoss
  report.expiredIngredients = expired.expiredIngredients

  // 4. Clean up empty batches
  cloned.inventory = cloned.inventory.filter(b => b.qty > 0)

  // 5. Close finances
  closeDayFinances(cloned, report)

  return { newState: cloned, report }
}
