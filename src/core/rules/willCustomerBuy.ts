/**
 * Determines whether a customer buys based on markup percentage.
 * Lower markup = higher chance they buy.
 */
export const willCustomerBuy = (sellPrice: number, cogm: number): boolean => {
  const markup = ((sellPrice - cogm) / cogm) * 100
  const roll = Math.random()

  if (markup < 30) return true
  if (markup <= 60) return roll <= 0.9
  if (markup <= 100) return roll <= 0.6
  if (markup <= 200) return roll <= 0.1
  return false
}
