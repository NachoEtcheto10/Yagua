'use server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireAdmin } from './guard'

export type SimpleState = { ok?: boolean; error?: string } | undefined

/** Aprueba o rechaza una solicitud mayorista (con nota opcional para la empresa) */
export async function reviewWholesale(id: string, status: 'APPROVED' | 'REJECTED' | 'PENDING', note?: string) {
  await requireAdmin()
  const s = z.enum(['APPROVED', 'REJECTED', 'PENDING']).parse(status)
  await db.wholesaleAccount.update({
    where: { id },
    data: { status: s, adminNote: note?.trim() ? note.trim().slice(0, 500) : null, reviewedAt: s === 'PENDING' ? null : new Date() },
  })
  revalidatePath('/admin', 'layout')
}

const settingsSchema = z.object({
  discountPct: z.coerce.number().int().min(1, 'El descuento tiene que ser de al menos 1%').max(80, 'Máximo 80%'),
  minPurchase: z.coerce.number().int().min(0, 'Monto inválido').max(100_000_000),
})

/** % mayorista y compra mínima */
export async function saveWholesaleSettings(_: SimpleState, form: FormData): Promise<SimpleState> {
  await requireAdmin()
  const parsed = settingsSchema.safeParse({ discountPct: form.get('discountPct'), minPurchase: String(form.get('minPurchase') ?? '').replace(/\D/g, '') })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  await db.storeSetting.upsert({ where: { key: 'wholesale' }, update: { value: parsed.data }, create: { key: 'wholesale', value: parsed.data } })
  revalidatePath('/admin/mayoristas')
  revalidatePath('/mayoristas', 'layout')
  return { ok: true }
}
