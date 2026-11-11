'use server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireAdmin } from './guard'
import { SOLD } from './queries'
import { friendlyError } from '@/lib/errors'

const STATUSES = ['PENDING', 'PAID', 'PREPARING', 'SHIPPED', 'READY_FOR_PICKUP', 'DELIVERED', 'CANCELLED', 'REFUNDED'] as const
const CLOSED = new Set(['CANCELLED', 'REFUNDED'])

export type ActionResult = { ok: true } | { ok: false; error: string }

/**
 * Cambia el estado de un pedido manteniendo stock y ventas consistentes:
 * - al confirmar el pago (PENDING → pagado/preparación/...) suma a "lo más vendido" y aprueba el pago
 * - al cancelar o reintegrar devuelve el stock reservado
 */
export async function setOrderStatus(orderId: string, next: string): Promise<ActionResult> {
  await requireAdmin()
  const status = z.enum(STATUSES).safeParse(next)
  if (!status.success) return { ok: false, error: 'Estado inválido' }
  const to = status.data

  try {
    await db.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } })
      if (!order) throw new Error('El pedido no existe')
      const from = order.status
      if (from === to) return
      if (CLOSED.has(from)) throw new Error('Un pedido cancelado no se puede reabrir. Creá uno nuevo.')

      // Evita procesar dos veces si dos personas cambian el estado al mismo tiempo
      const changed = await tx.order.updateMany({ where: { id: orderId, status: from }, data: { status: to } })
      if (changed.count === 0) throw new Error('El pedido cambió mientras lo editabas. Recargá la página.')

      const wasSold = SOLD.includes(from)
      const isSold = SOLD.includes(to)
      if (!wasSold && isSold) {
        for (const it of order.items) await tx.product.update({ where: { id: it.productId }, data: { soldCount: { increment: it.quantity } } })
        await tx.payment.updateMany({ where: { orderId, status: 'PENDING' }, data: { status: 'APPROVED' } })
      }
      if (CLOSED.has(to)) {
        for (const it of order.items) await tx.productVariant.update({ where: { id: it.variantId }, data: { stock: { increment: it.quantity } } })
        if (wasSold) for (const it of order.items) await tx.product.update({ where: { id: it.productId }, data: { soldCount: { decrement: it.quantity } } })
        await tx.payment.updateMany({ where: { orderId }, data: { status: to === 'REFUNDED' ? 'REFUNDED' : 'CANCELLED' } })
      }
    })
  } catch (e) {
    return { ok: false, error: friendlyError(e, 'No se pudo actualizar el pedido. Probá de nuevo.') }
  }

  revalidatePath('/admin', 'layout')
  revalidateTag('catalog') // stock y "más vendidos"
  return { ok: true }
}

export async function setOrderNotes(orderId: string, notes: string): Promise<ActionResult> {
  await requireAdmin()
  const parsed = z.string().max(1000).safeParse(notes)
  if (!parsed.success) return { ok: false, error: 'La nota es demasiado larga' }
  await db.order.update({ where: { id: orderId }, data: { notes: parsed.data || null } })
  revalidatePath(`/admin/pedidos/${orderId}`)
  return { ok: true }
}
