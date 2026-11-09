import 'server-only'
import crypto from 'node:crypto'
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago'
import { db } from '@/lib/db'
import { COMMERCE } from '@/lib/site'

// Mercado Pago (Checkout Pro). Con credenciales de PRUEBA funciona en modo sandbox.
// Variables: MP_ACCESS_TOKEN, NEXT_PUBLIC_MP_PUBLIC_KEY, MP_WEBHOOK_SECRET.
// TODO Fase 3: sumar Checkout Bricks (pago dentro del sitio) con la Public Key.

export function mercadoPagoEnabled() {
  return !!process.env.MP_ACCESS_TOKEN
}

function client() {
  const accessToken = process.env.MP_ACCESS_TOKEN
  if (!accessToken) throw new Error('Falta MP_ACCESS_TOKEN')
  return new MercadoPagoConfig({ accessToken, options: { timeout: 8000 } })
}

type OrderForPayment = { id: string; number: number; email: string; customerName: string; total: number }

export async function createPreference(order: OrderForPayment, origin: string) {
  const isHttps = origin.startsWith('https://')
  const back = (status: string) => `${origin}/checkout/resultado?pedido=${order.id}&estado=${status}`
  const pref = await new Preference(client()).create({
    body: {
      // Un solo ítem con el total del pedido (ya incluye descuentos y envío calculados en el servidor)
      items: [{ id: order.id, title: `Pedido Yaguá #${order.number}`, quantity: 1, unit_price: order.total, currency_id: 'ARS' }],
      payer: { email: order.email, name: order.customerName },
      external_reference: order.id,
      statement_descriptor: 'YAGUA',
      payment_methods: { installments: Math.max(...COMMERCE.interestFreeInstallments) },
      back_urls: { success: back('aprobado'), pending: back('pendiente'), failure: back('rechazado') },
      // Mercado Pago solo acepta auto_return y notificaciones con URLs públicas https
      ...(isHttps ? { auto_return: 'approved' as const, notification_url: `${origin}/api/webhooks/mercadopago` } : {}),
    },
  })
  const initPoint = process.env.MP_ACCESS_TOKEN?.startsWith('TEST-') ? pref.sandbox_init_point ?? pref.init_point : pref.init_point
  if (!pref.id || !initPoint) throw new Error('Mercado Pago no devolvió el link de pago')
  return { id: pref.id, initPoint }
}

/**
 * Verifica la firma del webhook (header x-signature) con MP_WEBHOOK_SECRET.
 * https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
 */
export function verifyWebhookSignature(opts: { signature: string | null; requestId: string | null; dataId: string }) {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret || !opts.signature) return false
  const parts = Object.fromEntries(opts.signature.split(',').map((p) => p.trim().split('=') as [string, string]))
  if (!parts.ts || !parts.v1) return false
  const manifest = `id:${opts.dataId.toLowerCase()};${opts.requestId ? `request-id:${opts.requestId};` : ''}ts:${parts.ts};`
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex')
  const a = Buffer.from(expected)
  const b = Buffer.from(parts.v1)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

const STATUS_MAP = {
  approved: 'APPROVED',
  authorized: 'APPROVED',
  pending: 'PENDING',
  in_process: 'PENDING',
  in_mediation: 'PENDING',
  rejected: 'REJECTED',
  cancelled: 'CANCELLED',
  refunded: 'REFUNDED',
  charged_back: 'REFUNDED',
} as const

/** Consulta el pago en Mercado Pago (nunca confiamos en lo que viene en la notificación) y actualiza el pedido */
export async function syncPayment(paymentId: string) {
  const mp = await new Payment(client()).get({ id: paymentId })
  const orderId = mp.external_reference
  if (!orderId) return
  const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true } })
  if (!order) return
  const status = STATUS_MAP[(mp.status ?? 'pending') as keyof typeof STATUS_MAP] ?? 'PENDING'

  // Un pago aprobado tiene que cubrir el total calculado por nosotros
  if (status === 'APPROVED' && Math.round(mp.transaction_amount ?? 0) < order.total) {
    console.error(`Pago ${paymentId} por un monto menor al del pedido ${order.number}`)
    return
  }

  await db.$transaction(async (tx) => {
    await tx.payment.updateMany({
      where: { orderId },
      data: { status, externalId: String(mp.id), raw: JSON.parse(JSON.stringify(mp)) },
    })
    if (order.status !== 'PENDING') return
    if (status === 'APPROVED') {
      await tx.order.update({ where: { id: orderId }, data: { status: 'PAID' } })
      for (const it of order.items) await tx.product.update({ where: { id: it.productId }, data: { soldCount: { increment: it.quantity } } })
    } else if (status === 'REJECTED' || status === 'CANCELLED') {
      // Devolver el stock reservado
      await tx.order.update({ where: { id: orderId }, data: { status: 'CANCELLED' } })
      for (const it of order.items) await tx.productVariant.update({ where: { id: it.variantId }, data: { stock: { increment: it.quantity } } })
    }
  })
}
