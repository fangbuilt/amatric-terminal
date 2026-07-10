import { sumBy } from 'lodash-es'
import type { GameState, InventoryBatch } from '../types/gameState'
import type { DailyReport } from '../types/dailyReport'
import { CONSTANTS, MENU } from '../constants/data'
import { INGREDIENT } from '../constants/lookup'
import { calculateCOGM } from './calculateCogm'
import { willCustomerBuy } from './willCustomerBuy'
import { deductFifo } from './deductFifo'
import { checkExpiry } from './checkExpiry'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type Menu = (typeof MENU)[number]

function pickMenu(active: Menu[]): Menu {
  const total = sumBy(active, 'basePopularity')
  let roll = Math.random() * total
  for (const m of active) {
    roll -= m.basePopularity
    if (roll <= 0) return m
  }
  return active[active.length - 1]
}

function hasStock(
  inventory: InventoryBatch[],
  recipe: Menu['recipe'],
  missing: Set<string>,
): boolean {
  for (const item of recipe) {
    const onHand = sumBy(
      inventory.filter(b => b.ingredientId === item.ingredientId),
      'qty',
    )
    if (onHand < item.qtyNeeded) {
      const ingredient = INGREDIENT.get(item.ingredientId)
      if (ingredient) missing.add(ingredient.name)
      return false
    }
  }
  return true
}

// ---------------------------------------------------------------------------
// Day simulation
// ---------------------------------------------------------------------------

export const simulateDay = (
  state: GameState,
): { newState: GameState; report: DailyReport } => {
  const cloned = JSON.parse(JSON.stringify(state)) as GameState

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
  if (cloned.hasBarista) report.opex += CONSTANTS.STAFF.BARISTA.dailyWage
  if (cloned.hasCashier) report.opex += CONSTANTS.STAFF.CASHIER.dailyWage

  const capacity =
    (cloned.hasBarista ? CONSTANTS.STAFF.BARISTA.capacityBonus : 0) +
    (cloned.hasCashier ? CONSTANTS.STAFF.CASHIER.capacityBonus : 0)

  const activeMenus = MENU.filter(m =>
    cloned.activeMenus.find(menuSetting => menuSetting.menuId === m.id && menuSetting.isActive),
  )

  // 2. Customer service
  const outOfStock = new Set<string>()

  for (let i = 0; i < CONSTANTS.BASE_DAILY_TRAFFIC; i++) {
    if (activeMenus.length === 0) break
    if (report.cupsSold >= capacity) {
      report.walkouts.queueTooLong++
      continue
    }

    const menu = pickMenu(activeMenus)
    const setting = cloned.activeMenus.find(menuSetting => menuSetting.menuId === menu.id)!
    const cogm = calculateCOGM(menu)

    if (!willCustomerBuy(setting.sellPrice, cogm)) {
      report.walkouts.tooExpensive++
      continue
    }
    if (!hasStock(cloned.inventory, menu.recipe, outOfStock)) {
      report.walkouts.outOfStock++
      continue
    }

    deductFifo(cloned.inventory, menu.recipe)
    report.cupsSold++
    report.grossRevenue += setting.sellPrice
    report.cogs += cogm
  }

  report.outOfStockItems = [...outOfStock]

  // 3. Expiration
  const expired = checkExpiry(cloned.inventory, cloned.currentDay)
  report.spoilageLoss = expired.spoilageLoss
  report.expiredIngredients = expired.expiredIngredients

  // 4. Cleanup
  cloned.inventory = cloned.inventory.filter(b => b.qty > 0)

  // 5. Financial close
  report.netProfit =
    report.grossRevenue - report.cogs - report.opex - report.spoilageLoss
  cloned.rubyBalance += report.grossRevenue - report.opex

  // 6. Accumulate & archive
  cloned.accumulatedGrossRevenue += report.grossRevenue
  cloned.accumulatedNetProfit += report.netProfit
  cloned.dailyHistory.push(report)

  cloned.currentDay++
  if (cloned.rubyBalance < 0) cloned.isBankrupt = true

  return { newState: cloned, report }
}
