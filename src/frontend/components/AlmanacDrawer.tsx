import { useState, useEffect } from 'react'
import {
  DrawerBackdrop, DrawerContent, DrawerDialog, DrawerHandle,
  DrawerCloseTrigger, DrawerHeader, DrawerHeading, DrawerBody, DrawerFooter,
  Button, Chip, Table, Card, CardHeader, CardContent, TextField, Input,
  Accordion,
} from '@heroui/react'
import { Edit2, Check, X, Eye, EyeOff } from 'lucide-react'
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
          <DrawerBody className="bg-background p-6 rounded-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {unlockedMenus.map(menu => {
                const setting = state.activeMenus.find(m => m.menuId === menu.id)!
                const cogm = calculateCOGM(menu)
                const isEditing = editingId === menu.id
                const accordionId = `recipe-${menu.id}`

                return (
                  <Card
                    key={menu.id}
                    className={setting.isActive ? '' : 'opacity-60'}
                  >
                    <div className="aspect-square w-full max-w-24 mx-auto mt-3 rounded-xl bg-stone-200 dark:bg-stone-700" />
                    <CardHeader>
                      <div className="min-w-0 w-full">
                        <span className="text-sm font-medium truncate block">{menu.name}</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Chip
                            color={setting.isActive ? 'success' : 'default'}
                            variant="soft"
                            size="sm"
                          >
                            {setting.isActive ? 'Active' : 'Inactive'}
                          </Chip>
                          <span className="text-[10px] text-muted">
                            COGM {fmt(cogm)}
                          </span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <Accordion
                        expandedKeys={expandedKeys}
                        onExpandedChange={handleExpandedChange}
                      >
                        <Accordion.Item id={accordionId}>
                          <Accordion.Heading>
                            <Accordion.Trigger className="flex items-center justify-between w-full text-xs text-muted">
                              Recipe & Pricing
                              <Accordion.Indicator />
                            </Accordion.Trigger>
                          </Accordion.Heading>
                          <Accordion.Panel>
                            <Accordion.Body className="space-y-2">
                              <Table variant="secondary">
                                <Table.ScrollContainer>
                                  <Table.Content aria-label="Recipe ingredients">
                                    <Table.Header>
                                      <Table.Column isRowHeader>Ingredient</Table.Column>
                                      <Table.Column>Amount</Table.Column>
                                    </Table.Header>
                                    <Table.Body>
                                      {menu.recipe.map(r => {
                                        const ingredient = getIngredient(r.ingredientId)
                                        return (
                                          <Table.Row key={r.ingredientId}>
                                            <Table.Cell className="text-xs">{ingredient.name}</Table.Cell>
                                            <Table.Cell className="text-xs text-right tabular-nums">
                                              {r.qtyNeeded} {ingredient.unit}
                                            </Table.Cell>
                                          </Table.Row>
                                        )
                                      })}
                                    </Table.Body>
                                  </Table.Content>
                                </Table.ScrollContainer>
                              </Table>

                              <div className="flex items-center justify-between pt-1 border-t border-stone-700/30">
                                {isEditing ? (
                                  <div className="flex items-center gap-1.5">
                                    <TextField value={editPrice} onChange={setEditPrice}>
                                      <Input
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        className="w-20 text-xs"
                                        autoFocus
                                      />
                                    </TextField>
                                    <Button variant="primary" size="sm" isIconOnly onPress={() => saveEdit(menu.id)}>
                                      <Check className="size-3" />
                                    </Button>
                                    <Button variant="secondary" size="sm" isIconOnly onPress={cancelEdit}>
                                      <X className="size-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <>
                                    <span className="text-xs text-muted">
                                      Sell: <span className="font-bold text-amber-500">{fmt(setting.sellPrice)}</span>
                                      {' '}({((setting.sellPrice - cogm) / cogm * 100).toFixed(0)}% margin)
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <Button variant="ghost" size="sm" isIconOnly onPress={() => toggleActive(menu.id)}>
                                        {setting.isActive ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                                      </Button>
                                      <Button variant="ghost" size="sm" isIconOnly onPress={() => startEdit(menu.id, setting.sellPrice)}>
                                        <Edit2 className="size-3.5" />
                                      </Button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </Accordion.Body>
                          </Accordion.Panel>
                        </Accordion.Item>
                      </Accordion>
                    </CardContent>
                  </Card>
                )
              })}

              {/* Locked menus as disabled cards */}
              {lockedMenus.map(menu => (
                <Card key={menu.id} className="opacity-40">
                  <div className="aspect-square w-full max-w-24 mx-auto mt-3 rounded-xl bg-stone-200 dark:bg-stone-700" />
                  <CardHeader>
                    <span className="text-sm font-medium truncate block">{menu.name}</span>
                    <Chip color="default" variant="soft" size="sm" className="mt-0.5">Locked</Chip>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </DrawerBody>
        </DrawerDialog>
      </DrawerContent>
    </DrawerBackdrop>
  )
}
