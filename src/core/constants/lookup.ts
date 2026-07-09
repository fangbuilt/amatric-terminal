import { INGREDIENTS, MENU } from './data'

export const INGREDIENT = new Map(INGREDIENTS.map(i => [i.id, i]))
export const MENU_BY_ID = new Map(MENU.map(m => [m.id, m]))
