'use client'
import { CheckCircle2, Loader2, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, useTransition } from 'react'
import { buttonClass } from '@/components/ui/Container'
import { cn, formatPrice } from '@/lib/format'
import { SITE } from '@/lib/site'
import { placeWholesaleOrder } from './actions'
import { useWholesaleCart, wholesaleTotals } from './cart'

/** Revisión y envío del pedido mayorista */
export function WholesaleOrder({ minPurchase, companyName }: { minPurchase: number; companyName: string }) {
  const { lines, setQty, remove, clear } = useWholesaleCart()
  const [mounted, setMounted] = useState(false)
  const [delivery, setDelivery] = useState<'STORE_PICKUP' | 'HOME_DELIVERY'>('STORE_PICKUP')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<number | null>(null)
  const [pending, start] = useTransition()
  useEffect(() => setMounted(true), [])

  if (!mounted) return null
  if (done) {
    return (
      <div className="mx-auto max-w-xl border-2 border-brand-ink p-8 text-center">
        <CheckCircle2 size={44} className="mx-auto text-brand-turquoise-deep" />
        <h2 className="mt-4 font-display text-3xl font-black uppercase">¡Recibimos tu pedido!</h2>
        <p className="mt-2 text-brand-muted">Pedido mayorista <strong className="text-brand-ink">#{done}</strong> de {companyName}. Te contactamos para confirmar stock, forma de pago y entrega.</p>
        <a href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(`¡Hola! Hice el pedido mayorista #${done} (${companyName}).`)}`} target="_blank" rel="noopener" className={`${buttonClass.primary} mt-6`}>Avisar por WhatsApp</a>
      </div>
    )
  }
  if (lines.length === 0) {
    return (
      <div className="bg-brand-mist p-10 text-center">
        <p className="font-display text-2xl font-black uppercase">Tu pedido está vacío</p>
        <Link href="/mayoristas/catalogo" className={`${buttonClass.primary} mt-6`}>Ir al catálogo mayorista</Link>
      </div>
    )
  }

  const { units, subtotal } = wholesaleTotals(lines)
  const missing = Math.max(0, minPurchase - subtotal)
  const submit = () => {
    setError(null)
    start(async () => {
      const r = await placeWholesaleOrder({ lines: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })), delivery, notes })
      if (!r.ok) return setError(r.error)
      clear()
      setDone(r.number)
    })
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] [&>*]:min-w-0">
      <ul className="divide-y divide-brand-line border-y border-brand-line">
        {[...lines].sort((a, b) => a.name.localeCompare(b.name)).map((l) => (
          <li key={l.variantId} className="flex items-center gap-4 py-3">
            <span className="relative h-16 w-14 shrink-0 overflow-hidden bg-white">{l.image && <Image src={l.image} alt="" fill sizes="56px" className="object-cover" />}</span>
            <span className="min-w-0 flex-1 text-sm">
              <span className="block truncate font-semibold">{l.name}</span>
              <span className="text-brand-muted">{l.color} · Talle {l.size} · {formatPrice(l.unitPrice)} c/u</span>
            </span>
            <input
              type="number" min={1} max={l.maxStock} value={l.quantity} inputMode="numeric" aria-label={`Cantidad de ${l.name} ${l.color} ${l.size}`}
              onChange={(e) => setQty(l, Number(e.target.value) || 0)}
              className="h-10 w-20 border border-brand-line text-center tabular-nums outline-none focus:border-brand-ink"
            />
            <span className="w-28 text-right font-semibold tabular-nums">{formatPrice(l.unitPrice * l.quantity)}</span>
            <button type="button" onClick={() => remove(l.variantId)} aria-label={`Quitar ${l.name}`} className="grid h-9 w-9 place-items-center text-brand-muted hover:text-brand-accent"><Trash2 size={16} /></button>
          </li>
        ))}
      </ul>

      <aside className="h-fit space-y-5 bg-brand-mist p-6">
        <div className="flex justify-between text-sm"><span>{units} unidades</span><span className="tabular-nums">{formatPrice(subtotal)}</span></div>
        <div>
          <div className="h-2 overflow-hidden rounded-full bg-white"><div className="h-full bg-brand-turquoise" style={{ width: `${Math.min(100, (subtotal / minPurchase) * 100)}%` }} /></div>
          <p className={cn('mt-1 text-xs', missing > 0 ? 'font-semibold text-brand-accent' : 'text-brand-muted')}>
            {missing > 0 ? `Te faltan ${formatPrice(missing)} para la compra mínima de ${formatPrice(minPurchase)}` : `Compra mínima de ${formatPrice(minPurchase)} alcanzada`}
          </p>
        </div>
        <fieldset className="space-y-2 text-sm">
          <legend className="mb-1 font-semibold">Entrega</legend>
          {([['STORE_PICKUP', 'Retiro en el local'], ['HOME_DELIVERY', 'Envío (lo coordinamos con vos)']] as const).map(([v, label]) => (
            <label key={v} className="flex cursor-pointer items-center gap-2">
              <input type="radio" name="delivery" checked={delivery === v} onChange={() => setDelivery(v)} className="accent-brand-ink" /> {label}
            </label>
          ))}
        </fieldset>
        <label className="block text-sm font-semibold">
          Notas del pedido
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={1000} placeholder="Fecha de entrega, logos, forma de pago preferida…" className="mt-1.5 w-full border border-brand-line bg-white p-3 font-normal outline-none focus:border-brand-ink" />
        </label>
        <div className="flex items-end justify-between border-t border-brand-line pt-4">
          <span className="font-semibold">Total mayorista</span>
          <span className="font-display text-3xl font-black tabular-nums">{formatPrice(subtotal)}</span>
        </div>
        {error && <p role="alert" className="text-sm font-semibold text-brand-accent">{error}</p>}
        <button type="button" onClick={submit} disabled={pending || missing > 0} className={cn(buttonClass.primary, 'w-full disabled:opacity-50')}>
          {pending && <Loader2 size={18} className="animate-spin" />} Enviar pedido mayorista
        </button>
        <p className="text-xs text-brand-muted">Precios con IVA incluido. Te contactamos para confirmar el pago (transferencia) y la entrega.</p>
      </aside>
    </div>
  )
}
