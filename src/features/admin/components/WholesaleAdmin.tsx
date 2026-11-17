'use client'
import { Loader2 } from 'lucide-react'
import { useActionState, useState, useTransition } from 'react'
import { reviewWholesale, saveWholesaleSettings, type SimpleState } from '../wholesale-actions'
import { btn, input } from './ui'

export function WholesaleSettingsForm({ discountPct, minPurchase }: { discountPct: number; minPurchase: number }) {
  const [state, action, pending] = useActionState<SimpleState, FormData>(saveWholesaleSettings, undefined)
  return (
    <form action={action} className="grid gap-3 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <label className="text-sm font-semibold">Descuento mayorista (%)<input name="discountPct" inputMode="numeric" defaultValue={discountPct} className={`${input} mt-1.5`} /></label>
      <label className="text-sm font-semibold">Compra mínima ($)<input name="minPurchase" inputMode="numeric" defaultValue={minPurchase} className={`${input} mt-1.5`} /></label>
      <button type="submit" disabled={pending} className={btn.primary}>{pending && <Loader2 size={16} className="animate-spin" />} Guardar</button>
      {state?.error && <p role="alert" className="text-sm text-red-700 sm:col-span-3">{state.error}</p>}
      {state?.ok && <p className="text-sm text-emerald-700 sm:col-span-3">Guardado. Los precios mayoristas ya se calculan con estos valores.</p>}
    </form>
  )
}

export function ReviewButtons({ id, status }: { id: string; status: 'PENDING' | 'APPROVED' | 'REJECTED' }) {
  const [pending, start] = useTransition()
  const [note, setNote] = useState('')
  const [rejecting, setRejecting] = useState(false)
  if (status !== 'PENDING') {
    return (
      <button type="button" disabled={pending} onClick={() => start(() => reviewWholesale(id, 'PENDING'))} className="text-sm font-semibold text-brand-muted underline hover:text-brand-ink">
        Volver a revisión
      </button>
    )
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={pending} onClick={() => start(() => reviewWholesale(id, 'APPROVED'))} className={btn.primary}>Aprobar</button>
        <button type="button" disabled={pending} onClick={() => setRejecting((v) => !v)} className={btn.danger}>Rechazar</button>
      </div>
      {rejecting && (
        <div className="flex gap-2">
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Motivo (lo ve la empresa, opcional)" className={input} />
          <button type="button" disabled={pending} onClick={() => start(() => reviewWholesale(id, 'REJECTED', note))} className={btn.danger}>Confirmar</button>
        </div>
      )}
    </div>
  )
}
