import 'server-only'
import { db } from '@/lib/db'

export type CouponResult = { ok: true; code: string; discount: number; label: string } | { ok: false; error: string }

/** Valida un cupón contra el subtotal (calculado por el servidor) */
export async function evaluateCoupon(rawCode: string, subtotal: number): Promise<CouponResult> {
  const code = rawCode.trim().toUpperCase()
  if (!code) return { ok: false, error: 'Ingresá un código' }
  const c = await db.coupon.findUnique({ where: { code } })
  const now = new Date()
  if (!c || !c.active) return { ok: false, error: 'El cupón no existe' }
  if ((c.startsAt && c.startsAt > now) || (c.endsAt && c.endsAt < now)) return { ok: false, error: 'El cupón no está vigente' }
  if (c.maxUses != null && c.usedCount >= c.maxUses) return { ok: false, error: 'El cupón ya no tiene usos disponibles' }
  if (subtotal < c.minPurchase) {
    return { ok: false, error: `Válido para compras desde $${c.minPurchase.toLocaleString('es-AR')}` }
  }
  const discount = c.type === 'PERCENT' ? Math.round((subtotal * c.value) / 100) : Math.min(subtotal, c.value)
  return { ok: true, code, discount, label: c.type === 'PERCENT' ? `${c.value}% OFF` : `$${c.value.toLocaleString('es-AR')} OFF` }
}
