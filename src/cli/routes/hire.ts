import inquirer from 'inquirer'
import chalk from 'chalk'
import { getState, setState } from '../../core/state/gameStore'
import { CONSTANTS } from '../../core/constants/data'
import { displayHeader } from '../components/displayHeader'
import { fmt } from '../utils'
import { mainMenu } from '../index'

export async function hireRoute() {
  displayHeader()
  const state = getState()

  console.log(chalk.bold.blue('\n=== STAFF MANAGEMENT ===\n'))
  console.log(
    `Barista: ${state.hasBarista ? chalk.green('Employed') : chalk.red('Not hired')}`,
  )
  console.log(`  └ Wage: ${fmt(CONSTANTS.STAFF.BARISTA.dailyWage)} Ruby/day | Capacity: +${CONSTANTS.STAFF.BARISTA.capacityBonus} cups`)
  console.log(
    `Cashier: ${state.hasCashier ? chalk.green('Employed') : chalk.red('Not hired')}`,
  )
  console.log(`  └ Wage: ${fmt(CONSTANTS.STAFF.CASHIER.dailyWage)} Ruby/day | Capacity: +${CONSTANTS.STAFF.CASHIER.capacityBonus} cups`)

  const currentCapacity =
    (state.hasBarista ? CONSTANTS.STAFF.BARISTA.capacityBonus : 0) +
    (state.hasCashier ? CONSTANTS.STAFF.CASHIER.capacityBonus : 0)
  console.log(chalk.cyan(`\nTotal staff capacity: ${currentCapacity} cups/day`))

  const options: { name: string; value: string }[] = []
  if (!state.hasCashier) {
    options.push({ name: '💰 Hire Cashier (70 Ruby/day)', value: 'hire' })
  } else {
    options.push({ name: '⚠ Fire Cashier (save 70 Ruby/day)', value: 'fire' })
  }
  options.push({ name: chalk.red('<-- Back'), value: 'back' })

  const { action } = await inquirer.prompt([{
    type: 'select', name: 'action', message: 'Manage staff:', choices: options,
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
  return hireRoute()
}
