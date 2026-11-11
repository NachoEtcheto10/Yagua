import { Search } from 'lucide-react'
import Link from 'next/link'
import { Card, dateTime, Empty, input, ORDER_STATUS, PageHeader, PAYMENT_LABEL, SHIPPING_LABEL, StatusBadge, td, th } from '@/features/admin/components/ui'
import { db } from '@/lib/db'
import { cn, formatPrice } from '@/lib/format'
import type { OrderStatus } from '@/generated/prisma/enums'
import type { Prisma } from '@/generated/prisma/client'

export const metadata = { title: 'Pedidos' }

const PAGE = 20

type SP = Promise<{ estado?: string; q?: string; pagina?: string }>

export default async function OrdersPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const status = sp.estado && sp.estado in ORDER_STATUS ? (sp.estado as OrderStatus) : undefined
  const q = sp.q?.trim()
  const page = Math.max(1, Number(sp.pagina) || 1)

  const where: Prisma.OrderWhereInput = {
    ...(status && { status }),
    // "#147" o "147" (hasta 6 cifras) busca el número de pedido; más cifras, un DNI; si no, nombre o e-mail
    ...(q && /^#?\d{1,6}$/.test(q) && { number: Number(q.replace('#', '')) }),
    ...(q && /^\d{7,8}$/.test(q) && { dni: q }),
    ...(q && !/^#?\d+$/.test(q) && {
      OR: [{ customerName: { contains: q, mode: 'insensitive' as const } }, { email: { contains: q, mode: 'insensitive' as const } }],
    }),
  }
  const [orders, total, counts] = await Promise.all([
    db.order.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * PAGE, take: PAGE, include: { _count: { select: { items: true } } } }),
    db.order.count({ where }),
    db.order.groupBy({ by: ['status'], _count: true }),
  ])
  const countOf = (s: OrderStatus) => counts.find((c) => c.status === s)?._count ?? 0
  const pages = Math.max(1, Math.ceil(total / PAGE))
  const href = (p: Record<string, string | undefined>) => {
    const u = new URLSearchParams()
    const merged = { estado: status, q, ...p }
    for (const [k, v] of Object.entries(merged)) if (v) u.set(k, v)
    return `/admin/pedidos${u.size ? `?${u}` : ''}`
  }

  return (
    <>
      <PageHeader title="Pedidos" subtitle={`${total} ${total === 1 ? 'pedido' : 'pedidos'}`} />

      <div className="mb-4 flex flex-wrap gap-2">
        <Link href={href({ estado: undefined, pagina: undefined })} className={cn('rounded-full border px-3.5 py-1.5 text-sm font-medium', !status ? 'border-brand-ink bg-brand-ink text-white' : 'border-brand-line bg-white hover:border-brand-ink')}>Todos</Link>
        {(Object.keys(ORDER_STATUS) as OrderStatus[]).map((s) => (
          <Link key={s} href={href({ estado: s, pagina: undefined })} className={cn('rounded-full border px-3.5 py-1.5 text-sm font-medium', status === s ? 'border-brand-ink bg-brand-ink text-white' : 'border-brand-line bg-white hover:border-brand-ink')}>
            {ORDER_STATUS[s].label} <span className="opacity-60">{countOf(s)}</span>
          </Link>
        ))}
      </div>

      <Card>
        <form className="flex gap-2 border-b border-brand-line p-3" action="/admin/pedidos">
          {status && <input type="hidden" name="estado" value={status} />}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input name="q" defaultValue={q} placeholder="Buscar por número, nombre, e-mail o DNI" className={cn(input, 'pl-9')} />
          </div>
        </form>
        {orders.length === 0 ? <Empty>No hay pedidos con esos filtros.</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b border-brand-line"><tr><th className={th}>Pedido</th><th className={th}>Cliente</th><th className={th}>Entrega y pago</th><th className={th}>Estado</th><th className={`${th} text-right`}>Total</th></tr></thead>
              <tbody className="divide-y divide-brand-line">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-brand-mist/60">
                    <td className={td}>
                      <Link href={`/admin/pedidos/${o.id}`} className="font-semibold hover:underline">#{o.number}</Link>
                      <p className="text-xs text-brand-muted">{dateTime(o.createdAt)}</p>
                    </td>
                    <td className={td}>{o.customerName}<p className="text-xs text-brand-muted">{o.email}</p></td>
                    <td className={td}>{SHIPPING_LABEL[o.shippingMethod]}<p className="text-xs text-brand-muted">{PAYMENT_LABEL[o.paymentMethod]} · {o._count.items} {o._count.items === 1 ? 'producto' : 'productos'}</p></td>
                    <td className={td}><StatusBadge status={o.status} /></td>
                    <td className={`${td} text-right font-semibold tabular-nums`}>{formatPrice(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {pages > 1 && (
        <nav className="mt-4 flex justify-center gap-1" aria-label="Páginas">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <Link key={n} href={href({ pagina: n > 1 ? String(n) : undefined })} aria-current={n === page ? 'page' : undefined} className={cn('grid h-9 w-9 place-items-center rounded border text-sm font-semibold', n === page ? 'border-brand-ink bg-brand-ink text-white' : 'border-brand-line bg-white')}>{n}</Link>
          ))}
        </nav>
      )}
    </>
  )
}
