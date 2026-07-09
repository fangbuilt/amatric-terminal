import type { GameState } from '../core/types/gameState'
import { MENU } from '../core/constants/data'
import { INGREDIENT } from '../core/constants/lookup'

export const fmt = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const ing = (id: string) => INGREDIENT.get(id)!

export const activeMenus = (state: GameState) =>
  MENU.filter(menuDef =>
    state.activeMenus.find(menuSetting => menuSetting.menuId === menuDef.id && menuSetting.isActive),
  )
