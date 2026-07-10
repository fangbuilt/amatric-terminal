import { sumBy } from 'lodash-es'
import type { DrinkMenu } from '../types/ingredient'

/** Weighted random menu selection based on base popularity. */
export const pickMenu = (active: DrinkMenu[]): DrinkMenu => {
  const total = sumBy(active, 'basePopularity')
  let roll = Math.random() * total
  for (const m of active) {
    roll -= m.basePopularity
    if (roll <= 0) return m
  }
  return active[active.length - 1]
}
