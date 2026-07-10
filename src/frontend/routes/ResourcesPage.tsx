import { Tabs } from '@heroui/react'
import { ShoppingCart, Warehouse, Users, History } from 'lucide-react'
import ShopPage from '../components/ShopPage'
import InventoryPage from '../components/InventoryPage'
import StaffPage from '../components/StaffPage'
import HistoryPage from '../components/HistoryPage'

const tabs = [
  { id: 'shop', label: 'Supplier', icon: ShoppingCart },
  { id: 'inventory', label: 'Inventory', icon: Warehouse },
  { id: 'staff', label: 'Staff', icon: Users },
  { id: 'history', label: 'History', icon: History },
] as const

type Tab = (typeof tabs)[number]['id']

export default function ResourcesPage() {
  return (
    <Tabs className="w-full" defaultSelectedKey="shop">
      <Tabs.ListContainer>
        <Tabs.List aria-label="Resources">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <Tabs.Tab key={tab.id} id={tab.id}>
                <div className="flex items-center gap-1.5 px-1 py-0.5">
                  <Icon className="size-3.5" />
                  <span className="text-[11px]">{tab.label}</span>
                </div>
                <Tabs.Indicator />
              </Tabs.Tab>
            )
          })}
        </Tabs.List>
      </Tabs.ListContainer>
      <Tabs.Panel id="shop" className="outline-none"><ShopPage /></Tabs.Panel>
      <Tabs.Panel id="inventory" className="outline-none"><InventoryPage /></Tabs.Panel>
      <Tabs.Panel id="staff" className="outline-none"><StaffPage /></Tabs.Panel>
      <Tabs.Panel id="history" className="outline-none"><HistoryPage /></Tabs.Panel>
    </Tabs>
  )
}
