import { useState } from 'react'
import { Tabs } from '@heroui/react'
import { ShoppingCart, Warehouse, Users, History } from 'lucide-react'
import ShopPage from '../components/ShopPage'
import InventoryPage from '../components/InventoryPage'
import StaffPage from '../components/StaffPage'
import HistoryPage from '../components/HistoryPage'

type TabId = 'shop' | 'inventory' | 'staff' | 'history'

export default function ResourcesPage() {
  const [active, setActive] = useState<TabId>('shop')

  return (
    <div className="flex flex-col min-h-full">
      <Tabs
        selectedKey={active}
        onSelectionChange={(k) => setActive(k as TabId)}
        className="px-3 pt-3"
      >
        <Tabs.ListContainer>
          <Tabs.List aria-label="Resources">
            <Tabs.Tab id="shop" className="gap-1.5"><ShoppingCart className="size-4 shrink-0" /> Supplier<Tabs.Indicator /></Tabs.Tab>
            <Tabs.Tab id="inventory" className="gap-1.5"><Warehouse className="size-4 shrink-0" /> Inventory<Tabs.Indicator /></Tabs.Tab>
            <Tabs.Tab id="staff" className="gap-1.5"><Users className="size-4 shrink-0" /> Staff<Tabs.Indicator /></Tabs.Tab>
            <Tabs.Tab id="history" className="gap-1.5"><History className="size-4 shrink-0" /> History<Tabs.Indicator /></Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>

        <div className="p-3 sm:p-4 w-full">
          <Tabs.Panel id="shop"><ShopPage /></Tabs.Panel>
          <Tabs.Panel id="inventory"><InventoryPage /></Tabs.Panel>
          <Tabs.Panel id="staff"><StaffPage /></Tabs.Panel>
          <Tabs.Panel id="history"><HistoryPage /></Tabs.Panel>
        </div>
      </Tabs>
    </div>
  )
}
