'use client'
import { Truck } from 'lucide-react'
import { useState, useTransition } from 'react'
import { quoteShipping } from '@/features/checkout/actions'
import { formatPrice } from '@/lib/format'

export function ShippingCalculator({ price }: { price: number }) {
  const [cp, setCp] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  return (
    <div className="border border-brand-line p-4">
      <p className="flex items-center gap-2 text-sm font-semibold"><Truck size={18} /> Calculá el envío</p>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          start(async () => {
            const r = await quoteShipping(cp, price)
            if (r.ok) {
              setError(null)
              setResult(`${r.cost === 0 ? 'Envío gratis' : formatPrice(r.cost)} · ${r.days}`)
            } else {
              setResult(null)
              setError(r.error)
            }
          })
        }}
      >
        <input
          value={cp}
          onChange={(e) => setCp(e.target.value.replace(/\D/g, '').slice(0, 4))}
          inputMode="numeric"
          placeholder="Código postal"
          aria-label="Código postal"
          className="h-10 w-full border border-brand-line px-3 text-[16px] sm:text-sm"
        />
        <button type="submit" disabled={cp.length !== 4 || pending} className="h-10 shrink-0 border border-brand-ink px-4 text-sm font-semibold disabled:opacity-40">
          {pending ? '…' : 'Calcular'}
        </button>
      </form>
      {result && <p className="mt-2 text-sm"><strong>{result}</strong></p>}
      {error && <p className="mt-2 text-sm text-brand-accent">{error}</p>}
      <p className="mt-2 text-xs text-brand-muted">También podés retirar gratis en nuestro local de Concepción del Uruguay.</p>
    </div>
  )
}
