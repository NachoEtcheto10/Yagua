import { CouponForm, DeleteButton, Toggle } from '@/features/admin/components/MarketingForms'
import { Card, Empty, PageHeader, td, th } from '@/features/admin/components/ui'
import { db } from '@/lib/db'
import { formatPrice } from '@/lib/format'

export const metadata = { title: 'Cupones' }

const fmt = (d: Date | null) => (d ? d.toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }) : null)

export default async function CouponsPage() {
  const coupons = await db.coupon.findMany({ orderBy: [{ active: 'desc' }, { code: 'asc' }] })
  return (
    <>
      <PageHeader title="Cupones" subtitle="Códigos de descuento que el cliente ingresa en el carrito" />
      <Card title="Nuevo cupón" className="mb-4"><CouponForm /></Card>
      <Card>
        {coupons.length === 0 ? <Empty>No hay cupones.</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="border-b border-brand-line"><tr><th className={th}>Código</th><th className={th}>Descuento</th><th className={th}>Condiciones</th><th className={th}>Usos</th><th className={th}>Activo</th><th /></tr></thead>
              <tbody className="divide-y divide-brand-line">
                {coupons.map((c) => {
                  const from = fmt(c.startsAt)
                  const to = fmt(c.endsAt)
                  return (
                    <tr key={c.id}>
                      <td className={`${td} font-mono font-semibold`}>{c.code}</td>
                      <td className={td}>{c.type === 'PERCENT' ? `${c.value}%` : formatPrice(c.value)}</td>
                      <td className={`${td} text-brand-muted`}>
                        {c.minPurchase > 0 ? `Desde ${formatPrice(c.minPurchase)}` : 'Sin mínimo'}
                        {(from || to) && <p className="text-xs">{from ? `Del ${from}` : ''} {to ? `al ${to}` : ''}</p>}
                      </td>
                      <td className={`${td} tabular-nums`}>{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ''}</td>
                      <td className={td}><Toggle kind="coupon" id={c.id} on={c.active} /></td>
                      <td className={`${td} w-10`}><DeleteButton kind="coupon" id={c.id} label={`el cupón ${c.code}`} /></td>
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
