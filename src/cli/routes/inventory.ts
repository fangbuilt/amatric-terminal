import inquirer from 'inquirer'
import chalk from 'chalk'
import { getState } from '../../core/state/gameStore'
import { sumBy, groupBy, sortBy } from 'lodash-es'
import { displayHeader } from '../components/displayHeader'
import { fmt, ing, activeMenus, getExpiringTomorrow } from '../utils'
import { mainMenu } from '../index'

export async function inventoryRoute() {
  displayHeader()
  const state = getState()

  const sorted = sortBy(state.inventory, 'dayBought')
  const grouped = groupBy(sorted, 'ingredientId')

  console.log(chalk.bold.blue('\n=== WAREHOUSE (FIFO STACK) ===\n'))

  if (state.inventory.length === 0) {
    console.log('Your warehouse is completely empty.')
  } else {
    for (const [id, batches] of Object.entries(grouped)) {
      const ingredient = ing(id)
      const total = sumBy(batches, 'qty')
      console.log(chalk.bold(ingredient.name) + ` — Total: ${chalk.yellow(fmt(total))} ${ingredient.unit}`)
      batches.forEach((batch, i) => {
        const age = state.currentDay - batch.dayBought
        const expirationLabel = !isFinite(ingredient.shelfLifeDays)
          ? chalk.dim('Non-perishable')
          : ingredient.shelfLifeDays - age > 0
            ? chalk.green(`${ingredient.shelfLifeDays - age} day(s) left`)
            : chalk.red(`EXPIRED (since day ${batch.dayBought + ingredient.shelfLifeDays})`)
        console.log(`  Batch #${i + 1}: ${fmt(batch.qty)} ${ingredient.unit} (bought day ${batch.dayBought}, ${expirationLabel})`)
      })
      console.log('')
    }
  }

  // D-1 expiry warning
  const expiringTomorrow = getExpiringTomorrow(state)
  if (expiringTomorrow.length > 0) {
    console.log(chalk.bold.red('=== EXPIRING TOMORROW ==='))
    for (const name of expiringTomorrow) {
      console.log(`  ${chalk.red('⚠')} ${chalk.red(name)}`)
    }
    console.log('')
  }

  // Items needed by active menus but completely out of stock
  const active = activeMenus(state)
  const needed = new Set(active.flatMap(menu => menu.recipe.map(item => item.ingredientId)))
  const stocked = new Set(state.inventory.map(batch => batch.ingredientId))
  const missing = [...needed].filter(id => !stocked.has(id))

  if (missing.length > 0) {
    console.log(chalk.bold.red('=== OUT OF STOCK (Needed for active menus) ==='))
    for (const id of missing) {
      const ingredient = ing(id)
      const usedIn = active
        .filter(menu => menu.recipe.some(item => item.ingredientId === id))
        .map(menu => menu.name)
      console.log(`  ${chalk.red(ingredient.name)} — required for: ${usedIn.join(', ')}`)
    }
    console.log('')
  }

  if (missing.length === 0 && state.inventory.length > 0) {
    console.log(chalk.green('All items for active menus are in stock ✓\n'))
  }

  await inquirer.prompt([{ type: 'input', name: 'enter', message: 'Press Enter to continue...' }])
  return mainMenu()
}
