import { ArrowLeft, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { OrderNotes, OrderStatusControl } from '@/features/admin/components/OrderStatusControl'
import { Card, dateTime, PageHeader, PAYMENT_LABEL, SHIPPING_LABEL, StatusBadge } from '@/features/admin/components/ui'
import { db } from '@/lib/db'
import { formatPrice } from '@/lib/format'

type Address = { street: string; number: string; apartment?: string; city: string; province: string; postalCode: string }

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const o = await db.order.findUnique({ where: { id: (await params).id }, select: { number: true } })
  return { title: o ? `Pedido #${o.number}` : 'Pedido' }
}

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const order = await db.order.findUnique({
    where: { id: (await params).id },
    include: { items: true, payments: { orderBy: { createdAt: 'asc' } }, user: { select: { id: true, name: true } } },
  })
  if (!order) notFound()
  const addr = order.shippingAddress as Address | null
  const phone = order.phone.replace(/\D/g, '')
  const wa = `https://wa.me/${phone.startsWith('54') ? phone : `54${phone}`}?text=${encodeURIComponent(`¡Hola ${order.customerName.split(' ')[0]}! Te escribimos de Yaguá por tu pedido #${order.number}.`)}`

  return (
    <>
      <Link href="/admin/pedidos" className="mb-3 inline-flex items-center gap-1 text-sm text-brand-muted hover:text-brand-ink"><ArrowLeft size={16} /> Pedidos</Link>
      <PageHeader title={`Pedido #${order.number}`} subtitle={dateTime(order.createdAt)} actions={<StatusBadge status={order.status} />} />

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <Card title="Productos">
            <ul className="divide-y divide-brand-line">
              {order.items.map((it) => (
                <li key={it.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-brand-mist">
                    {it.image && <Image src={it.image} alt="" fill sizes="64px" className="object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1 text-sm">
                    <Link href={`/admin/productos/${it.productId}`} className="font-semibold hover:underline">{it.productName}</Link>
                    <p className="text-brand-muted">{it.color} · Talle {it.size}</p>
                  </div>
                  <div className="text-right text-sm tabular-nums">
                    <p>{it.quantity} × {formatPrice(it.unitPrice)}</p>
                    <p className="font-semibold">{formatPrice(it.quantity * it.unitPrice)}</p>
                  </div>
                </li>
              ))}
            </ul>
            <dl className="space-y-1.5 border-t border-brand-line px-5 py-4 text-sm">
              <div className="flex justify-between"><dt className="text-brand-muted">Subtotal</dt><dd className="tabular-nums">{formatPrice(order.subtotal)}</dd></div>
              {order.discount > 0 && <div className="flex justify-between"><dt className="text-brand-muted">Descuentos{order.couponCode && ` (cupón ${order.couponCode})`}</dt><dd className="tabular-nums text-emerald-700">− {formatPrice(order.discount)}</dd></div>}
              <div className="flex justify-between"><dt className="text-brand-muted">Envío</dt><dd className="tabular-nums">{order.shippingCost ? formatPrice(order.shippingCost) : 'Sin cargo'}</dd></div>
              <div className="flex justify-between border-t border-brand-line pt-2 text-base font-bold"><dt>Total</dt><dd className="tabular-nums">{formatPrice(order.total)}</dd></div>
            </dl>
          </Card>
          <Card title="Notas"><div className="p-5"><OrderNotes orderId={order.id} notes={order.notes ?? ''} /></div></Card>
        </div>

        <div className="space-y-4">
          <Card title="Estado">
            <div className="p-5"><OrderStatusControl orderId={order.id} status={order.status} pickup={order.shippingMethod === 'STORE_PICKUP'} /></div>
          </Card>
          <Card title="Cliente">
            <div className="space-y-1 p-5 text-sm">
              <p className="font-semibold">{order.customerName}</p>
              <p><a href={`mailto:${order.email}`} className="hover:underline">{order.email}</a></p>
              <p>{order.phone}{order.dni && ` · DNI ${order.dni}`}</p>
              {order.user ? <p className="text-brand-muted">Cliente registrado</p> : <p className="text-brand-muted">Compró como invitado</p>}
              <a href={wa} target="_blank" rel="noopener" className="mt-3 inline-flex items-center gap-2 rounded bg-[#25d366] px-4 py-2 text-sm font-semibold text-white hover:brightness-95">
                <MessageCircle size={16} /> Escribir por WhatsApp
              </a>
            </div>
          </Card>
          <Card title="Entrega">
            <div className="space-y-1 p-5 text-sm">
              <p className="font-semibold">{SHIPPING_LABEL[order.shippingMethod]}</p>
              {addr ? (
                <p className="text-brand-muted">{addr.street} {addr.number}{addr.apartment && `, ${addr.apartment}`}<br />{addr.city}, {addr.province} ({addr.postalCode})</p>
              ) : (
                <p className="text-brand-muted">El cliente retira en el local.</p>
              )}
            </div>
          </Card>
          <Card title="Pago">
            <div className="space-y-1 p-5 text-sm">
              <p className="font-semibold">{PAYMENT_LABEL[order.paymentMethod]}</p>
              {order.payments.map((p) => (
                <p key={p.id} className="text-brand-muted">
                  {formatPrice(p.amount)} · {{ PENDING: 'pendiente', APPROVED: 'aprobado', REJECTED: 'rechazado', CANCELLED: 'cancelado', REFUNDED: 'reintegrado' }[p.status]}
                  {p.externalId && ` · MP ${p.externalId}`}
                </p>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
