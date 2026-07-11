import { useState, useEffect } from 'react'
import {
  DrawerBackdrop, DrawerContent, DrawerDialog, DrawerHandle,
  DrawerCloseTrigger, DrawerHeader, DrawerHeading, DrawerBody,
  Button, Chip, Table, Card, CardHeader, CardContent, TextField, Input,
  Tabs,
  ModalBackdrop, ModalContainer, ModalDialog, ModalCloseTrigger,
  ModalHeader, ModalHeading, ModalBody,
} from '@heroui/react'
import { Edit2, Check, X, Eye, EyeOff, ListChecks, Coins } from 'lucide-react'
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

  const [recipeMenuId, setRecipeMenuId] = useState<string | null>(null)
  const [recipeTab, setRecipeTab] = useState<string | number>('recipe')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState('')

  const unlockedMenus = MENU.filter(m => state.unlockedMenuIds.includes(m.id))
  const lockedMenus = MENU.filter(m => !state.unlockedMenuIds.includes(m.id))

  const recipeMenu = recipeMenuId ? unlockedMenus.find(m => m.id === recipeMenuId) : null
  const recipeSetting = recipeMenu ? state.activeMenus.find(m => m.menuId === recipeMenu.id) : null

  const openRecipe = (id: string) => {
    setRecipeMenuId(id)
    setRecipeTab('recipe')
    setEditingId(null)
    setEditPrice('')
  }

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
    <>
      <DrawerBackdrop isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent placement="bottom">
          <DrawerDialog>
            <DrawerHandle />
            <DrawerCloseTrigger />
            <DrawerHeader>
              <DrawerHeading>Almanac</DrawerHeading>
            </DrawerHeader>
            <DrawerBody className="bg-[#f3f2ef] dark:bg-[#0f0f0f] p-6 rounded-md">
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {unlockedMenus.map(menu => {
                  const setting = state.activeMenus.find(m => m.menuId === menu.id)!
                  const cogm = calculateCOGM(menu)

                  return (
                    <Card
                      key={menu.id}
                      className={`cursor-pointer hover:shadow-md transition-shadow text-center ${setting.isActive ? '' : 'opacity-60'}`}
                      onClick={() => openRecipe(menu.id)}
                    >
                      <div className="aspect-square w-full max-w-24 mx-auto mt-3 rounded-xl bg-stone-200 dark:bg-stone-700" />
                      <CardHeader>
                        <div className="min-w-0 w-full space-y-1">
                          <span className="font-medium truncate block">{menu.name}</span>
                          <div className="flex items-center justify-center">
                            <Chip
                              color={setting.isActive ? 'success' : 'default'}
                              variant="soft"
                              size="sm"
                            >
                              {setting.isActive ? 'Active' : 'Inactive'}
                            </Chip>
                          </div>
                          <p className="text-muted">COGM {fmt(cogm)}</p>
                          <p className="text-amber-500 font-semibold">{fmt(setting.sellPrice)} Ruby</p>
                        </div>
                      </CardHeader>
                    </Card>
                  )
                })}

                {/* Locked menus as disabled cards */}
                {lockedMenus.map(menu => (
                  <Card key={menu.id} className="opacity-40 text-center">
                    <div className="aspect-square w-full max-w-24 mx-auto mt-3 rounded-xl bg-stone-200 dark:bg-stone-700" />
                    <CardHeader>
                      <span className="font-medium truncate block">{menu.name}</span>
                      <Chip color="default" variant="soft" size="sm" className="mt-0.5">Locked</Chip>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </DrawerBody>
          </DrawerDialog>
        </DrawerContent>
      </DrawerBackdrop>

      {/* Recipe & Pricing Modal */}
      <ModalBackdrop isOpen={!!recipeMenuId} onOpenChange={(open) => {
        if (!open) {
          setRecipeMenuId(null)
          setEditingId(null)
          setEditPrice('')
        }
      }}>
        <ModalContainer>
          <ModalDialog className="h-[70vh] flex flex-col">
            <ModalCloseTrigger />
            <ModalHeader>
              <ModalHeading>{recipeMenu?.name ?? ''}</ModalHeading>
            </ModalHeader>
            <ModalBody className="overflow-hidden flex flex-col gap-0">
              {recipeMenu && recipeSetting && (() => {
                const cogm = calculateCOGM(recipeMenu)
                const isEditing = editingId === recipeMenu.id

                return (
                  <Tabs variant="primary" selectedKey={recipeTab} onSelectionChange={setRecipeTab}>
                    <Tabs.ListContainer>
                      <Tabs.List aria-label="Menu details">
                        <Tabs.Tab id="recipe" className="gap-1.5"><ListChecks className="size-4 shrink-0" /> Recipe<Tabs.Indicator /></Tabs.Tab>
                        <Tabs.Tab id="pricing" className="gap-1.5"><Coins className="size-4 shrink-0" /> Pricing<Tabs.Indicator /></Tabs.Tab>
                      </Tabs.List>
                    </Tabs.ListContainer>

                    <div className="overflow-y-auto flex-1 min-h-0 pt-3">
                      <Tabs.Panel id="recipe">
                        <Table variant="secondary">
                          <Table.ScrollContainer>
                            <Table.Content aria-label="Recipe ingredients">
                              <Table.Header>
                                <Table.Column isRowHeader>Ingredient</Table.Column>
                                <Table.Column>Amount</Table.Column>
                              </Table.Header>
                              <Table.Body>
                                {recipeMenu.recipe.map(r => {
                                  const ingredient = getIngredient(r.ingredientId)
                                  return (
                                    <Table.Row key={r.ingredientId}>
                                      <Table.Cell>{ingredient.name}</Table.Cell>
                                      <Table.Cell className="text-right tabular-nums">
                                        {r.qtyNeeded} {ingredient.unit}
                                      </Table.Cell>
                                    </Table.Row>
                                  )
                                })}
                              </Table.Body>
                            </Table.Content>
                          </Table.ScrollContainer>
                        </Table>
                      </Tabs.Panel>

                      <Tabs.Panel id="pricing">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-muted">Cost per cup</p>
                              <p className="font-semibold">{fmt(cogm)} Ruby</p>
                            </div>
                            <div className="text-right">
                              <p className="text-muted">Sell price</p>
                              {isEditing ? (
                                <TextField value={editPrice} onChange={setEditPrice}>
                                  <Input
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    className="w-28"
                                    autoFocus
                                    aria-label="Edit sell price"
                                  />
                                </TextField>
                              ) : (
                                <p className="font-bold text-amber-500">{fmt(recipeSetting.sellPrice)} Ruby</p>
                              )}
                              <p className="text-muted">
                                {((recipeSetting.sellPrice - cogm) / cogm * 100).toFixed(0)}% margin
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isEditing ? (
                              <>
                                <Button variant="primary" size="sm" className="flex-1" onPress={() => saveEdit(recipeMenu.id)}>
                                  <Check className="size-4" />
                                  Save Price
                                </Button>
                                <Button variant="secondary" size="sm" className="flex-1" onPress={cancelEdit}>
                                  <X className="size-4" />
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button variant="secondary" size="sm" className="flex-1" onPress={() => startEdit(recipeMenu.id, recipeSetting.sellPrice)}>
                                  <Edit2 className="size-4" />
                                  Edit Price
                                </Button>
                                <Button
                                  variant={recipeSetting.isActive ? 'danger' : 'primary'}
                                  size="sm"
                                  className="flex-1"
                                  onPress={() => toggleActive(recipeMenu.id)}
                                >
                                  {recipeSetting.isActive ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                  {recipeSetting.isActive ? 'Deactivate' : 'Set Active'}
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </Tabs.Panel>
                    </div>
                  </Tabs>
                )
              })()}
            </ModalBody>
          </ModalDialog>
        </ModalContainer>
      </ModalBackdrop>
    </>
  )
}
