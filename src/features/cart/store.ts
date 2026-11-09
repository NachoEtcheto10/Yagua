'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  variantId: string
  productId: string
  name: string
  href: string
  image: string
  size: string
  color: string
  /** Precio mostrado. El servidor lo recalcula siempre al confirmar el pedido. */
  unitPrice: number
  quantity: number
  maxStock: number
}

type CartState = {
  items: CartItem[]
  open: boolean
  /** Cambia con cada agregado: dispara la animación del ícono del carrito */
  bump: number
  couponCode: string | null
  add(item: Omit<CartItem, 'quantity'>, quantity?: number): void
  setQuantity(variantId: string, quantity: number): void
  remove(variantId: string): void
  clear(): void
  setOpen(open: boolean): void
  setCoupon(code: string | null): void
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      open: false,
      bump: 0,
      couponCode: null,
      add: (item, quantity = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.variantId === item.variantId)
          const items = existing
            ? s.items.map((i) =>
                i.variantId === item.variantId ? { ...i, quantity: Math.min(i.maxStock, i.quantity + quantity) } : i,
              )
            : [...s.items, { ...item, quantity: Math.min(item.maxStock, quantity) }]
          return { items, open: true, bump: s.bump + 1 }
        }),
      setQuantity: (variantId, quantity) =>
        set((s) => ({
          items: s.items.map((i) => (i.variantId === variantId ? { ...i, quantity: Math.max(1, Math.min(i.maxStock, quantity)) } : i)),
        })),
      remove: (variantId) => set((s) => ({ items: s.items.filter((i) => i.variantId !== variantId) })),
      clear: () => set({ items: [], couponCode: null }),
      setOpen: (open) => set({ open }),
      setCoupon: (couponCode) => set({ couponCode }),
    }),
    {
      name: 'yagua-cart',
      partialize: (s) => ({ items: s.items, couponCode: s.couponCode }),
    },
  ),
)

export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.quantity, 0)
export const cartSubtotal = (items: CartItem[]) => items.reduce((n, i) => n + i.unitPrice * i.quantity, 0)
