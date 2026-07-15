import { sumBy } from 'lodash-es'
import type { DrinkMenu } from '../types/ingredient'
import { calculateCOGM } from './calculateCogm'

interface MenuSetting {
  menuId: string
  sellPrice: number
  popularityBoostEnd: number
}

/** Weighted random menu selection factoring in price and popularity boost. */
export const pickMenu = (
  active: DrinkMenu[],
  settings: MenuSetting[],
  businessDay: number,
): DrinkMenu => {
  const weighted = active.map(m => {
    const setting = settings.find(s => s.menuId === m.id)
    const priceFactor = setting
      ? Math.max(0.3, 1 - (((setting.sellPrice - calculateCOGM(m)) / calculateCOGM(m)) * 0.8))
      : 1
    const boostActive = setting ? businessDay < setting.popularityBoostEnd : false
    const effectivePopularity = m.basePopularity * priceFactor * (boostActive ? 1.25 : 1)
    return { menu: m, effectivePopularity }
  })

  const total = sumBy(weighted, 'effectivePopularity')
  let roll = Math.random() * total
  for (const { menu, effectivePopularity } of weighted) {
    roll -= effectivePopularity
    if (roll <= 0) return menu
  }
  return active[active.length - 1]
}
