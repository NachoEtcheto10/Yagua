import 'server-only'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { effectivePrice } from '@/features/checkout/pricing'

export type WholesaleSettings = { discountPct: number; minPurchase: number }

/** Valores por defecto hasta que el dueño los cambie desde el panel (TODO: confirmar con el cliente) */
export const WHOLESALE_DEFAULTS: WholesaleSettings = { discountPct: 30, minPurchase: 300_000 }

export async function getWholesaleSettings(): Promise<WholesaleSettings> {
  const row = await db.storeSetting.findUnique({ where: { key: 'wholesale' } })
  const v = (row?.value ?? {}) as Partial<WholesaleSettings>
  return {
    discountPct: typeof v.discountPct === 'number' ? v.discountPct : WHOLESALE_DEFAULTS.discountPct,
    minPurchase: typeof v.minPurchase === 'number' ? v.minPurchase : WHOLESALE_DEFAULTS.minPurchase,
  }
}

/** Precio mayorista: el precio de venta (oferta si tiene) menos el % mayorista, redondeado a $10 */
export function wholesalePrice(p: { price: number; salePrice: number | null }, pct: number) {
  return Math.round((effectivePrice(p) * (1 - pct / 100)) / 10) * 10
}

export type WholesaleAccess =
  | { state: 'guest' }
  | { state: 'no-account'; userId: string; email: string }
  | { state: 'PENDING' | 'REJECTED' | 'APPROVED'; userId: string; email: string; account: { id: string; companyName: string; cuit: string; phone: string; city: string; adminNote: string | null } }

/** ¿Quién está mirando? Solo las cuentas APROBADAS ven precios mayoristas y pueden comprar */
export async function getWholesaleAccess(): Promise<WholesaleAccess> {
  const session = await auth()
  if (!session?.user?.id) return { state: 'guest' }
  const account = await db.wholesaleAccount.findUnique({
    where: { userId: session.user.id },
    select: { id: true, companyName: true, cuit: true, phone: true, city: true, status: true, adminNote: true },
  })
  const base = { userId: session.user.id, email: session.user.email ?? '' }
  if (!account) return { state: 'no-account', ...base }
  return { state: account.status, ...base, account }
}
