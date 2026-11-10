import { MessageCircle } from 'lucide-react'
import Image from 'next/image'
import { CustomOrderStatusSelect } from '@/features/admin/components/CustomOrderStatusSelect'
import { Card, dateTime, Empty, PageHeader } from '@/features/admin/components/ui'
import { db } from '@/lib/db'
import { formatPrice } from '@/lib/format'

export const metadata = { title: 'Personalizados' }

type Colors = { primary?: string; secondary?: string }
type Player = { name: string; number: string; size: string }

export default async function CustomOrdersPage() {
  const orders = await db.customOrder.findMany({ orderBy: { createdAt: 'desc' }, take: 100 })
  return (
    <>
      <PageHeader title="Personalizados" subtitle="Pedidos de presupuesto de camisetas y equipos para clubes" />
      {orders.length === 0 ? <Card><Empty>Todavía no hay pedidos de presupuesto.</Empty></Card> : (
        <ul className="space-y-4">
          {orders.map((o) => {
            const colors = o.colors as Colors
            const players = (o.players as Player[]) ?? []
            const phone = o.phone.replace(/\D/g, '')
            return (
              <li key={o.id}>
                <Card>
                  <div className="flex flex-wrap items-start gap-4 p-5">
                    <div className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded bg-brand-mist">
                      {o.logoUrl ? <Image src={o.logoUrl} alt={`Escudo de ${o.teamName}`} fill sizes="64px" className="object-contain p-1" /> : <span className="font-display text-xl font-bold">{o.teamName.slice(0, 2).toUpperCase()}</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-xl font-bold uppercase">{o.teamName}</p>
                      <p className="text-sm text-brand-muted">{o.quantity} × {o.garment} · {dateTime(o.createdAt)}</p>
                      <p className="mt-1 flex items-center gap-2 text-sm">
                        {[colors.primary, colors.secondary].filter(Boolean).map((c) => <span key={c} className="inline-block h-4 w-4 rounded-full border border-brand-line" style={{ background: c }} title={c} />)}
                        <span>{o.contactName} · {o.email} · {o.phone}</span>
                      </p>
                      {o.notes && <p className="mt-2 text-sm">{o.notes}</p>}
                      {players.length > 0 && (
                        <details className="mt-2 text-sm">
                          <summary className="cursor-pointer font-semibold">Lista de {players.length} jugadores</summary>
                          <ul className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                            {players.map((p, i) => <li key={i} className="tabular-nums">#{p.number} {p.name} <span className="text-brand-muted">· {p.size}</span></li>)}
                          </ul>
                        </details>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <CustomOrderStatusSelect id={o.id} status={o.status} />
                      {o.estimate && <p className="text-sm">Presupuesto: <strong>{formatPrice(o.estimate)}</strong></p>}
                      <a href={`https://wa.me/${phone.startsWith('54') ? phone : `54${phone}`}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#128c7e] hover:underline"><MessageCircle size={16} /> WhatsApp</a>
                    </div>
                  </div>
                </Card>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
