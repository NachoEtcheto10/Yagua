'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type WholesaleLine = {
  variantId: string
  productId: string
  name: string
  image: string | null
  size: string
  color: string
  /** Precio mayorista mostrado. El servidor lo recalcula siempre al confirmar. */
  unitPrice: number
  quantity: number
  maxStock: number
}

type State = {
  lines: WholesaleLine[]
  setQty(line: Omit<WholesaleLine, 'quantity'>, quantity: number): void
  remove(variantId: string): void
  clear(): void
}

/** Carrito mayorista: separado del carrito de la tienda (no se mezclan pedidos) */
export const useWholesaleCart = create<State>()(
  persist(
    (set) => ({
      lines: [],
      setQty: (line, quantity) =>
        set((s) => {
          const q = Math.max(0, Math.min(quantity, line.maxStock))
          const rest = s.lines.filter((l) => l.variantId !== line.variantId)
          return { lines: q > 0 ? [...rest, { ...line, quantity: q }] : rest }
        }),
      remove: (variantId) => set((s) => ({ lines: s.lines.filter((l) => l.variantId !== variantId) })),
      clear: () => set({ lines: [] }),
    }),
    { name: 'yagua-mayorista' },
  ),
)

export const wholesaleTotals = (lines: WholesaleLine[]) => ({
  units: lines.reduce((n, l) => n + l.quantity, 0),
  subtotal: lines.reduce((n, l) => n + l.unitPrice * l.quantity, 0),
})
