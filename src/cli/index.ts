import inquirer from 'inquirer'
import chalk from 'chalk'
import { getState } from '../core/state/gameStore'
import { shopRoute, menuRoute, inventoryRoute, advanceRoute, hireRoute, historyRoute } from './routes'
import { displayHeader } from './components/displayHeader'
import { showIntro } from './components/showIntro'

// ---------------------------------------------------------------------------
// Main Menu
// ---------------------------------------------------------------------------

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
      { name: '📊 Financial History', value: 'history' },
      new inquirer.Separator(),
      { name: chalk.bold.green('▶ Advance Day (Open Cafe)'), value: 'advance' },
      { name: chalk.red('Exit Game'), value: 'exit' },
    ],
  }])

  switch (action) {
    case 'shop': await shopRoute(); break
    case 'menu': await menuRoute(); break
    case 'inventory': await inventoryRoute(); break
    case 'hire': await hireRoute(); break
    case 'history': await historyRoute(); break
    case 'advance': await advanceRoute(); break
    case 'exit': process.exit(0)
  }

  // Loop back
  return mainMenu()
}

// ---------------------------------------------------------------------------
// Entry Point
// ---------------------------------------------------------------------------

;(async () => {
  await showIntro()
  mainMenu()
})()
