import { useState, useEffect } from 'react'
import {
  DrawerBackdrop, DrawerContent, DrawerDialog, DrawerHandle,
  DrawerCloseTrigger, DrawerHeader, DrawerHeading, DrawerBody, DrawerFooter,
  Accordion, Button, Chip,
} from '@heroui/react'
import { Eye, EyeOff, Edit2, Check, X } from 'lucide-react'
import type { GameState } from '../../core/types/gameState'
import { getState, setState, subscribe } from '../../core/state/gameStore'
import { MENU } from '../../core/constants/data'
import { calculateCOGM } from '../../core/rules/calculateCogm'
import { fmt, getIngredient } from '../utils'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function AlmanacDrawer({ isOpen, onClose }: Props) {
  const [state, setLocalState] = useState<GameState>(getState())
  useEffect(() => subscribe(s => setLocalState({ ...s })), [])

  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())
  const handleExpandedChange = (keys: Set<string | number>) =>
    setExpandedKeys(new Set(Array.from(keys, String)))
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState('')

  const unlockedMenus = MENU.filter(m => state.unlockedMenuIds.includes(m.id))
  const lockedMenus = MENU.filter(m => !state.unlockedMenuIds.includes(m.id))

  const startEdit = (id: string, currentPrice: number) => {
    setEditingId(id)
    setEditPrice(String(currentPrice))
  }

  const saveEdit = (menuId: string) => {
    const price = parseFloat(editPrice)
    if (isNaN(price) || price <= 0) return
    const next = JSON.parse(JSON.stringify(getState())) as GameState
    const idx = next.activeMenus.findIndex(m => m.menuId === menuId)
    if (idx >= 0) {
      next.activeMenus[idx].sellPrice = price
    }
    setState(next)
    setLocalState({ ...next })
    setEditingId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditPrice('')
  }

  const toggleActive = (menuId: string) => {
    const next = JSON.parse(JSON.stringify(getState())) as GameState
    const idx = next.activeMenus.findIndex(m => m.menuId === menuId)
    if (idx >= 0) {
      next.activeMenus[idx].isActive = !next.activeMenus[idx].isActive
    }
    setState(next)
    setLocalState({ ...next })
  }

  return (
    <DrawerBackdrop isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent placement="bottom">
        <DrawerDialog>
          <DrawerHandle />
          <DrawerCloseTrigger />
          <DrawerHeader>
            <DrawerHeading>Almanac</DrawerHeading>
          </DrawerHeader>
          <DrawerBody>
            <Accordion
              expandedKeys={expandedKeys}
              onExpandedChange={handleExpandedChange}
            >
              {unlockedMenus.map(menu => {
                const setting = state.activeMenus.find(m => m.menuId === menu.id)!
                const cogm = calculateCOGM(menu)
                const isEditing = editingId === menu.id

                return (
                  <Accordion.Item key={menu.id} id={menu.id}>
                    <Accordion.Heading>
                      <Accordion.Trigger className="flex items-center justify-between w-full gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {/* 1:1 image placeholder with max size */}
                          <div className="size-10 shrink-0 rounded-lg bg-stone-200 dark:bg-stone-700" />
                          <div className="min-w-0 text-left">
                            <span className="text-sm font-medium truncate block">{menu.name}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Chip
                                color={setting.isActive ? 'success' : 'default'}
                                variant="soft"
                                size="sm"
                              >
                                {setting.isActive ? 'Active' : 'Inactive'}
                              </Chip>
                              <span className="text-[10px] text-muted">COGM: {fmt(cogm)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            isIconOnly
                            onPress={() => toggleActive(menu.id)}
                          >
                            {setting.isActive ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                          </Button>
                          <Accordion.Indicator />
                        </div>
                      </Accordion.Trigger>
                    </Accordion.Heading>
                    <Accordion.Panel>
                      <Accordion.Body className="space-y-2">
                        {/* 2-column recipe table */}
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-muted">
                              <th className="text-left font-medium pb-1">Ingredient</th>
                              <th className="text-right font-medium pb-1">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {menu.recipe.map(r => {
                              const ingredient = getIngredient(r.ingredientId)
                              return (
                                <tr key={r.ingredientId} className="border-t border-stone-700/30">
                                  <td className="py-0.5">{ingredient.name}</td>
                                  <td className="text-right py-0.5 tabular-nums">
                                    {r.qtyNeeded} {ingredient.unit}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>

                        {/* Pricing */}
                        <div className="flex items-center justify-between pt-1 border-t border-stone-700/30">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                className="w-20 rounded bg-surface px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-amber-500"
                                value={editPrice}
                                onChange={e => setEditPrice(e.target.value)}
                                min={0}
                                step={0.01}
                                autoFocus
                              />
                              <Button
                                variant="primary"
                                size="sm"
                                isIconOnly
                                onPress={() => saveEdit(menu.id)}
                              >
                                <Check className="size-3" />
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                isIconOnly
                                onPress={cancelEdit}
                              >
                                <X className="size-3" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <span className="text-muted">
                                Sell: <span className="font-bold text-amber-500">{fmt(setting.sellPrice)}</span>
                                {' '}({((setting.sellPrice - cogm) / cogm * 100).toFixed(0)}% margin)
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                isIconOnly
                                onPress={() => startEdit(menu.id, setting.sellPrice)}
                              >
                                <Edit2 className="size-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </Accordion.Body>
                    </Accordion.Panel>
                  </Accordion.Item>
                )
              })}
            </Accordion>

            {/* Locked menus hint */}
            {lockedMenus.length > 0 && (
              <div className="mt-3 rounded-xl bg-surface px-3 py-2">
                <p className="text-xs text-muted">
                  Locked recipes: {lockedMenus.map(m => m.name).join(', ')}. Buy their ingredients to unlock.
                </p>
              </div>
            )}
          </DrawerBody>
          <DrawerFooter>
            <Button variant="secondary" onPress={onClose}>Close</Button>
          </DrawerFooter>
        </DrawerDialog>
      </DrawerContent>
    </DrawerBackdrop>
  )
}
