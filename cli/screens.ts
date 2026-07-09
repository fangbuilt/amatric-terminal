import inquirer from 'inquirer'
import chalk from 'chalk'
import { getState, setState } from '../player/store'
import type { GameState } from '../player/types'
import { INGREDIENTS, MENU, CONSTANTS } from '../master/data'
import { checkRecipeUnlocks } from '../mechanics/progression'
import { calculateCOGM } from '../mechanics/pricing'
import { simulateDay } from '../simulation/engine'
import { displayHeader } from './display'
import { mainMenu } from './index'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ing = (id: string) => INGREDIENTS.find(i => i.id === id)!

function activeMenus(state: GameState) {
  return MENU.filter(m => state.activeMenus.find(pm => pm.menuId === m.id && pm.isActive))
}

// ---------------------------------------------------------------------------
// Shop
// ---------------------------------------------------------------------------

export async function shopScreen() {
  displayHeader()
  const state = getState()

  const choices = INGREDIENTS.map(i => ({
    name: `${i.name} — ${i.bulkCost} Ruby`,
    value: i.id,
  }))
  choices.push({ name: chalk.red('<-- Back'), value: 'back' })

  const { item } = await inquirer.prompt([{
    type: 'select', name: 'item', message: 'Select item to buy:', choices,
  }])
  if (item === 'back') return mainMenu()

  const ref = ing(item)
  if (state.rubyBalance < ref.bulkCost) {
    console.log(chalk.red(`\nNot enough Ruby! You need ${ref.bulkCost} Ruby.`))
    await inquirer.prompt([{ type: 'input', name: 'enter', message: 'Press Enter to continue...' }])
    return shopScreen()
  }

  const next = { ...state }
  next.rubyBalance -= ref.bulkCost
  next.inventory.push({
    id: Math.random().toString(36).substr(2, 9),
    ingredientId: ref.id,
    qty: ref.bulkUnit,
    dayBought: next.currentDay,
  })
  if (!next.historicalPurchases.includes(ref.id)) {
    next.historicalPurchases.push(ref.id)
  }

  console.log(chalk.green(`\nBought ${ref.name} for ${ref.bulkCost} Ruby!`))

  // Check for new recipe unlocks
  const unlocks = checkRecipeUnlocks(next.historicalPurchases, next.unlockedMenuIds)
  for (const id of unlocks) {
    const m = MENU.find(x => x.id === id)!
    console.log(chalk.bgGreen.black.bold(` 🎉 NEW MENU UNLOCKED: ${m.name}! 🎉 `))
    next.unlockedMenuIds.push(id)
    next.activeMenus.push({ menuId: id, isActive: true, sellPrice: calculateCOGM(m) * 2 })
  }

  setState(next)

  await inquirer.prompt([{ type: 'input', name: 'enter', message: 'Press Enter to continue...' }])
  return shopScreen()
}

// ---------------------------------------------------------------------------
// Menu Management
// ---------------------------------------------------------------------------

export async function menuScreen() {
  displayHeader()
  const state = getState()

  if (state.unlockedMenuIds.length === 0) {
    console.log(chalk.yellow("You haven't unlocked any menu yet. Buy ingredients first!"))
    await inquirer.prompt([{ type: 'input', name: 'enter', message: 'Press Enter to continue...' }])
    return mainMenu()
  }

  const choices = state.unlockedMenuIds.map(id => {
    const m = MENU.find(x => x.id === id)!
    const s = state.activeMenus.find(pm => pm.menuId === id)!
    const c = calculateCOGM(m)
    return {
      name: `${s.isActive ? chalk.green('[ON]') : chalk.red('[OFF]')} ${m.name} | Cost: ${c.toFixed(2)} | Sell: ${s.sellPrice} (${((s.sellPrice - c) / c * 100).toFixed(0)}% margin)`,
      value: id,
    }
  })
  choices.push({ name: chalk.red('<-- Back'), value: 'back' })

  const { sel } = await inquirer.prompt([{
    type: 'select', name: 'sel', message: 'Select menu to edit:', choices,
  }])
  if (sel === 'back') return mainMenu()

  const menuRef = MENU.find(x => x.id === sel)!
  console.log(chalk.blueBright(`\n--- RECIPE: ${menuRef.name} ---`))
  for (const line of menuRef.recipe) {
    const r = ing(line.ingredientId)
    console.log(`  ${r.name}: ${chalk.yellow(line.qtyNeeded)} ${r.unit}`)
  }
  console.log(chalk.bold(`TOTAL COST (COGM): ${calculateCOGM(menuRef).toFixed(2)} Ruby\n`))

  const { toggle, newPrice } = await inquirer.prompt([
    { type: 'confirm', name: 'toggle', message: 'Make this menu Active (available for sale)?', default: true },
    { type: 'number', name: 'newPrice', message: 'Enter new selling price (Ruby):' },
  ])

  const next = { ...state }
  const idx = next.activeMenus.findIndex(pm => pm.menuId === sel)
  next.activeMenus[idx].isActive = toggle
  if (!isNaN(newPrice)) next.activeMenus[idx].sellPrice = newPrice
  setState(next)

  return menuScreen()
}

// ---------------------------------------------------------------------------
// Inventory (FIFO Stack + Expiration + Out-of-Stock)
// ---------------------------------------------------------------------------

export async function inventoryScreen() {
  displayHeader()
  const state = getState()

  const sorted = [...state.inventory].sort((a, b) => a.dayBought - b.dayBought)
  const grouped: Record<string, typeof sorted> = {}
  for (const b of sorted) {
    if (!grouped[b.ingredientId]) grouped[b.ingredientId] = []
    grouped[b.ingredientId].push(b)
  }

  console.log(chalk.bold.blue('\n=== WAREHOUSE (FIFO STACK) ===\n'))

  if (state.inventory.length === 0) {
    console.log('Your warehouse is completely empty.')
  } else {
    for (const [id, batches] of Object.entries(grouped)) {
      const ref = ing(id)
      const total = batches.reduce((s, b) => s + b.qty, 0)
      console.log(chalk.bold(ref.name) + ` — Total: ${chalk.yellow(total)} ${ref.unit}`)
      batches.forEach((b, i) => {
        const age = state.currentDay - b.dayBought
        const expires = !isFinite(ref.shelfLifeDays)
          ? chalk.dim('Non-perishable')
          : ref.shelfLifeDays - age > 0
            ? chalk.green(`${ref.shelfLifeDays - age} days left`)
            : chalk.red(`EXPIRED (${age - ref.shelfLifeDays} day(s) ago)`)
        console.log(`  Batch #${i + 1}: ${b.qty} ${ref.unit} (bought day ${b.dayBought}, ${expires})`)
      })
      console.log('')
    }
  }

  // Items needed by active menus but completely out of stock
  const active = activeMenus(state)
  const needed = new Set(active.flatMap(m => m.recipe.map(r => r.ingredientId)))
  const stocked = new Set(state.inventory.map(b => b.ingredientId))
  const missing = [...needed].filter(id => !stocked.has(id))

  if (missing.length > 0) {
    console.log(chalk.bold.red('=== OUT OF STOCK (Needed for active menus) ==='))
    for (const id of missing) {
      const ref = ing(id)
      const usedIn = active.filter(m => m.recipe.some(r => r.ingredientId === id)).map(m => m.name)
      console.log(`  ${chalk.red(ref.name)} — required for: ${usedIn.join(', ')}`)
    }
    console.log('')
  }

  await inquirer.prompt([{ type: 'input', name: 'enter', message: 'Press Enter to continue...' }])
  return mainMenu()
}

// ---------------------------------------------------------------------------
// Advance Day (Daily Report)
// ---------------------------------------------------------------------------

export async function advanceScreen() {
  displayHeader()
  const state = getState()

  const capacity =
    (state.hasBarista ? CONSTANTS.STAFF.BARISTA.capacityBonus : 0) +
    (state.hasCashier ? CONSTANTS.STAFF.CASHIER.capacityBonus : 0)
  const activeCount = state.activeMenus.filter(pm => pm.isActive).length

  console.log(chalk.cyan(`📊 Forecast: ${CONSTANTS.BASE_DAILY_TRAFFIC} customers expected tomorrow`))
  console.log(chalk.dim(`   Staff capacity: ${capacity} cups/day | ${activeCount} active menu(s)`))

  if (activeCount === 0) {
    console.log(chalk.yellow('\n⚠ No active menus! Enable some in Menu Management first.'))
    await inquirer.prompt([{ type: 'input', name: 'enter', message: 'Press Enter to continue...' }])
    return mainMenu()
  }

  console.log(chalk.bold.yellow('\n☕ Opening the cafe... People are coming...\n'))
  await new Promise(r => setTimeout(r, 1200))

  const before = getState()
  const { newState, report: r } = simulateDay(before)
  setState(newState)

  console.log(chalk.bold.green(`\n--- DAILY REPORT (DAY ${before.currentDay}) ---`))

  const totalW = r.walkouts.tooExpensive + r.walkouts.outOfStock + r.walkouts.queueTooLong
  console.log(`Customers          : ${r.cupsSold} served, ${totalW} walkout(s) (of ${CONSTANTS.BASE_DAILY_TRAFFIC})`)
  console.log(chalk.dim(`   Staff capacity : ${capacity} cups`))
  console.log(`Cups Sold          : ${r.cupsSold}`)
  console.log(`Gross Revenue      : ${chalk.green(`+${r.grossRevenue.toFixed(2)}`)} Ruby`)
  console.log(`Cost of Goods      : ${chalk.red(`-${r.cogs.toFixed(2)}`)} Ruby`)
  console.log(`Operational Cost   : ${chalk.red(`-${r.opex.toFixed(2)}`)} Ruby`)
  if (r.spoilageLoss > 0) {
    console.log(`Spoilage Loss      : ${chalk.red(`-${r.spoilageLoss.toFixed(2)}`)} Ruby (${r.expiredIngredients.join(', ')})`)
  }
  const pStr = r.netProfit >= 0 ? chalk.green(`+${r.netProfit.toFixed(2)}`) : chalk.red(`${r.netProfit.toFixed(2)}`)
  console.log(chalk.bold(`NET PROFIT         : ${pStr} Ruby`))

  console.log(chalk.bold.blue(`\n--- WALKOUTS ---`))
  console.log(`Too Expensive  : ${r.walkouts.tooExpensive}`)
  console.log(`Out of Stock   : ${r.walkouts.outOfStock}`)
  console.log(`Queue Too Long : ${r.walkouts.queueTooLong}`)

  if (r.outOfStockItems.length > 0) {
    console.log(chalk.bold.red('\n--- ITEMS THAT RAN OUT ---'))
    for (const item of r.outOfStockItems) {
      console.log(`  • ${chalk.red(item)}`)
    }
  }

  if (r.netProfit > 0) {
    console.log(chalk.green('\n✅ Profitable day! Keep it up, Bayu.'))
  } else if (r.netProfit < 0) {
    console.log(chalk.red('\n📉 Loss-making day. Review your pricing and stock.'))
  }

  await inquirer.prompt([{ type: 'input', name: 'enter', message: 'Press Enter to sleep and wake up for the next day...' }])
  return mainMenu()
}

// ---------------------------------------------------------------------------
// Staff Management (Hire / Fire Cashier)
// ---------------------------------------------------------------------------

export async function hireScreen() {
  displayHeader()
  const state = getState()

  console.log(chalk.bold.blue('\n=== STAFF MANAGEMENT ===\n'))
  console.log(
    `Barista: ${state.hasBarista ? chalk.green('Employed') : chalk.red('Not hired')}`,
  )
  console.log(`  └ Wage: ${CONSTANTS.STAFF.BARISTA.dailyWage} Ruby/day | Capacity: +${CONSTANTS.STAFF.BARISTA.capacityBonus} cups`)
  console.log(
    `Cashier: ${state.hasCashier ? chalk.green('Employed') : chalk.red('Not hired')}`,
  )
  console.log(`  └ Wage: ${CONSTANTS.STAFF.CASHIER.dailyWage} Ruby/day | Capacity: +${CONSTANTS.STAFF.CASHIER.capacityBonus} cups`)

  const curCap =
    (state.hasBarista ? CONSTANTS.STAFF.BARISTA.capacityBonus : 0) +
    (state.hasCashier ? CONSTANTS.STAFF.CASHIER.capacityBonus : 0)
  console.log(chalk.cyan(`\nTotal staff capacity: ${curCap} cups/day`))

  const c: { name: string; value: string }[] = []
  if (!state.hasCashier) {
    c.push({ name: '💰 Hire Cashier (70 Ruby/day)', value: 'hire' })
  } else {
    c.push({ name: '⚠ Fire Cashier (save 70 Ruby/day)', value: 'fire' })
  }
  c.push({ name: chalk.red('<-- Back'), value: 'back' })

  const { action } = await inquirer.prompt([{
    type: 'select', name: 'action', message: 'Manage staff:', choices: c,
  }])
  if (action === 'back') return mainMenu()

  const next = { ...state }
  if (action === 'hire') {
    next.hasCashier = true
    console.log(chalk.green('\n✅ Cashier hired! They start tomorrow.'))
  } else {
    next.hasCashier = false
    console.log(chalk.yellow('\n👋 Cashier fired. You\'ll handle the counter yourself.'))
  }
  setState(next)

  await inquirer.prompt([{ type: 'input', name: 'enter', message: 'Press Enter to continue...' }])
  return hireScreen()
}
