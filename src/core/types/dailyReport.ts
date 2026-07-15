export interface DailyReport {
  grossRevenue: number
  cogs: number
  opex: number
  spoilageLoss: number
  netProfit: number
  cupsSold: number
  dailyTraffic: number
  isBusyDay: boolean
  walkouts: {
    tooExpensive: number
    outOfStock: number
    queueTooLong: number
  }
  expiredIngredients: string[]
  outOfStockItems: string[]
}
