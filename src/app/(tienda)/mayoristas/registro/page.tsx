import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { WholesaleRegisterForm } from '@/features/wholesale/RegisterForm'
import { getWholesaleAccess } from '@/features/wholesale/settings'

export const metadata: Metadata = { title: 'Pedir cuenta mayorista', robots: { index: false } }

export default async function WholesaleRegisterPage() {
  const access = await getWholesaleAccess()
  // Si ya pidió la cuenta, va directo al estado de su solicitud
  if (access.state === 'PENDING' || access.state === 'APPROVED' || access.state === 'REJECTED') redirect('/mayoristas/catalogo')
  return (
    <Container className="max-w-3xl py-14">
      <p className="font-display text-sm font-extrabold uppercase tracking-[0.2em] text-brand-turquoise-deep">Ventas mayoristas</p>
      <h1 className="mt-2 font-display text-4xl font-black uppercase sm:text-5xl">Pedí tu cuenta de empresa</h1>
      <p className="mb-10 mt-3 text-brand-muted">
        Con estos datos evaluamos si podemos venderte por mayor. {access.state === 'guest' && <>¿Ya tenés cuenta? <Link href="/ingresar?tipo=empresa&volver=/mayoristas/registro" className="font-semibold text-brand-ink underline">Ingresá</Link> y completá solo los datos de la empresa.</>}
      </p>
      <WholesaleRegisterForm loggedIn={access.state === 'no-account'} />
    </Container>
  )
}
