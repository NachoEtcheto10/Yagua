import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { RegisterForm } from '@/features/auth/AuthForms'
import { auth, googleEnabled } from '@/lib/auth'

export const metadata: Metadata = { title: 'Crear cuenta', robots: { index: false } }

const safe = (v?: string) => (v && v.startsWith('/') && !v.startsWith('//') ? v : '/cuenta')

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ volver?: string }> }) {
  const to = safe((await searchParams).volver)
  if ((await auth())?.user) redirect(to)
  return (
    <Container className="max-w-md py-14">
      <h1 className="font-display text-5xl font-black uppercase italic">Crear cuenta</h1>
      <p className="mb-8 mt-2 text-brand-muted">Sumate y comprá más rápido.</p>
      <RegisterForm redirectTo={to} google={googleEnabled} />
    </Container>
  )
}
