import { useState } from 'react'
import { Button } from '@heroui/react'
import { Coffee, AlertTriangle, MapPin } from 'lucide-react'

interface Props {
  onFinish: () => void
}

const pages = [
  {
    icon: MapPin,
    lines: [
      { text: 'JAKARTA, INDONESIA', bold: true },
      { text: '' },
      { text: 'Bayu, a full-ride business student, stands before his final challenge.' },
      { text: 'The campus has granted him a starting capital of 5,000 Ruby' },
      { text: 'to launch and manage a coffee stall for his final grade,' },
      { text: 'and build something to pass to his juniors.' },
    ],
  },
  {
    icon: Coffee,
    lines: [
      { text: 'THE STALL', bold: true },
      { text: '' },
      { text: 'The campus provides: tables and chairs (limited space),' },
      { text: 'pantry island with decor, coffee grinder and freezer,' },
      { text: 'and necessary kitchenettes.' },
      { text: '' },
      { text: 'Bayu must hire a barista to open. A cashier is optional,' },
      { text: 'hire one later to speed things up.', dim: true },
    ],
  },
  {
    icon: Coffee,
    lines: [
      { text: 'THE ECONOMY', bold: true },
      { text: '' },
      { text: 'Currency: Ruby -- redenominated rupiah (1 Ruby = 1,000 IDR).' },
      { text: 'Named after the author\'s beloved.', dim: true },
      { text: '' },
      { text: 'Starting capital: 5,000 Ruby', highlight: true },
      { text: 'Daily traffic: 100 customers' },
      { text: '' },
      { text: 'Ingredients expire. Milk goes bad in 4 days.', warning: true },
      { text: 'Overspend unwisely and it is game over.', warning: true },
      { text: '' },
      { text: 'THE INVESTOR: CAMPUS', bold: true },
      { text: 'Break-even target: 5,000 Ruby accumulated net profit within 30 days.', dim: true },
      { text: 'Fail and Bayu forfeits his license.', dim: true },
    ],
  },
  {
    icon: Coffee,
    lines: [
      { text: 'THE CHALLENGE', bold: true },
      { text: '' },
      { text: 'Buy ingredients to unlock menu items.' },
      { text: 'Set your own prices. The algorithm decides who buys.' },
      { text: '' },
      { text: 'Prices averaged across variations (hot/iced, milk types).', dim: true },
      { text: 'Campus covers wifi and utilities. Cups must be repurchased.', dim: true },
      { text: '' },
      { text: 'The game creator controls the meta. Stay tuned.', bold: true },
    ],
  },
  {
    icon: AlertTriangle,
    lines: [
      { text: 'DISCLAIMER', bold: true },
      { text: '' },
      { text: 'This is a business simulation. You win some, you lose some.' },
      { text: '' },
      { text: 'There is no hand-holding. Figure out which ingredients to buy.', dim: true },
      { text: 'Unlock the Brown Sugar Latte first, or go straight for Matcha.', dim: true },
      { text: 'Every player\'s journey is unique.', dim: true },
      { text: '' },
      { text: 'Help Bayu pass his final grade.', bold: true },
      { text: 'The campus is watching.', bold: true },
    ],
  },
]

export default function IntroOverlay({ onFinish }: Props) {
  const [page, setPage] = useState(0)

  const isLast = page >= pages.length - 1

  const advance = () => {
    if (isLast) {
      localStorage.setItem('amatric_intro_shown', 'true')
      onFinish()
    } else {
      setPage(p => p + 1)
    }
  }

  const p = pages[page]
  const Icon = p.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg max-h-full overflow-y-auto">
        <div className="space-y-1 sm:text-center">
          {p.lines.map((line, i) => {
            if (!line.text) return <br key={i} />
            return (
              <p
                key={i}
                className={
                  line.bold ? 'font-bold' :
                  line.highlight ? 'text-amber-500 font-semibold' :
                  line.warning ? 'text-danger font-medium' :
                  line.dim ? 'text-muted sm:' :
                  ''
                }
              >
                {line.text}
              </p>
            )
          })}
        </div>

        <Button
          variant="primary"
          size="lg"
          className="mx-auto mt-8 block"
          onPress={advance}
        >
          {isLast ? 'Begin Game' : 'Continue'}
        </Button>

        <p className="mt-3 text-center text-muted">
          {page + 1} / {pages.length}
        </p>
      </div>
    </div>
  )
}
