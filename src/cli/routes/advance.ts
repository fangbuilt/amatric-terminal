import inquirer from 'inquirer'
import chalk from 'chalk'
import { getState, setState } from '../../core/state/gameStore'
import { CONSTANTS } from '../../core/constants/data'
import { simulateDay } from '../../core/rules/simulateDay'
import { displayHeader } from '../components/displayHeader'
import { fmt } from '../utils'
import { mainMenu } from '../index'

export async function advanceRoute() {
  displayHeader()
  const state = getState()

  const capacity =
    (state.hasBarista ? CONSTANTS.STAFF.BARISTA.capacityBonus : 0) +
    (state.hasCashier ? CONSTANTS.STAFF.CASHIER.capacityBonus : 0)
  const activeCount = state.activeMenus.filter(menuSetting => menuSetting.isActive).length

  // Forecast
  console.log(chalk.cyan(`📊 Forecast: ${CONSTANTS.BASE_DAILY_TRAFFIC} customers expected tomorrow`))
  console.log(chalk.dim(`   Staff capacity : ${capacity} cups/day`))
  console.log(chalk.dim(`   Active menus   : ${activeCount}`))

  if (activeCount === 0) {
    console.log(chalk.yellow('\n⚠ No active menus! Enable some in Menu Management first.'))
    await inquirer.prompt([{ type: 'input', name: 'enter', message: 'Press Enter to continue...' }])
    return mainMenu()
  }

  console.log(chalk.bold.yellow('\n☕ Opening the cafe... People are coming...\n'))
  await new Promise(r => setTimeout(r, 1200))

  const previousState = getState()
  const { newState, report } = simulateDay(previousState)
  setState(newState)

  // --- DAILY REPORT ---
  console.log(chalk.bold.green(`\n========== DAILY REPORT (DAY ${previousState.businessDay}) ==========`))
  console.log('')
  console.log(chalk.bold('📈 SALES'))
  console.log(`  Customers served : ${chalk.cyan(report.cupsSold)} / ${CONSTANTS.BASE_DAILY_TRAFFIC}`)
  console.log(`  Gross Revenue    : ${chalk.green(`+${fmt(report.grossRevenue)}`)} Ruby`)
  console.log(`  Cost of Goods    : ${chalk.red(`-${fmt(report.cogs)}`)} Ruby`)
  console.log('')
  console.log(chalk.bold('💰 EXPENSES'))
  console.log(`  Staff (opex)     : ${chalk.red(`-${fmt(report.opex)}`)} Ruby`)

  if (report.spoilageLoss > 0) {
    console.log(`  Spoilage Loss    : ${chalk.red(`-${fmt(report.spoilageLoss)}`)} Ruby`)
    console.log(`  Expired Items    : ${chalk.red(report.expiredIngredients.join(', '))}`)
  } else {
    console.log(`  Spoilage Loss    : ${fmt(0)} Ruby`)
  }
  console.log('')

  const profitColor = report.netProfit >= 0 ? chalk.green : chalk.red
  const profitSign = report.netProfit >= 0 ? '+' : ''
  console.log(chalk.bold(`📊 NET PROFIT       : ${profitColor(`${profitSign}${fmt(report.netProfit)}`)} Ruby\n`))

  console.log(chalk.bold('🚶 WALKOUTS'))
  console.log(`  Too expensive     : ${report.walkouts.tooExpensive}`)
  console.log(`  Out of stock      : ${report.walkouts.outOfStock}`)
  console.log(`  Queue too long    : ${report.walkouts.queueTooLong}`)
  const totalWalkouts = report.walkouts.tooExpensive + report.walkouts.outOfStock + report.walkouts.queueTooLong
  if (totalWalkouts > 0) {
    console.log(chalk.dim(`  (${totalWalkouts} out of ${CONSTANTS.BASE_DAILY_TRAFFIC} potential customers left empty-handed)`))
  }
  console.log('')

  if (report.outOfStockItems.length > 0) {
    console.log(chalk.bold.red('⚠ ITEMS THAT RAN OUT'))
    for (const item of report.outOfStockItems) {
      console.log(`  • ${chalk.red(item)}`)
    }
    console.log('')
  }

  if (report.expiredIngredients.length > 0) {
    console.log(chalk.bold.red('⚠ EXPIRED INGREDIENTS'))
    for (const item of report.expiredIngredients) {
      console.log(`  • ${chalk.red(item)}`)
    }
    console.log('')
  }

  // Advice
  if (report.netProfit > 0) {
    console.log(chalk.green('✅ Profitable day! Keep it up, Bayu.'))
  } else if (report.netProfit < 0) {
    console.log(chalk.red('📉 Loss-making day. Review your pricing and stock.'))
  } else {
    console.log(chalk.yellow('➖ Broke even. Room for improvement.'))
  }

  // Break-even deadline check
  if (previousState.businessDay >= CONSTANTS.BREAK_EVEN.days && newState.accumulatedNetProfit < CONSTANTS.BREAK_EVEN.target) {
    console.log(chalk.bgRed.white.bold('\n 🚨 30-DAY DEADLINE FAILED! 🚨 \n'))
    console.log(chalk.red(`Accumulated net profit: ${fmt(newState.accumulatedNetProfit)} Ruby`))
    console.log(chalk.red(`Required: ${fmt(CONSTANTS.BREAK_EVEN.target)} Ruby`))
    console.log(chalk.red('\nThe campus revoked your license. Bayu did not pass.'))
    process.exit(0)
  }

  if (newState.isBankrupt) {
    console.log(chalk.bgRed.white.bold('\n 🚨 BAYU IS BANKRUPT! 🚨 \n'))
    console.log('The campus has revoked your license due to negative cash flow.')
    process.exit(0)
  }

  await inquirer.prompt([{ type: 'input', name: 'enter', message: 'Press Enter to sleep and wake up for the next day...' }])
  return mainMenu()
}
