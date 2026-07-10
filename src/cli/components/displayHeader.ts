import chalk from 'chalk'
import { getState } from '../../core/state/gameStore'
import { CONSTANTS } from '../../core/constants/data'
import { fmt, getExpiringTomorrow } from '../utils'

export function displayHeader() {
  const state = getState()
  console.clear()
  console.log(chalk.bgHex('#D97706').black.bold(` ☕ AMATRIC: JAKARTA CAMPUS COFFEE `))
  console.log(
    chalk.bold(
      `Day: ${state.currentDay} | Balance: ${chalk.hex('#10B981')(fmt(state.rubyBalance))} Ruby`,
    ),
  )
  console.log(
    `Revenue: ${fmt(state.accumulatedGrossRevenue)} Ruby` +
    ` | Net Profit: ${state.accumulatedNetProfit >= 0 ? chalk.green('+'+fmt(state.accumulatedNetProfit)) : chalk.red(fmt(state.accumulatedNetProfit))} Ruby`,
  )

  // Break-even progress
  const daysRemaining = Math.max(0, CONSTANTS.BREAK_EVEN.days - state.currentDay + 1)
  const progress = Math.min(100, (state.accumulatedNetProfit / CONSTANTS.BREAK_EVEN.target) * 100)
  const progressBar = progress >= 100
    ? chalk.green('✓ TARGET MET')
    : `Target: ${fmt(state.accumulatedNetProfit)} / ${fmt(CONSTANTS.BREAK_EVEN.target)} Ruby (${daysRemaining} day${daysRemaining > 1 ? 's' : ''} left)`
  console.log(chalk.cyan(`Break-even: ${progressBar}`))

  const staff: string[] = []
  if (state.hasBarista) staff.push('Barista')
  if (state.hasCashier) staff.push('Cashier')
  console.log(`Staff: ${staff.length > 0 ? staff.join(', ') : chalk.red('None hired')}`)

  const capacity =
    (state.hasBarista ? CONSTANTS.STAFF.BARISTA.capacityBonus : 0) +
    (state.hasCashier ? CONSTANTS.STAFF.CASHIER.capacityBonus : 0)
  console.log(`Max Capacity: ${capacity} cups/day`)

  // D-1 expiry warning
  const expiring = getExpiringTomorrow(state)
  if (expiring.length > 0) {
    console.log(chalk.red(`⚠ ${expiring.join(', ')} expire${expiring.length === 1 ? 's' : ''} tomorrow!`))
  }

  console.log(`------------------------------------------------`)
}
