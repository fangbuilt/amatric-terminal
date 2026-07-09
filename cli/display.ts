import chalk from 'chalk'
import { getState } from '../player/store'
import { CONSTANTS } from '../master/data'

export function displayHeader() {
  const state = getState()
  console.clear()
  console.log(chalk.bgHex('#D97706').black.bold(` ☕ AMATRIC: JAKARTA CAMPUS COFFEE `))
  console.log(
    chalk.bold(
      `Day: ${state.currentDay} | Balance: ${chalk.hex('#10B981')(state.rubyBalance.toFixed(2))} Ruby`,
    ),
  )
  const staff: string[] = []
  if (state.hasBarista) staff.push('Barista')
  if (state.hasCashier) staff.push('Cashier')
  console.log(`Staff: ${staff.length > 0 ? staff.join(', ') : chalk.red('None hired')}`)
  const capacity =
    (state.hasBarista ? CONSTANTS.STAFF.BARISTA.capacityBonus : 0) +
    (state.hasCashier ? CONSTANTS.STAFF.CASHIER.capacityBonus : 0)
  console.log(`Max Capacity: ${capacity} cups/day`)
  console.log(`------------------------------------------------`)
}
