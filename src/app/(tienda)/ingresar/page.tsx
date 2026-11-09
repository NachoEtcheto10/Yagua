import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { LoginForm } from '@/features/auth/AuthForms'
import { auth, googleEnabled } from '@/lib/auth'

export const metadata: Metadata = { title: 'Ingresar', robots: { index: false } }

const safe = (v?: string) => (v && v.startsWith('/') && !v.startsWith('//') ? v : '/cuenta')

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ volver?: string }> }) {
  const to = safe((await searchParams).volver)
  if ((await auth())?.user) redirect(to)
  return (
    <Container className="max-w-md py-14">
      <h1 className="font-display text-5xl font-black uppercase italic">Ingresar</h1>
      <p className="mb-8 mt-2 text-brand-muted">Seguí tus pedidos y guardá tus favoritos.</p>
      <LoginForm redirectTo={to} google={googleEnabled} />
    </Container>
  )
}
