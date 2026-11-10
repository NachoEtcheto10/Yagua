import { Search } from 'lucide-react'
import { Card, Empty, input, PageHeader, td, th } from '@/features/admin/components/ui'
import { SOLD } from '@/features/admin/queries'
import { db } from '@/lib/db'
import { cn, formatPrice } from '@/lib/format'

export const metadata = { title: 'Clientes' }

/** Clientes = quienes compraron (registrados o invitados), agrupados por e-mail */
export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = (await searchParams).q?.trim()
  const [buyers, registered, subscribers] = await Promise.all([
    db.order.groupBy({
      by: ['email'],
      where: { status: { in: SOLD }, ...(q && { OR: [{ email: { contains: q, mode: 'insensitive' } }, { customerName: { contains: q, mode: 'insensitive' } }] }) },
      _sum: { total: true },
      _count: true,
      _max: { createdAt: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 100,
    }),
    db.user.count({ where: { role: 'CUSTOMER' } }),
    db.newsletterSubscriber.count(),
  ])
  const names = await db.order.findMany({
    where: { email: { in: buyers.map((b) => b.email) } },
    orderBy: { createdAt: 'desc' },
    distinct: ['email'],
    select: { email: true, customerName: true, phone: true, userId: true },
  })
  const info = new Map(names.map((n) => [n.email, n]))

  return (
    <>
      <PageHeader title="Clientes" subtitle={`${registered} cuentas registradas · ${subscribers} suscriptos al newsletter`} />
      <Card>
        <form className="border-b border-brand-line p-3" action="/admin/clientes">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input name="q" defaultValue={q} placeholder="Buscar por nombre o e-mail" className={cn(input, 'pl-9')} />
          </div>
        </form>
        {buyers.length === 0 ? <Empty>Todavía no hay compras.</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-brand-line"><tr><th className={th}>Cliente</th><th className={th}>Teléfono</th><th className={`${th} text-right`}>Compras</th><th className={`${th} text-right`}>Total gastado</th><th className={th}>Última compra</th></tr></thead>
              <tbody className="divide-y divide-brand-line">
                {buyers.map((b) => {
                  const i = info.get(b.email)
                  return (
                    <tr key={b.email}>
                      <td className={td}>
                        <a href={`/admin/pedidos?q=${encodeURIComponent(b.email)}`} className="font-semibold hover:underline">{i?.customerName ?? b.email}</a>
                        <p className="text-xs text-brand-muted">{b.email}{i?.userId ? ' · registrado' : ''}</p>
                      </td>
                      <td className={td}>{i?.phone}</td>
                      <td className={`${td} text-right tabular-nums`}>{b._count}</td>
                      <td className={`${td} text-right font-semibold tabular-nums`}>{formatPrice(b._sum.total ?? 0)}</td>
                      <td className={td}>{b._max.createdAt?.toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}
