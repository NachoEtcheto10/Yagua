// Reglas de precios compartidas entre el navegador (para mostrar) y el servidor (para cobrar).
// El servidor SIEMPRE recalcula con estos mismos cálculos: nunca se confía en el precio del cliente.
import { COMMERCE } from '@/lib/site'

export type ShippingZone = 'local' | 'entreRios' | 'rest'

/** Precio que se cobra: el de oferta si existe */
export function effectivePrice(p: { price: number; salePrice: number | null }) {
  return p.salePrice != null && p.salePrice < p.price ? p.salePrice : p.price
}

/** Zona de envío a partir del código postal (simplificado; TODO: tarifas reales del correo) */
export function zoneForPostalCode(cp: string): ShippingZone | null {
  const n = Number(cp.replace(/\D/g, '').slice(0, 4))
  if (!n || n < 1000 || n > 9999) return null
  if (n === 3260) return 'local'
  // Códigos postales de Entre Ríos: 2820-2846 y 3100-3287
  if ((n >= 2820 && n <= 2846) || (n >= 3100 && n <= 3287)) return 'entreRios'
  return 'rest'
}

export function shippingCost(subtotal: number, zone: ShippingZone) {
  if (subtotal >= COMMERCE.freeShippingFrom) return 0
  return COMMERCE.shipping[zone]
}

export function transferDiscount(amount: number) {
  return Math.round((amount * COMMERCE.transferDiscountPct) / 100)
}

export function installmentAmount(total: number, n: number) {
  return Math.ceil(total / n)
}
