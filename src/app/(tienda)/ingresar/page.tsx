import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { LoginForm } from '@/features/auth/AuthForms'
import { auth, googleEnabled } from '@/lib/auth'
import { cn } from '@/lib/format'

export const metadata: Metadata = { title: 'Ingresar', robots: { index: false } }

const safe = (v: string | undefined, fallback: string) => (v && v.startsWith('/') && !v.startsWith('//') ? v : fallback)

/** Login con dos pestañas: clientes de la tienda y empresas (mayoristas) */
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ volver?: string; tipo?: string }> }) {
  const sp = await searchParams
  const empresa = sp.tipo === 'empresa'
  const to = safe(sp.volver, empresa ? '/mayoristas/catalogo' : '/cuenta')
  if ((await auth())?.user) redirect(to)
  const tab = (active: boolean) => cn('flex-1 border-b-4 py-3 text-center font-display text-lg font-black uppercase transition', active ? 'border-brand-turquoise text-brand-ink' : 'border-brand-line text-brand-muted hover:text-brand-ink')
  return (
    <Container className="max-w-md py-14">
      <h1 className="font-display text-5xl font-black uppercase">Ingresar</h1>
      <nav className="mt-6 flex" aria-label="Tipo de cuenta">
        <Link href="/ingresar" className={tab(!empresa)} aria-current={!empresa ? 'page' : undefined}>Clientes</Link>
        <Link href="/ingresar?tipo=empresa" className={tab(empresa)} aria-current={empresa ? 'page' : undefined}>Empresas</Link>
      </nav>
      <p className="mb-8 mt-4 text-brand-muted">
        {empresa ? 'Tiendas, clubes, colegios y empresas: ingresá para ver los precios mayoristas y armar tu pedido.' : 'Seguí tus pedidos y guardá tus favoritos.'}
      </p>
      {empresa ? (
        <LoginForm key="empresa" redirectTo={to} google={false} registerHref="/mayoristas/registro" registerLabel="Pedí tu cuenta mayorista" />
      ) : (
        <LoginForm key="cliente" redirectTo={to} google={googleEnabled} />
      )}
    </Container>
  )
}
