'use server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import { uploadImage } from '@/lib/storage'
import { Prisma } from '@/generated/prisma/client'
import { requireAdmin } from './guard'
import { friendlyError } from '@/lib/errors'

export type FormState = { ok?: boolean; error?: string } | undefined

const optDate = z
  .string()
  .optional()
  .transform((s) => (s ? new Date(`${s}T00:00:00-03:00`) : null))
const optDateEnd = z
  .string()
  .optional()
  .transform((s) => (s ? new Date(`${s}T23:59:59-03:00`) : null))

// ───────────────────────────── Cupones

const couponSchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,30}$/, 'El código va en mayúsculas, sin espacios (3 a 30 caracteres)'),
  type: z.enum(['PERCENT', 'FIXED']),
  value: z.coerce.number().int().min(1, 'Ingresá el descuento'),
  minPurchase: z.coerce.number().int().min(0).default(0),
  maxUses: z.union([z.literal(''), z.coerce.number().int().min(1)]).transform((v) => (v === '' ? null : v)),
  startsAt: optDate,
  endsAt: optDateEnd,
})

export async function createCoupon(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin()
  const parsed = couponSchema.safeParse(Object.fromEntries(form))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  const d = parsed.data
  if (d.type === 'PERCENT' && d.value > 90) return { error: 'El porcentaje máximo es 90%' }
  try {
    await db.coupon.create({ data: d })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') return { error: 'Ya existe un cupón con ese código' }
    throw e
  }
  revalidatePath('/admin/cupones')
  return { ok: true }
}

export async function toggleCoupon(id: string, active: boolean) {
  await requireAdmin()
  await db.coupon.update({ where: { id }, data: { active } })
  revalidatePath('/admin/cupones')
}

export async function deleteCoupon(id: string) {
  await requireAdmin()
  await db.coupon.delete({ where: { id } })
  revalidatePath('/admin/cupones')
}

// ───────────────────────────── Campañas (banners de la home)

const campaignSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(2, 'Ingresá el título').max(60),
  subtitle: z.string().trim().max(160).optional(),
  ctaLabel: z.string().trim().max(40).optional(),
  ctaHref: z.string().trim().max(200).regex(/^(\/|https:\/\/)/, 'El link tiene que empezar con / o https://').or(z.literal('')).optional(),
  startsAt: z.string().min(1, 'Elegí la fecha de inicio').transform((s) => new Date(`${s}T00:00:00-03:00`)),
  endsAt: z.string().min(1, 'Elegí la fecha de fin').transform((s) => new Date(`${s}T23:59:59-03:00`)),
  showOnHome: z.literal('on').optional(),
})

function refreshHome() {
  revalidateTag('catalog')
  revalidatePath('/admin/campanas')
}

export async function saveCampaign(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin()
  const parsed = campaignSchema.safeParse(Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === 'string')))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  const d = parsed.data
  if (d.endsAt < d.startsAt) return { error: 'La fecha de fin es anterior a la de inicio' }

  let image: string | undefined
  const file = form.get('image')
  if (file instanceof File && file.size > 0) {
    try {
      image = await uploadImage(file, 'campaigns')
    } catch (e) {
      return { error: friendlyError(e, 'No se pudo subir la imagen. Probá de nuevo.') }
    }
  }
  if (!d.id && !image) return { error: 'Subí la imagen del banner' }

  const data = {
    title: d.title,
    subtitle: d.subtitle || null,
    ctaLabel: d.ctaLabel || null,
    ctaHref: d.ctaHref || null,
    startsAt: d.startsAt,
    endsAt: d.endsAt,
    showOnHome: d.showOnHome === 'on',
    ...(image && { image }),
  }
  if (d.id) await db.campaign.update({ where: { id: d.id }, data })
  else {
    const base = d.title.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    await db.campaign.create({ data: { ...data, image: image!, slug: `${base}-${Date.now().toString(36)}` } })
  }
  refreshHome()
  return { ok: true }
}

export async function toggleCampaign(id: string, active: boolean) {
  await requireAdmin()
  await db.campaign.update({ where: { id }, data: { active } })
  refreshHome()
}

export async function deleteCampaign(id: string) {
  await requireAdmin()
  await db.campaign.delete({ where: { id } })
  refreshHome()
}

// ───────────────────────────── Personalizados

const CUSTOM = ['NEW', 'QUOTED', 'ACCEPTED', 'IN_PRODUCTION', 'DELIVERED', 'CANCELLED'] as const

export async function setCustomOrderStatus(id: string, status: string, estimate?: number | null) {
  await requireAdmin()
  const s = z.enum(CUSTOM).parse(status)
  await db.customOrder.update({ where: { id }, data: { status: s, ...(estimate !== undefined && { estimate }) } })
  revalidatePath('/admin/personalizados')
}
