'use server'
import bcrypt from 'bcryptjs'
import { AuthError } from 'next-auth'
import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth, signIn } from '@/lib/auth'
import { db } from '@/lib/db'
import { friendlyError } from '@/lib/errors'
import { wholesaleOrderSchema, wholesaleRegisterSchema } from './schema'
import { getWholesaleAccess, getWholesaleSettings, wholesalePrice } from './settings'

/** values: lo que escribió la persona, para no perderlo si hay un error (React vacía el formulario al enviarlo) */
export type WholesaleFormState = { error?: string; fieldErrors?: Record<string, string>; values?: Record<string, string> } | undefined

const companyFields = wholesaleRegisterSchema.pick({
  companyName: true, cuit: true, businessType: true, monthlyVolume: true, phone: true, city: true, website: true, instagram: true, message: true,
})

function toAccount(d: ReturnType<typeof companyFields.parse>) {
  return {
    companyName: d.companyName,
    cuit: d.cuit.replace(/\D/g, '').replace(/^(\d{2})(\d{8})(\d)$/, '$1-$2-$3'),
    businessType: d.businessType,
    monthlyVolume: d.monthlyVolume,
    phone: d.phone,
    city: d.city,
    website: d.website || null,
    instagram: d.instagram || null,
    message: d.message || null,
  }
}

const fieldErrors = (issues: { path: PropertyKey[]; message: string }[]) => Object.fromEntries(issues.map((i) => [String(i.path[0]), i.message]))

/**
 * Solicitud de cuenta mayorista. Si la persona ya tiene sesión, solo carga los datos de la empresa;
 * si no, se crea la cuenta y la solicitud juntas. Queda PENDIENTE hasta que la aprueban en el panel.
 */
export async function requestWholesaleAction(_: WholesaleFormState, form: FormData): Promise<WholesaleFormState> {
  const raw = Object.fromEntries(form)
  const values = Object.fromEntries(Object.entries(raw).filter(([k, v]) => k !== 'password' && typeof v === 'string')) as Record<string, string>
  const session = await auth()

  if (session?.user?.id) {
    const parsed = companyFields.safeParse(raw)
    if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error.issues), values }
    const exists = await db.wholesaleAccount.findUnique({ where: { userId: session.user.id } })
    if (!exists) await db.wholesaleAccount.create({ data: { userId: session.user.id, ...toAccount(parsed.data) } })
    revalidatePath('/admin', 'layout')
    redirect('/mayoristas/catalogo')
  }

  const parsed = wholesaleRegisterSchema.safeParse(raw)
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error.issues), values }
  const { name, email, password } = parsed.data
  if (await db.user.findUnique({ where: { email } })) {
    return { fieldErrors: { email: 'Ya hay una cuenta con ese e-mail. Ingresá en la pestaña "Empresas" y completá la solicitud.' }, values }
  }
  await db.user.create({
    data: { name, email, passwordHash: await bcrypt.hash(password, 10), wholesale: { create: toAccount(parsed.data) } },
  })
  revalidatePath('/admin', 'layout')
  try {
    await signIn('credentials', { email, password, redirectTo: '/mayoristas/catalogo' })
  } catch (e) {
    if (e instanceof AuthError) return { error: 'La solicitud se creó, pero no pudimos iniciar sesión. Probá ingresar como empresa.', values }
    throw e
  }
}

export type WholesaleOrderResult = { ok: true; orderId: string; number: number } | { ok: false; error: string }

/** Pedido mayorista: solo empresas aprobadas. Precios y compra mínima se recalculan en el servidor. */
export async function placeWholesaleOrder(input: unknown): Promise<WholesaleOrderResult> {
  const access = await getWholesaleAccess()
  if (access.state !== 'APPROVED') return { ok: false, error: 'Tu cuenta mayorista todavía no está aprobada.' }
  const parsed = wholesaleOrderSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Revisá el pedido: hay cantidades inválidas.' }
  const { lines, delivery, notes } = parsed.data
  const settings = await getWholesaleSettings()

  try {
    const variants = await db.productVariant.findMany({
      where: { id: { in: lines.map((l) => l.variantId) } },
      include: { product: { include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } } } },
    })
    const priced = lines.map((l) => {
      const v = variants.find((x) => x.id === l.variantId)
      if (!v || !v.product.active) throw new Error('Uno de los productos ya no está disponible. Revisá el pedido.')
      if (v.stock < l.quantity) throw new Error(`De ${v.product.name} (${v.color}, ${v.size}) quedan ${v.stock}. Ajustá la cantidad.`)
      return { v, quantity: l.quantity, unitPrice: wholesalePrice(v.product, settings.discountPct) }
    })
    const subtotal = priced.reduce((n, l) => n + l.unitPrice * l.quantity, 0)
    if (subtotal < settings.minPurchase) {
      return { ok: false, error: `La compra mínima mayorista es de $${settings.minPurchase.toLocaleString('es-AR')}. Te faltan $${(settings.minPurchase - subtotal).toLocaleString('es-AR')}.` }
    }
    const a = access.account
    const order = await db.$transaction(async (tx) => {
      for (const l of priced) {
        const updated = await tx.productVariant.updateMany({ where: { id: l.v.id, stock: { gte: l.quantity } }, data: { stock: { decrement: l.quantity } } })
        if (updated.count === 0) throw new Error(`Se agotó ${l.v.product.name} (${l.v.color}, ${l.v.size}).`)
      }
      return tx.order.create({
        data: {
          channel: 'WHOLESALE',
          userId: access.userId,
          email: access.email,
          customerName: a.companyName,
          phone: a.phone,
          dni: a.cuit,
          shippingMethod: delivery,
          paymentMethod: 'BANK_TRANSFER',
          subtotal,
          total: subtotal,
          notes: [`Pedido mayorista (${settings.discountPct}% sobre lista). CUIT ${a.cuit}. ${a.city}.`, delivery === 'HOME_DELIVERY' ? 'Envío: coordinar con el cliente.' : '', notes || ''].filter(Boolean).join(' '),
          items: {
            create: priced.map((l) => ({
              productId: l.v.productId, variantId: l.v.id, productName: l.v.product.name, size: l.v.size, color: l.v.color,
              image: l.v.product.images[0]?.url ?? null, unitPrice: l.unitPrice, quantity: l.quantity,
            })),
          },
          payments: { create: { method: 'BANK_TRANSFER', amount: subtotal } },
        },
        select: { id: true, number: true },
      })
    })
    revalidateTag('catalog')
    revalidatePath('/admin', 'layout')
    return { ok: true, orderId: order.id, number: order.number }
  } catch (e) {
    return { ok: false, error: friendlyError(e, 'No pudimos crear el pedido. Probá de nuevo en unos minutos.') }
  }
}
