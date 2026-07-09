import type { GameState } from '../player/types'
import type { DailyReport } from './types'
import { CONSTANTS, MENU, INGREDIENTS } from '../master/data'
import { calculateCOGM, willCustomerBuy } from '../mechanics/pricing'

export const simulateDay = (
  currentState: GameState,
): { newState: GameState; report: DailyReport } => {
  const newState: GameState = JSON.parse(JSON.stringify(currentState))
  const outOfStockItems = new Set<string>()

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

  // --- 1. OPERATING EXPENSES (staff wages) ---
  if (newState.hasBarista) report.opex += CONSTANTS.STAFF.BARISTA.dailyWage
  if (newState.hasCashier) report.opex += CONSTANTS.STAFF.CASHIER.dailyWage

  const maxCapacity =
    (newState.hasBarista ? CONSTANTS.STAFF.BARISTA.capacityBonus : 0) +
    (newState.hasCashier ? CONSTANTS.STAFF.CASHIER.capacityBonus : 0)

  // Only menus the player has activated
  const availableMenus = MENU.filter(m =>
    newState.activeMenus.find(pm => pm.menuId === m.id && pm.isActive),
  )

  // --- 2. CUSTOMER LOOP ---
  for (let i = 0; i < CONSTANTS.BASE_DAILY_TRAFFIC; i++) {
    if (availableMenus.length === 0) break

    // Queue capacity check
    if (report.cupsSold >= maxCapacity) {
      report.walkouts.queueTooLong++
      continue
    }

    // Weighted random pick based on menu popularity
    const totalWeight = availableMenus.reduce((sum, m) => sum + m.basePopularity, 0)
    let roll = Math.random() * totalWeight
    let pickedMenu = availableMenus[availableMenus.length - 1]
    for (const menu of availableMenus) {
      roll -= menu.basePopularity
      if (roll <= 0) {
        pickedMenu = menu
        break
      }
    }

    const setting = newState.activeMenus.find(pm => pm.menuId === pickedMenu.id)!
    const cogm = calculateCOGM(pickedMenu)

    // Price tolerance check
    if (!willCustomerBuy(setting.sellPrice, cogm)) {
      report.walkouts.tooExpensive++
      continue
    }

    // Stock availability check
    let canMake = true
    for (const req of pickedMenu.recipe) {
      const total = newState.inventory
        .filter(inv => inv.ingredientId === req.ingredientId)
        .reduce((sum, inv) => sum + inv.qty, 0)
      if (total < req.qtyNeeded) {
        canMake = false
        const ref = INGREDIENTS.find(i => i.id === req.ingredientId)
        if (ref) outOfStockItems.add(ref.name)
        break
      }
    }
    if (!canMake) {
      report.walkouts.outOfStock++
      continue
    }

    // Consume stock (FIFO — oldest batches first)
    for (const req of pickedMenu.recipe) {
      let need = req.qtyNeeded
      const batches = newState.inventory
        .filter(b => b.ingredientId === req.ingredientId && b.qty > 0)
        .sort((a, b) => a.dayBought - b.dayBought)
      for (const batch of batches) {
        const taken = Math.min(batch.qty, need)
        batch.qty -= taken
        need -= taken
        if (need <= 0) break
      }
    }

    // Sale recorded
    report.cupsSold++
    report.grossRevenue += setting.sellPrice
    report.cogs += cogm
  }

  report.outOfStockItems = [...outOfStockItems]

  // --- 3. SPOILAGE CHECK ---
  for (const batch of newState.inventory) {
    if (batch.qty <= 0) continue
    const ref = INGREDIENTS.find(i => i.id === batch.ingredientId)
    if (!ref || !isFinite(ref.shelfLifeDays)) continue // non-perishable
    const age = newState.currentDay - batch.dayBought
    if (age >= ref.shelfLifeDays) {
      report.spoilageLoss += (batch.qty / ref.bulkUnit) * ref.bulkCost
      batch.qty = 0
      if (!report.expiredIngredients.includes(ref.name)) {
        report.expiredIngredients.push(ref.name)
      }
    }
  }

  // Purge empty batches
  newState.inventory = newState.inventory.filter(b => b.qty > 0)

  // --- 4. FINANCIAL CLOSE ---
  report.netProfit = report.grossRevenue - report.cogs - report.opex - report.spoilageLoss
  // Cash changes: revenue in, opex out (cogs/spoilage already paid when purchased)
  newState.rubyBalance += report.grossRevenue - report.opex
  newState.currentDay++

  if (newState.rubyBalance < 0) {
    newState.isBankrupt = true
  }

  return { newState, report }
}
