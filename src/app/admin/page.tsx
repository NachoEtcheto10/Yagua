import { AlertTriangle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Card, dateTime, Empty, PageHeader, StatusBadge, td, th } from '@/features/admin/components/ui'
import { getDashboard } from '@/features/admin/queries'
import { formatPrice } from '@/lib/format'

export const metadata = { title: 'Resumen' }

function Stat({ label, value, hint, href }: { label: string; value: string; hint?: string; href?: string }) {
  const body = (
    <>
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">{label}</p>
      <p className="mt-2 font-display text-3xl font-extrabold tabular-nums lg:text-4xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-brand-muted">{hint}</p>}
    </>
  )
  return href ? (
    <Link href={href} className="block rounded-lg border border-brand-line bg-white p-5 transition hover:border-brand-ink">{body}</Link>
  ) : (
    <div className="rounded-lg border border-brand-line bg-white p-5">{body}</div>
  )
}

/** Ventas por día: una sola serie, barras finas con tooltip al pasar el mouse */
function SalesChart({ data }: { data: { day: string; total: number }[] }) {
  const max = Math.max(...data.map((d) => d.total), 1)
  const fmtDay = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`
  return (
    <div>
      <div className="flex h-48 items-end gap-1.5 border-b border-brand-line" role="img" aria-label="Ventas de los últimos 14 días">
        {data.map((d) => (
          <div key={d.day} className="group relative flex h-full flex-1 items-end justify-center">
            <div
              className="w-full max-w-7 rounded-t bg-brand-primary transition group-hover:bg-brand-accent"
              style={{ height: d.total ? `${Math.max(3, (d.total / max) * 100)}%` : '2px', opacity: d.total ? 1 : 0.15 }}
            />
            <div className="pointer-events-none absolute bottom-full z-10 mb-2 hidden whitespace-nowrap rounded bg-brand-primary px-2.5 py-1.5 text-xs text-white shadow-lg group-hover:block">
              <span className="text-white/60">{fmtDay(d.day)}</span> · <strong className="tabular-nums">{formatPrice(d.total)}</strong>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5 text-[11px] text-brand-muted">
        {data.map((d, i) => (
          <span key={d.day} className="flex-1 text-center tabular-nums">{i % 2 === 0 || i === data.length - 1 ? fmtDay(d.day) : ''}</span>
        ))}
      </div>
      {/* Vista en tabla para lectores de pantalla */}
      <table className="sr-only">
        <caption>Ventas por día</caption>
        <tbody>{data.map((d) => <tr key={d.day}><th>{fmtDay(d.day)}</th><td>{formatPrice(d.total)}</td></tr>)}</tbody>
      </table>
    </div>
  )
}

export default async function AdminHome() {
  const d = await getDashboard()
  const monthName = new Date().toLocaleString('es-AR', { month: 'long', timeZone: 'America/Argentina/Buenos_Aires' })
  return (
    <>
      <PageHeader title="Resumen" subtitle={`Cómo viene ${monthName}`} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Stat label="Ventas del mes" value={formatPrice(d.revenue)} hint={`${d.orders} pedidos`} />
        <Stat label="Ticket promedio" value={formatPrice(d.avgTicket)} />
        <Stat label="Para preparar" value={String(d.toPrepare)} hint="Pagados o en preparación" href="/admin/pedidos?estado=PAID" />
        <Stat label="Esperando pago" value={String(d.pendingPayment)} hint={d.customNew ? `${d.customNew} presupuestos nuevos` : 'Transferencias y efectivo'} href="/admin/pedidos?estado=PENDING" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card title="Ventas · últimos 14 días">
          <div className="p-5 pt-10"><SalesChart data={d.chart} /></div>
        </Card>
        <Card title="Lo más vendido · 30 días">
          {d.topItems.length === 0 ? <Empty>Todavía no hay ventas.</Empty> : (
            <ol className="divide-y divide-brand-line">
              {d.topItems.map((t, i) => (
                <li key={t.productId} className="flex items-center gap-3 px-5 py-3 text-sm">
                  <span className="w-5 font-display text-lg font-bold text-brand-muted">{i + 1}</span>
                  <Link href={`/admin/productos/${t.productId}`} className="flex-1 truncate hover:underline">{t.name}</Link>
                  <span className="tabular-nums text-brand-muted">{t.units} u.</span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card title="Últimos pedidos" action={<Link href="/admin/pedidos" className="flex items-center gap-1 text-sm font-semibold hover:underline">Ver todos <ArrowRight size={16} /></Link>}>
          {d.recent.length === 0 ? <Empty>Todavía no hay pedidos.</Empty> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-brand-line"><tr><th className={th}>Pedido</th><th className={th}>Cliente</th><th className={th}>Estado</th><th className={`${th} text-right`}>Total</th></tr></thead>
                <tbody className="divide-y divide-brand-line">
                  {d.recent.map((o) => (
                    <tr key={o.id} className="hover:bg-brand-mist/60">
                      <td className={td}><Link href={`/admin/pedidos/${o.id}`} className="font-semibold hover:underline">#{o.number}</Link><p className="text-xs text-brand-muted">{dateTime(o.createdAt)}</p></td>
                      <td className={td}>{o.customerName}</td>
                      <td className={td}><StatusBadge status={o.status} /></td>
                      <td className={`${td} text-right font-semibold tabular-nums`}>{formatPrice(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        <Card title="Poco stock">
          {d.lowStock.length === 0 ? <Empty>Todo con stock 👌</Empty> : (
            <ul className="divide-y divide-brand-line">
              {d.lowStock.map((v) => (
                <li key={v.id} className="flex items-start gap-3 px-5 py-3 text-sm">
                  <AlertTriangle size={16} className={v.out.length ? 'mt-0.5 shrink-0 text-red-600' : 'mt-0.5 shrink-0 text-amber-600'} aria-hidden />
                  <Link href={`/admin/productos/${v.id}`} className="min-w-0 flex-1 hover:underline">
                    <span className="block truncate font-medium">{v.name}</span>
                    <span className="block truncate text-xs text-brand-muted">
                      {v.out.length > 0 && <span className="text-red-700">Agotado: {v.out.join(', ')}</span>}
                      {v.out.length > 0 && v.few.length > 0 && ' · '}
                      {v.few.length > 0 && <span className="text-amber-700">Quedan pocos: {v.few.join(', ')}</span>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  )
}
