'use server'
import { z } from 'zod'
import { db } from '@/lib/db'

export type NewsletterState = { ok?: boolean; error?: string } | undefined

export async function subscribeNewsletter(_: NewsletterState, form: FormData): Promise<NewsletterState> {
  const parsed = z.string().trim().toLowerCase().email().safeParse(form.get('email'))
  if (!parsed.success) return { error: 'Ingresá un e-mail válido' }
  await db.newsletterSubscriber.upsert({ where: { email: parsed.data }, update: {}, create: { email: parsed.data } })
  return { ok: true }
}
