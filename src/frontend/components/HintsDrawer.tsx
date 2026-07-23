import { useState } from 'react'
import {
  DrawerBackdrop, DrawerContent, DrawerDialog, DrawerHandle,
  DrawerCloseTrigger, DrawerHeader, DrawerHeading, DrawerBody,
  Accordion,
} from '@heroui/react'
import { Lightbulb } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const TIPS = [
  {
    title: '1. Buy ingredients to unlock recipes',
    body: 'Head to the Supplier and buy ingredients. Each menu item requires specific ones. Check the colored badges on each ingredient card to see which recipes use it. You only need to buy each ingredient once to unlock its recipe.',
  },
  {
    title: '2. Check the daily forecast',
    body: 'Before buying, check the traffic forecast on the Advance button. It shows how many customers to expect. Not every customer wants every drink, popular items get more buyers.',
  },
  {
    title: '3. Learn your recipes',
    body: 'Open the Almanac to see what each drink needs and in what quantities. Strategically buy only what you need. Overstocking wastes money and risks spoilage.',
  },
  {
    title: '4. Set your prices wisely',
    body: 'In the Almanac, tap a drink to open its pricing tab. Use the margin slider to set a sell price above your cost. Charge too much and customers walk away. Charge too little and you bleed money. Find the sweet spot.',
  },
  {
    title: '5. Hire staff to scale up',
    body: 'A barista is mandatory to open. A cashier is optional but increases your daily capacity significantly. Don\'t hire one too early, the daily wage adds up. Hire when you can comfortably afford it.',
  },
  {
    title: '6. Advance the day',
    body: 'Hit Advance Day when you\'re ready. Customers arrive, buy drinks (if priced right), and you earn Ruby. Check the daily report to see what sold and what didn\'t.',
  },
  {
    title: '7. Watch for spoilage',
    body: 'Perishable ingredients expire after their shelf life. Milk goes bad in 4 days. The FIFO Warehouse tracks batches by age. Use it to avoid waste. Buy just enough for a few days at a time.',
  },
  {
    title: '8. Price sensitivity is real',
    body: 'Customers are less likely to buy overpriced drinks. The algorithm weighs your margin against willingness to pay. A 50% margin still converts most buyers. Above 150% and almost nobody bites.',
  },
  {
    title: '9. Use the notes feature',
    body: 'Tap the Notes button in the toolbar to jot down your shopping math, daily targets, or expiry reminders. It persists across sessions, your personal scratchpad for running the cafe.',
  },
  {
    title: '10. Repeat and break even',
    body: 'Keep buying, pricing, and advancing. Your goal is to accumulate 5,000 Ruby net profit within 30 business days. Once you do, you can expand your stall and prestige for bonus traffic and starting capital.',
  },
]

export default function HintsDrawer({ isOpen, onClose }: Props) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string | number>>(new Set())

  return (
    <DrawerBackdrop isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent placement="bottom">
        <DrawerDialog>
          <DrawerHandle />
          <DrawerCloseTrigger />
          <DrawerHeader>
            <DrawerHeading className="flex items-center gap-2">
              <Lightbulb className="size-5 text-amber-500" />
              How to Play
            </DrawerHeading>
          </DrawerHeader>
          <DrawerBody className="bg-[#f3f2ef] dark:bg-[#0f0f0f] p-6 rounded-md">
            <Accordion expandedKeys={expandedKeys} onExpandedChange={setExpandedKeys}>
              {TIPS.map((tip) => (
                <Accordion.Item key={tip.title} id={tip.title}>
                  <Accordion.Heading>
                    <Accordion.Trigger className="flex items-center justify-between w-full font-semibold">
                      {tip.title}
                      <Accordion.Indicator />
                    </Accordion.Trigger>
                  </Accordion.Heading>
                  <Accordion.Panel>
                    <Accordion.Body className="text-muted pt-1">
                      {tip.body}
                    </Accordion.Body>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </DrawerBody>
        </DrawerDialog>
      </DrawerContent>
    </DrawerBackdrop>
  )
}
