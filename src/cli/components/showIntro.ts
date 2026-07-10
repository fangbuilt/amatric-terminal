import inquirer from 'inquirer'
import chalk from 'chalk'

export async function showIntro() {
  const pages: string[][] = [
    [
      '',
      chalk.cyan.bold('JAKARTA, INDONESIA'),
      '',
      'Bayu, a full-ride business student, stands before his final challenge.',
      'The campus has granted him a starting capital of',
      chalk.yellow('5,000 Ruby') + ' to launch and manage a coffee stall',
      'for his final grade — and build something to pass to his juniors.',
    ],
    [
      '',
      chalk.yellow.bold('THE STALL'),
      '',
      'The campus provides:',
      '  • Tables & chairs (limited space)',
      '  • Pantry island with decor',
      '  • Coffee grinder & freezer',
      '  • Necessary kitchenettes',
      '',
      chalk.dim('Bayu must hire a barista to open.'),
      chalk.dim('A cashier is optional — hire one later to speed things up.'),
    ],
    [
      '',
      chalk.magenta.bold('THE ECONOMY'),
      '',
      'Currency: ' + chalk.hex('#10B981')('Ruby') + ' — redenominated rupiah (1 Ruby ≈ 1,000 IDR).',
      'Named after the author\'s beloved.',
      '',
      'Starting capital: ' + chalk.yellow('5,000 Ruby'),
      'Daily traffic: ' + chalk.cyan('100 customers'),
      '',
      chalk.red('Ingredients expire. Milk goes bad in 4 days.'),
      chalk.red('Overspend unwisely and it\'s game over.'),
      '',
      chalk.bold.yellow('THE INVESTOR: CAMPUS') + chalk.dim(' — break-even in 30 days.'),
      chalk.dim(`Accumulated net profit of ${chalk.yellow('5,000 Ruby')} required.`),
      chalk.dim('Fail and Bayu forfeits his license.'),
    ],
    [
      '',
      chalk.green.bold('THE CHALLENGE'),
      '',
      'Buy ingredients to unlock menu items.',
      'Set your own prices — the algorithm decides who buys.',
      '',
      chalk.dim('Prices are averaged across variations (hot/iced,'),
      chalk.dim('different milk, extra shots — all deducted the same).'),
      chalk.dim('The campus covers wifi and utilities. Cups are provided,'),
      chalk.dim('but you must repurchase them.'),
      '',
      chalk.bold.yellow('The game creator controls the meta.') + chalk.dim(' Ingredient costs'),
      chalk.dim('may fluctuate, new menus may drop. Stay tuned.'),
      '',
      chalk.bold.yellow('THE INVESTOR: CAMPUS') + chalk.dim(' — break-even in 30 days.'),
      chalk.dim(`Accumulated net profit of ${chalk.yellow('5,000 Ruby')} required.`),
      chalk.dim('Fail and Bayu forfeits his license.'),
    ],
    [
      '',
      chalk.bgYellow.black.bold(' ⚠ DISCLAIMER ') + '',
      '',
      chalk.yellow('This is a business simulation. You win some, you lose some.'),
      '',
      chalk.dim('There is no hand-holding. Figure out which ingredients to buy.'),
      chalk.dim('Unlock the Brown Sugar Latte first, or go straight for Matcha.'),
      chalk.dim('Every player\'s journey is unique.'),
      '',
      chalk.green.bold('Help Bayu pass his final grade.'),
      chalk.green.bold('The campus is watching.'),
    ],
  ]

  for (const lines of pages) {
    console.clear()
    console.log(chalk.bgHex('#D97706').black.bold(' ☕ AMATRIC: JAKARTA CAMPUS COFFEE '))
    console.log('')
    for (const line of lines) {
      console.log(line)
    }
    console.log('')
    await inquirer.prompt([{ type: 'input', name: 'enter', message: 'Press Enter to continue...' }])
  }
}
