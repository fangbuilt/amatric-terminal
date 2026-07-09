import inquirer from 'inquirer'
import chalk from 'chalk'
import { getState } from '../player/store'
import { shopScreen, menuScreen, inventoryScreen, advanceScreen, hireScreen } from './screens'
import { displayHeader } from './display'

export async function mainMenu() {
  const state = getState()

  if (state.isBankrupt) {
    console.log(chalk.bgRed.white.bold('\n 🚨 GAME OVER: BAYU IS BANKRUPT! 🚨 \n'))
    console.log('Campus revoked your license due to negative cash flow.')
    process.exit(0)
  }

  displayHeader()

  const { action } = await inquirer.prompt([{
    type: 'select',
    name: 'action',
    message: 'What do you want to do today, Boss?',
    choices: [
      { name: '🛒 Shop Ingredients (Supplier)', value: 'shop' },
      { name: '📋 Manage Menu & Pricing', value: 'menu' },
      { name: '📦 Check Inventory', value: 'inventory' },
      { name: '👤 Manage Staff', value: 'hire' },
      new inquirer.Separator(),
      { name: chalk.bold.green('▶ Advance Day (Open Cafe)'), value: 'advance' },
      { name: chalk.red('Exit Game'), value: 'exit' },
    ],
  }])

  switch (action) {
    case 'shop': await shopScreen(); break
    case 'menu': await menuScreen(); break
    case 'inventory': await inventoryScreen(); break
    case 'hire': await hireScreen(); break
    case 'advance': await advanceScreen(); break
    case 'exit': process.exit(0)
  }

  // Loop back
  return mainMenu()
}

mainMenu()
