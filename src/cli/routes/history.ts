import inquirer from 'inquirer'
import chalk from 'chalk'
import { getState } from '../../core/state/gameStore'
import { displayHeader } from '../components/displayHeader'
import { fmt } from '../utils'
import { mainMenu } from '../index'

export async function historyRoute() {
  displayHeader()
  const state = getState()

  console.log(chalk.bold.blue('\n=== FINANCIAL HISTORY ===\n'))

  if (state.dailyHistory.length === 0) {
    console.log('No days recorded yet. Advance a day to start tracking.')
  } else {
    let cumRevenue = 0
    let cumCogs = 0
    let cumOpex = 0
    let cumSpoilage = 0
    let cumNet = 0
    let cumCups = 0

    for (const [i, day] of state.dailyHistory.entries()) {
      cumRevenue += day.grossRevenue
      cumCogs += day.cogs
      cumOpex += day.opex
      cumSpoilage += day.spoilageLoss
      cumNet += day.netProfit
      cumCups += day.cupsSold

      const profitStr = day.netProfit >= 0
        ? chalk.green(`+${fmt(day.netProfit)}`)
        : chalk.red(fmt(day.netProfit))

      console.log(
        `Day ${(i + 1).toString().padStart(2)}: ` +
        `Revenue ${chalk.green('+'+fmt(day.grossRevenue))} | ` +
        `COGS ${chalk.red('-'+fmt(day.cogs))} | ` +
        `Opex ${chalk.red('-'+fmt(day.opex))} | ` +
        `${day.spoilageLoss > 0 ? 'Spoilage ' + chalk.red('-'+fmt(day.spoilageLoss)) + ' | ' : ''}` +
        `Net ${profitStr} | ` +
        `${day.cupsSold} cup${day.cupsSold === 1 ? '' : 's'}`,
      )
    }

    console.log(chalk.dim('─'.repeat(60)))
    const netStr = cumNet >= 0
      ? chalk.green(`+${fmt(cumNet)}`)
      : chalk.red(fmt(cumNet))
    console.log(
      chalk.bold('TOTAL:') +
      ` Revenue ${chalk.green('+'+fmt(cumRevenue))} | ` +
      `COGS ${chalk.red('-'+fmt(cumCogs))} | ` +
      `Opex ${chalk.red('-'+fmt(cumOpex))} | ` +
      `${cumSpoilage > 0 ? 'Spoilage ' + chalk.red('-'+fmt(cumSpoilage)) + ' | ' : ''}` +
      `Net ${netStr} | ` +
      `${cumCups} cup${cumCups === 1 ? '' : 's'}`,
    )
  }

  await inquirer.prompt([{ type: 'input', name: 'enter', message: 'Press Enter to continue...' }])
  return mainMenu()
}
