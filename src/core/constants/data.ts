import type { Ingredient, DrinkMenu } from '../types/ingredient'
import rawData from './gameData.json'

const raw = rawData as typeof rawData & {
  ingredients: (typeof rawData.ingredients[0] & { shelfLifeDays: number | null })[]
}

export const INGREDIENTS: Ingredient[] = raw.ingredients.map(i => ({
  ...i,
  unit: i.unit as Ingredient['unit'],
  shelfLifeDays: i.shelfLifeDays ?? Infinity,
}))

export const MENU: DrinkMenu[] = raw.menu.map(m => ({
  ...m,
  unlockOrder: m.unlockOrder ?? 0,
}))

export const DATA_VERSION = rawData.version
export const PATCH_NOTES = rawData.patchNotes

export const CONSTANTS = {
  STARTING_CAPITAL: rawData.constants.STARTING_CAPITAL,
  BASE_DAILY_TRAFFIC: rawData.constants.BASE_DAILY_TRAFFIC,
  TRAFFIC_VARIANCE: rawData.constants.TRAFFIC_VARIANCE,
  BUSY_DAY_CHANCE: rawData.constants.BUSY_DAY_CHANCE,
  BUSY_DAY_BONUS: rawData.constants.BUSY_DAY_BONUS,
  PRESTIGE_TRAFFIC_BONUS: rawData.constants.PRESTIGE_TRAFFIC_BONUS,
  PRESTIGE_CAPITAL_BONUS: rawData.constants.PRESTIGE_CAPITAL_BONUS,
  BREAK_EVEN: rawData.constants.BREAK_EVEN,
  STAFF: rawData.constants.STAFF,
  BASE_CAPACITY: rawData.constants.BASE_CAPACITY,
  SEVERANCE_MULTIPLIER: rawData.constants.SEVERANCE_MULTIPLIER,
}
