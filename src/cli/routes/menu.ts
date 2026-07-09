import inquirer from 'inquirer'
import chalk from 'chalk'
import { getState, setState } from '../../core/state/gameStore'
import { MENU_BY_ID } from '../../core/constants/lookup'
import { calculateCOGM } from '../../core/rules/calculateCogm'
import { displayHeader } from '../components/displayHeader'
import { fmt, ing } from '../utils'
import { mainMenu } from '../index'

export async function menuRoute() {
  displayHeader()
  const state = getState()

  if (state.unlockedMenuIds.length === 0) {
    console.log(chalk.yellow("You haven't unlocked any menu yet. Buy ingredients first!"))
    await inquirer.prompt([{ type: 'input', name: 'enter', message: 'Press Enter to continue...' }])
    return mainMenu()
  }

  const choices = state.unlockedMenuIds.map(id => {
    const menu = MENU_BY_ID.get(id)!
    const setting = state.activeMenus.find(menuSetting => menuSetting.menuId === id)!
    const cost = calculateCOGM(menu)
    return {
      name: `${setting.isActive ? chalk.green('[ON]') : chalk.red('[OFF]')} ${menu.name} | Cost: ${fmt(cost)} | Sell: ${fmt(setting.sellPrice)} (${((setting.sellPrice - cost) / cost * 100).toFixed(0)}% margin)`,
      value: id,
    }
  })
  choices.push({ name: chalk.red('<-- Back'), value: 'back' })

  const { selectedId } = await inquirer.prompt([{
    type: 'select', name: 'selectedId', message: 'Select a menu to inspect:', choices,
  }])
  if (selectedId === 'back') return mainMenu()

  const menu = MENU_BY_ID.get(selectedId)!
  const setting = state.activeMenus.find(menuSetting => menuSetting.menuId === selectedId)!
  const cogm = calculateCOGM(menu)

  // View recipe & measures
  console.log(chalk.blueBright(`\n--- RECIPE: ${menu.name} ---`))
  for (const line of menu.recipe) {
    const ingredient = ing(line.ingredientId)
    console.log(`  ${chalk.yellow(line.qtyNeeded)} ${ingredient.unit} — ${ingredient.name}`)
  }
  console.log(chalk.bold(`\nCOST OF GOODS: ${fmt(cogm)} Ruby`))
  console.log(`Selling Price : ${chalk.yellow(fmt(setting.sellPrice))} Ruby`)
  console.log(`Status        : ${setting.isActive ? chalk.green('Active') : chalk.red('Inactive')}`)
  console.log(`Margin        : ${((setting.sellPrice - cogm) / cogm * 100).toFixed(1)}%`)

  const { action } = await inquirer.prompt([{
    type: 'select',
    name: 'action',
    message: 'What would you like to do?',
    choices: [
      { name: chalk.red('← Back to menu list'), value: 'back' },
      { name: '✏ Edit price & availability', value: 'edit' },
    ],
  }])

  if (action === 'back') return menuRoute()

  // Edit form
  const { toggle, newPrice } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'toggle',
      message: 'Make this menu Active (available for sale)?',
      default: setting.isActive,
    },
    {
      type: 'number',
      name: 'newPrice',
      message: 'Enter new selling price (Ruby, 0 to cancel):',
      default: setting.sellPrice,
    },
  ])

  // Cancel if price is 0 or invalid
  if (!newPrice || newPrice <= 0) {
    console.log(chalk.yellow('\n✖ Edit cancelled. No changes saved.'))
    await inquirer.prompt([{ type: 'input', name: 'enter', message: 'Press Enter to continue...' }])
    return menuRoute()
  }

  // Save changes
  const next = { ...state }
  const index = next.activeMenus.findIndex(menuSetting => menuSetting.menuId === selectedId)
  next.activeMenus[index].isActive = toggle
  next.activeMenus[index].sellPrice = newPrice
  setState(next)

  console.log(chalk.green(`\n✅ ${menu.name} updated: ${fmt(newPrice)} Ruby, ${toggle ? 'Active' : 'Inactive'}`))
  await inquirer.prompt([{ type: 'input', name: 'enter', message: 'Press Enter to continue...' }])
  return menuRoute()
}
