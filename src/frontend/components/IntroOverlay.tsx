import { useState } from 'react'
import { Button, TextField, Input, Card, CardContent, Label } from '@heroui/react'
import { Coffee, AlertTriangle, MapPin, ChevronLeft, ChevronRight, Check } from 'lucide-react'

interface Props {
  onFinish: (cafeName: string) => void
}

interface IntroLine {
  text: string
  bold?: boolean
  dim?: boolean
  highlight?: boolean
  warning?: boolean
}

interface IntroPage {
  icon: typeof Coffee
  lines: IntroLine[]
  isNamePage?: boolean
}

const pages: IntroPage[] = [
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
      { text: 'Starting capital: 5,000 Ruby (1 Ruby = 1,000 IDR).', highlight: true },
      { text: 'Daily traffic: 200 customers' },
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
    icon: Coffee,
    isNamePage: true,
    lines: [
      { text: 'NAME YOUR CAFE', bold: true },
      { text: '' },
      { text: "What will Bayu call his stall?" },
      { text: 'Choose wisely. This name will appear throughout your journey.', dim: true },
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
      { text: "Every player's journey is unique.", dim: true },
      { text: '' },
      { text: 'Help Bayu pass his final grade.', bold: true },
      { text: 'The campus is watching.', bold: true },
    ],
  },
]

export default function IntroOverlay({ onFinish }: Props) {
  const [page, setPage] = useState(0)
  const [cafeName, setCafeName] = useState('')

  const isFirst = page === 0
  const isLast = page >= pages.length - 1
  const isNamePage = pages[page].isNamePage

  const goNext = () => {
    if (isLast) {
      localStorage.setItem('amatric_intro_shown', 'true')
      onFinish(cafeName.trim() || "Bayu's Stall")
    } else {
      setPage(p => p + 1)
    }
  }

  const goPrev = () => {
    if (!isFirst) setPage(p => p - 1)
  }

  const p = pages[page]
  const Icon = p.icon

  const indicator = (
    <p className="text-muted">
      {page + 1} / {pages.length}
    </p>
  )

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
      {/* Desktop layout: prev/next buttons beside card, indicator below */}
      <div className="hidden lg:flex items-center gap-4">
        <Button
          variant="secondary"
          size="lg"
          isIconOnly
          isDisabled={isFirst}
          onPress={goPrev}
        >
          <ChevronLeft className="size-5" />
        </Button>

        <div className="flex flex-col items-center gap-3">
          <Card className="w-96">
            <CardContent className="p-6 space-y-1">
              {p.lines.map((line, i) => {
                if (!line.text) return <br key={i} />
                return (
                  <p
                    key={i}
                    className={
                      line.bold ? 'font-bold' :
                      line.highlight ? 'text-amber-500 font-semibold' :
                      line.warning ? 'text-danger font-medium' :
                      line.dim ? 'text-muted' :
                      ''
                    }
                  >
                    {line.text}
                  </p>
                )
              })}
              {isNamePage && (
                <div className="pt-4">
                  <div className="rounded-xl bg-surface-secondary p-4">
                    <TextField value={cafeName} onChange={setCafeName}>
                      <Label>Cafe name</Label>
                      <Input
                        placeholder="Bayu's Stall"
                        maxLength={30}
                      />
                    </TextField>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          {indicator}
        </div>

        <Button
          variant={isLast ? 'primary' : 'secondary'}
          size="lg"
          isIconOnly
          onPress={goNext}
        >
          {isLast ? <Check className="size-5" /> : <ChevronRight className="size-5" />}
        </Button>
      </div>

      {/* Mobile layout: card on top, buttons + indicator at bottom */}
      <div className="flex flex-col lg:hidden w-full max-w-lg h-full max-h-full">
        <div className="flex-1 flex items-center justify-center overflow-y-auto py-4">
          <Card className="w-full">
            <CardContent className="p-5 space-y-1">
              {p.lines.map((line, i) => {
                if (!line.text) return <br key={i} />
                return (
                  <p
                    key={i}
                    className={
                      line.bold ? 'font-bold' :
                      line.highlight ? 'text-amber-500 font-semibold' :
                      line.warning ? 'text-danger font-medium' :
                      line.dim ? 'text-muted' :
                      ''
                    }
                  >
                    {line.text}
                  </p>
                )
              })}
              {isNamePage && (
                <div className="pt-4">
                  <div className="rounded-xl bg-surface-secondary p-4">
                    <TextField value={cafeName} onChange={setCafeName}>
                      <Label>Cafe name</Label>
                      <Input
                        placeholder="Bayu's Stall"
                        maxLength={30}
                      />
                    </TextField>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="shrink-0 flex items-center justify-between pt-4 pb-2">
          <Button
            variant="secondary"
            size="lg"
            isIconOnly
            isDisabled={isFirst}
            onPress={goPrev}
          >
            <ChevronLeft className="size-5" />
          </Button>

          {indicator}

          <Button
            variant={isLast ? 'primary' : 'secondary'}
            size="lg"
            isIconOnly
            onPress={goNext}
          >
            {isLast ? <Check className="size-5" /> : <ChevronRight className="size-5" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
