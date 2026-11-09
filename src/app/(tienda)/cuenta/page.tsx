import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { logoutAction } from '@/features/auth/actions'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { formatPrice } from '@/lib/format'

export const metadata: Metadata = { title: 'Mi cuenta', robots: { index: false } }

const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendiente de pago',
  PAID: 'Pagado',
  PREPARING: 'En preparación',
  SHIPPED: 'Enviado',
  READY_FOR_PICKUP: 'Listo para retirar',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reintegrado',
}

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user) redirect('/ingresar?volver=/cuenta')
  const orders = await db.order.findMany({
    where: { OR: [{ userId: session.user.id }, { email: session.user.email ?? '' }] },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
    take: 30,
  })
  const firstName = session.user.name?.split(' ')[0] ?? ''
  return (
    <Container className="max-w-4xl py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl font-black uppercase italic">Hola{firstName ? `, ${firstName}` : ''}</h1>
          <p className="mt-1 text-brand-muted">{session.user.email}</p>
        </div>
        <form action={logoutAction}>
          <button className="text-sm font-semibold underline underline-offset-4">Cerrar sesión</button>
        </form>
      </div>
      <nav className="mt-8 flex gap-4 text-sm font-semibold">
        <span className="border-b-2 border-brand-ink pb-1">Mis pedidos</span>
        <Link href="/favoritos" className="pb-1 text-brand-muted hover:text-brand-ink">Favoritos</Link>
        {/* TODO Fase 2: datos personales y direcciones guardadas */}
      </nav>
      {orders.length === 0 ? (
        <p className="mt-10 bg-brand-mist p-8 text-center">
          Todavía no hiciste pedidos. <Link href="/" className="font-semibold underline">Empezá a comprar</Link>
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-brand-line border-y border-brand-line">
          {orders.map((o) => (
            <li key={o.id}>
              <Link href={`/checkout/resultado?pedido=${o.id}`} className="flex flex-wrap items-center justify-between gap-3 py-4 hover:bg-brand-mist">
                <span>
                  <span className="font-semibold">Pedido #{o.number}</span>
                  <span className="block text-xs text-brand-muted">
                    {o.createdAt.toLocaleDateString('es-AR')} · {o.items.reduce((n, i) => n + i.quantity, 0)} productos
                  </span>
                </span>
                <span className="bg-brand-mist px-2 py-1 text-xs font-semibold uppercase">{ORDER_STATUS_LABEL[o.status]}</span>
                <span className="font-semibold tabular-nums">{formatPrice(o.total)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  )
}
