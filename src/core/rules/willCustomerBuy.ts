/**
 * Determines whether a customer buys based on markup percentage.
 * Lower markup = higher chance they buy.
 */
export const willCustomerBuy = (sellPrice: number, cogm: number): boolean => {
  const markup = ((sellPrice - cogm) / cogm) * 100
  const roll = Math.random()

  if (markup < 20) return true
  if (markup <= 50) return roll <= 0.85
  if (markup <= 80) return roll <= 0.6
  if (markup <= 150) return roll <= 0.3
  if (markup <= 250) return roll <= 0.1
  return false
}
