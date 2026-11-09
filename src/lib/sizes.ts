const SIZE_ORDER = ['XS', 'S', 'M', 'ML', 'L', 'XL', 'XXL', 'XXXL']

/** Ordena talles: primero los de ropa (XS → XXL), después números y medidas de menor a mayor */
export function sortSizes(sizes: string[]) {
  return [...sizes].sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(a)
    const ib = SIZE_ORDER.indexOf(b)
    if (ia >= 0 && ib >= 0) return ia - ib
    if (ia >= 0) return -1
    if (ib >= 0) return 1
    return a.localeCompare(b, 'es', { numeric: true })
  })
}
