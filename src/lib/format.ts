const ars = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

/** $ 24.990 */
export function formatPrice(value: number) {
  return ars.format(value).replace(/\s/g, ' ')
}

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

export function discountPct(price: number, salePrice: number | null | undefined) {
  if (!salePrice || salePrice >= price) return 0
  return Math.round((1 - salePrice / price) * 100)
}
