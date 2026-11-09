'use server'
import { headers } from 'next/headers'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { SITE } from '@/lib/site'
import { createPreference, mercadoPagoEnabled } from '@/features/payments/mercadopago'
import { evaluateCoupon } from './coupon'
import { effectivePrice, shippingCost, transferDiscount, zoneForPostalCode } from './pricing'
import { checkoutSchema, type CheckoutInput } from './schema'

const lineSchema = z.array(z.object({ variantId: z.string().min(1), quantity: z.number().int().min(1).max(20) })).min(1).max(50)

/** Recalcula el carrito con precios y stock de la base. Nunca usa el precio que manda el navegador. */
async function priceLines(lines: z.infer<typeof lineSchema>) {
  const variants = await db.productVariant.findMany({
    where: { id: { in: lines.map((l) => l.variantId) } },
    include: { product: { include: { images: { orderBy: { sortOrder: 'asc' } } } } },
  })
  const priced = lines.map((l) => {
    const v = variants.find((x) => x.id === l.variantId)
    if (!v || !v.product.active) throw new Error('Uno de los productos ya no está disponible. Revisá tu carrito.')
    if (v.stock < l.quantity) throw new Error(`No hay stock suficiente de ${v.product.name} (${v.color}, ${v.size}). Quedan ${v.stock}.`)
    const image = v.product.images.find((i) => i.color === v.color) ?? v.product.images[0]
    return {
      variant: v,
      quantity: l.quantity,
      unitPrice: effectivePrice(v.product),
      image: image?.url ?? null,
    }
  })
  const subtotal = priced.reduce((n, l) => n + l.unitPrice * l.quantity, 0)
  return { priced, subtotal }
}

/** Para el carrito: valida el cupón con el subtotal real */
export async function checkCoupon(code: string, lines: { variantId: string; quantity: number }[]) {
  try {
    const { subtotal } = await priceLines(lineSchema.parse(lines))
    return await evaluateCoupon(code, subtotal)
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : 'No se pudo validar el cupón' }
  }
}

/** Cotiza envío por código postal (TODO: Andreani / Correo Argentino) */
export async function quoteShipping(postalCode: string, subtotal: number) {
  const zone = zoneForPostalCode(postalCode)
  if (!zone) return { ok: false as const, error: 'Código postal inválido' }
  return {
    ok: true as const,
    cost: shippingCost(subtotal, zone),
    days: zone === 'local' ? 'En el día' : zone === 'entreRios' ? '2 a 4 días hábiles' : '4 a 7 días hábiles',
  }
}

export type PlaceOrderResult = { ok: true; orderId: string; redirectUrl: string } | { ok: false; error: string }

/** Crea el pedido con montos calculados en el servidor y, si corresponde, la preferencia de Mercado Pago */
export async function placeOrder(input: CheckoutInput, lines: { variantId: string; quantity: number }[]): Promise<PlaceOrderResult> {
  const parsed = checkoutSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Revisá los datos del formulario' }
  const data = parsed.data
  try {
    const { priced, subtotal } = await priceLines(lineSchema.parse(lines))

    let discount = 0
    let couponCode: string | null = null
    if (data.couponCode) {
      const c = await evaluateCoupon(data.couponCode, subtotal)
      if (!c.ok) return { ok: false, error: c.error }
      discount = c.discount
      couponCode = c.code
    }

    let shipping = 0
    if (data.shippingMethod === 'HOME_DELIVERY') {
      const zone = data.address ? zoneForPostalCode(data.address.postalCode) : null
      if (!zone) return { ok: false, error: 'Código postal inválido' }
      shipping = shippingCost(subtotal, zone)
    }

    if (data.paymentMethod === 'BANK_TRANSFER') discount += transferDiscount(subtotal - discount)
    if (data.paymentMethod === 'MERCADOPAGO' && !mercadoPagoEnabled()) {
      return { ok: false, error: 'Mercado Pago todavía no está configurado. Elegí transferencia o efectivo.' }
    }

    const total = Math.max(0, subtotal - discount + shipping)
    const session = await auth()

    const order = await db.$transaction(async (tx) => {
      // Reserva de stock: descuenta solo si sigue habiendo (evita vender de más)
      for (const l of priced) {
        const updated = await tx.productVariant.updateMany({
          where: { id: l.variant.id, stock: { gte: l.quantity } },
          data: { stock: { decrement: l.quantity } },
        })
        if (updated.count === 0) throw new Error(`Se agotó ${l.variant.product.name} (${l.variant.color}, ${l.variant.size}).`)
      }
      if (couponCode) await tx.coupon.update({ where: { code: couponCode }, data: { usedCount: { increment: 1 } } })
      return tx.order.create({
        data: {
          userId: session?.user?.id ?? null,
          email: data.email,
          customerName: `${data.firstName} ${data.lastName}`,
          phone: data.phone,
          dni: data.dni,
          shippingMethod: data.shippingMethod,
          shippingAddress: data.shippingMethod === 'HOME_DELIVERY' ? data.address : undefined,
          paymentMethod: data.paymentMethod,
          subtotal,
          discount,
          shippingCost: shipping,
          total,
          couponCode,
          notes: data.notes || null,
          items: {
            create: priced.map((l) => ({
              productId: l.variant.productId,
              variantId: l.variant.id,
              productName: l.variant.product.name,
              size: l.variant.size,
              color: l.variant.color,
              image: l.image,
              unitPrice: l.unitPrice,
              quantity: l.quantity,
            })),
          },
          payments: { create: { method: data.paymentMethod, amount: total } },
        },
        include: { items: true },
      })
    })

    if (data.paymentMethod === 'MERCADOPAGO') {
      const h = await headers()
      const origin = h.get('origin') ?? SITE.url
      const pref = await createPreference(order, origin)
      await db.payment.updateMany({ where: { orderId: order.id }, data: { preferenceId: pref.id } })
      return { ok: true, orderId: order.id, redirectUrl: pref.initPoint }
    }
    return { ok: true, orderId: order.id, redirectUrl: `/checkout/resultado?pedido=${order.id}` }
  } catch (e) {
    console.error('placeOrder', e)
    return { ok: false, error: e instanceof Error ? e.message : 'No pudimos crear el pedido' }
  }
}
