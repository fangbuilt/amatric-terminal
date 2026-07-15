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
    title: '1. Buy ingredients',
    body: 'Head to the Supplier and buy ingredients. Each menu item (Americano, Brown Sugar Latte, etc.) requires specific ingredients. Check the colored badges on each ingredient card to see which recipes use it.',
  },
  {
    title: '2. Check the daily forecast',
    body: 'Before buying, check the traffic forecast on the Advance button. It shows how many customers to expect. Multiply that by each recipe\'s ingredient needs to know how much to stock.',
  },
  {
    title: '3. Learn your recipes',
    body: 'Open the Almanac to see which ingredients each drink needs and in what quantities. Strategically buy only what you need — overstocking wastes money and risks spoilage.',
  },
  {
    title: '4. Set your prices',
    body: 'In the Almanac, tap a drink to open its pricing tab. Use the margin slider to set a sell price above your cost. Higher margins mean more profit per cup but fewer customers will buy.',
  },
  {
    title: '5. Advance the day',
    body: 'Hit Advance Day when you\'re ready. Customers will arrive, buy drinks (if priced right), and you\'ll earn Ruby. Check the daily report to see how you did.',
  },
  {
    title: '6. Watch for spoilage',
    body: 'Perishable ingredients expire after their shelf life. Use the FIFO Warehouse to track batches. Expired ingredients are wasted money — buy just enough to last a few days.',
  },
  {
    title: '7. Repeat and break even',
    body: 'Keep buying, pricing, and advancing. Your goal is to accumulate enough net profit to break even. Once you do, you can expand your stall and prestige for bonus traffic and starting capital.',
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
