import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Container, buttonClass } from '@/components/ui/Container'
import { mercadoPagoEnabled, syncPayment } from '@/features/payments/mercadopago'
import { db } from '@/lib/db'
import { formatPrice } from '@/lib/format'
import { SITE } from '@/lib/site'

export const metadata: Metadata = { title: 'Tu pedido', robots: { index: false } }

type Props = { searchParams: Promise<Record<string, string | undefined>> }

export default async function ResultPage({ searchParams }: Props) {
  const sp = await searchParams
  if (!sp.pedido) notFound()
  // Al volver de Mercado Pago consultamos el pago en su API (no confiamos en los parámetros de la URL)
  if (sp.payment_id && mercadoPagoEnabled()) {
    try {
      await syncPayment(sp.payment_id)
    } catch (e) {
      console.error('syncPayment', e)
    }
  }
  const order = await db.order.findUnique({ where: { id: sp.pedido }, include: { items: true, payments: true } })
  if (!order) notFound()

  const paid = order.status !== 'PENDING' && order.status !== 'CANCELLED'
  const rejected = order.status === 'CANCELLED'
  const Icon = paid ? CheckCircle2 : rejected ? XCircle : Clock
  const title = paid ? '¡Gracias por tu compra!' : rejected ? 'El pago no se completó' : order.paymentMethod === 'MERCADOPAGO' ? 'Estamos esperando el pago' : '¡Recibimos tu pedido!'

  return (
    <Container className="max-w-3xl py-14">
      <div className="text-center">
        <Icon size={56} className={`mx-auto ${paid ? 'text-brand-secondary' : rejected ? 'text-brand-accent' : 'text-brand-muted'}`} />
        <h1 className="mt-4 font-display text-5xl font-black uppercase italic">{title}</h1>
        <p className="mt-2 text-brand-muted">Pedido <strong className="text-brand-ink">#{order.number}</strong> · Te vamos a contactar a {order.email}{/* TODO Fase 3: e-mail de confirmación */}</p>
      </div>

      {!paid && !rejected && order.paymentMethod === 'BANK_TRANSFER' && (
        <div className="mt-8 border-2 border-brand-ink p-5">
          <p className="font-display text-xl font-bold uppercase">Datos para transferir</p>
          <dl className="mt-3 grid gap-1 text-sm sm:grid-cols-[140px_1fr]">
            <dt className="text-brand-muted">Importe</dt><dd className="font-bold">{formatPrice(order.total)}</dd>
            {SITE.bank.cbu && (
              <>
                <dt className="text-brand-muted">Titular</dt><dd>{SITE.bank.holder || SITE.legalName}</dd>
                <dt className="text-brand-muted">CBU</dt><dd className="font-mono">{SITE.bank.cbu}</dd>
                {SITE.bank.alias && <><dt className="text-brand-muted">Alias</dt><dd className="font-mono">{SITE.bank.alias}</dd></>}
              </>
            )}
          </dl>
          {SITE.bank.cbu ? (
            <p className="mt-3 text-sm">Mandanos el comprobante por <a className="underline" href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(`¡Hola! Te paso el comprobante del pedido #${order.number}`)}`}>WhatsApp</a> indicando el número de pedido.</p>
          ) : (
            <p className="mt-3 text-sm">
              Escribinos por{' '}
              <a className="font-semibold underline" href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(`¡Hola! Hice el pedido #${order.number} y quiero pagarlo por transferencia.`)}`} target="_blank" rel="noopener">WhatsApp</a>{' '}
              y te pasamos el CBU y el alias. Cuando transfieras, mandanos el comprobante con el número de pedido.
            </p>
          )}
        </div>
      )}
      {!paid && !rejected && order.paymentMethod === 'CASH' && (
        <p className="mt-8 border-2 border-brand-ink p-5 text-sm">Pagás en efectivo al retirar en el local. Te avisamos cuando tu pedido esté listo.</p>
      )}
      {rejected && (
        <p className="mt-8 text-center text-sm">Podés volver a intentarlo con otro medio de pago. Si necesitás ayuda, <a className="underline" href={`https://wa.me/${SITE.whatsapp}`}>escribinos</a>.</p>
      )}

      <ul className="mt-10 divide-y divide-brand-line border-y border-brand-line">
        {order.items.map((i) => (
          <li key={i.id} className="flex items-center gap-4 py-3">
            <span className="relative h-16 w-16 shrink-0 bg-brand-mist">{i.image && <Image src={i.image} alt="" fill sizes="64px" className="object-contain p-1" />}</span>
            <span className="flex-1 text-sm">{i.productName}<span className="block text-xs text-brand-muted">{i.color} · {i.size} · x{i.quantity}</span></span>
            <span className="text-sm tabular-nums">{formatPrice(i.unitPrice * i.quantity)}</span>
          </li>
        ))}
      </ul>
      <dl className="ml-auto mt-4 max-w-xs space-y-1 text-sm">
        <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
        {order.discount > 0 && <div className="flex justify-between text-brand-accent"><dt>Descuentos</dt><dd>-{formatPrice(order.discount)}</dd></div>}
        <div className="flex justify-between"><dt>Envío</dt><dd>{order.shippingCost ? formatPrice(order.shippingCost) : 'Gratis'}</dd></div>
        <div className="flex justify-between border-t border-brand-line pt-2 text-base font-bold"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
      </dl>
      <div className="mt-10 text-center"><Link href="/" className={buttonClass.primary}>Seguir comprando</Link></div>
    </Container>
  )
}
