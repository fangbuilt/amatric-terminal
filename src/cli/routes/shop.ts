import inquirer from 'inquirer'
import chalk from 'chalk'
import { getState, setState } from '../../core/state/gameStore'
import { INGREDIENTS } from '../../core/constants/data'
import { MENU_BY_ID } from '../../core/constants/lookup'
import { checkRecipeUnlocks } from '../../core/rules/progression'
import { calculateCOGM } from '../../core/rules/calculateCogm'
import { displayHeader } from '../components/displayHeader'
import { fmt, ing } from '../utils'
import { mainMenu } from '../index'

export async function shopRoute() {
  displayHeader()
  const state = getState()

  const choices = INGREDIENTS.map(i => ({
    name: `${i.name} — ${fmt(i.bulkCost)} Ruby (${(i.bulkCost / i.bulkUnit).toFixed(4)}/unit)`,
    value: i.id,
  }))
  choices.push({ name: chalk.red('<-- Back'), value: 'back' })

  const { selectedId } = await inquirer.prompt([{
    type: 'select', name: 'selectedId', message: 'Select item to buy:', choices,
  }])
  if (selectedId === 'back') return mainMenu()

  const ingredient = ing(selectedId)
  const maxQty = Math.floor(state.rubyBalance / ingredient.bulkCost)

  const { qty } = await inquirer.prompt([{
    type: 'number',
    name: 'qty',
    message: `Quantity (${fmt(ingredient.bulkCost)} Ruby each, max ${maxQty}):`,
    default: 1,
  }])
  if (!qty || qty < 1) return shopRoute()

  if (qty > maxQty) {
    console.log(chalk.red(
      `\nNot enough Ruby! ${qty}x would cost ${fmt(ingredient.bulkCost * qty)} Ruby but you only have ${fmt(state.rubyBalance)} Ruby.`,
    ))
    await inquirer.prompt([{ type: 'input', name: 'enter', message: 'Press Enter to continue...' }])
    return shopRoute()
  }

  const totalCost = ingredient.bulkCost * qty
  const next = { ...state }
  next.rubyBalance -= totalCost

  // One FIFO batch with combined quantity (same dayBought)
  next.inventory.push({
    id: Math.random().toString(36).substr(2, 9),
    ingredientId: ingredient.id,
    qty: ingredient.bulkUnit * qty,
    dayBought: next.currentDay,
  })

  if (!next.historicalPurchases.includes(ingredient.id)) {
    next.historicalPurchases.push(ingredient.id)
  }

  console.log(chalk.green(`\n✅ Bought ${qty}x ${ingredient.name} for ${fmt(totalCost)} Ruby!`))

  const unlocks = checkRecipeUnlocks(next.historicalPurchases, next.unlockedMenuIds)
  for (const id of unlocks) {
    const menu = MENU_BY_ID.get(id)!
    console.log(chalk.bgGreen.black.bold(` 🎉 NEW MENU UNLOCKED: ${menu.name}! 🎉 `))
    next.unlockedMenuIds.push(id)
    next.activeMenus.push({ menuId: id, isActive: true, sellPrice: calculateCOGM(menu) * 2 })
  }

  setState(next)

  // TODO (frontend): Add batch-purchase UI — let player tick multiple
  // ingredients and buy them all at once, like a supplier order form.
  // That way they don't have to repeat buying the same thing over and over.

  await inquirer.prompt([{ type: 'input', name: 'enter', message: 'Press Enter to continue...' }])
  return shopRoute()
}
