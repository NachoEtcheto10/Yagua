'use client'
import { Loader2, Trash2 } from 'lucide-react'
import { useActionState, useEffect, useRef, useTransition } from 'react'
import { createCoupon, deleteCampaign, deleteCoupon, saveCampaign, toggleCampaign, toggleCoupon, type FormState } from '../marketing-actions'
import { btn, input } from './ui'

function Label({ children }: { children: React.ReactNode }) {
  return <span className="mb-1.5 block text-sm font-semibold">{children}</span>
}

export function CouponForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(createCoupon, undefined)
  const ref = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (state?.ok) ref.current?.reset()
  }, [state])
  return (
    <form ref={ref} action={action} className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
      <label className="sm:col-span-2"><Label>Código</Label><input name="code" required className={`${input} uppercase`} placeholder="VERANO15" /></label>
      <label><Label>Tipo</Label><select name="type" className={input}><option value="PERCENT">Porcentaje (%)</option><option value="FIXED">Monto fijo ($)</option></select></label>
      <label><Label>Descuento</Label><input name="value" required inputMode="numeric" className={input} placeholder="15" /></label>
      <label><Label>Compra mínima ($)</Label><input name="minPurchase" inputMode="numeric" className={input} placeholder="0" /></label>
      <label><Label>Usos máximos</Label><input name="maxUses" inputMode="numeric" className={input} placeholder="Sin límite" /></label>
      <label><Label>Desde</Label><input name="startsAt" type="date" className={input} /></label>
      <label><Label>Hasta</Label><input name="endsAt" type="date" className={input} /></label>
      <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-4">
        <button type="submit" disabled={pending} className={btn.primary}>{pending && <Loader2 size={16} className="animate-spin" />} Crear cupón</button>
        {state?.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
        {state?.ok && <p className="text-sm text-emerald-700">Cupón creado</p>}
      </div>
    </form>
  )
}

export function Toggle({ on, kind, id }: { on: boolean; kind: 'coupon' | 'campaign'; id: string }) {
  const [pending, start] = useTransition()
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={pending}
      onClick={() => start(() => (kind === 'coupon' ? toggleCoupon(id, !on) : toggleCampaign(id, !on)))}
      className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50 ${on ? 'bg-emerald-600' : 'bg-brand-line'}`}
      aria-label={on ? 'Desactivar' : 'Activar'}
    >
      <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${on ? 'translate-x-5' : ''}`} />
    </button>
  )
}

export function DeleteButton({ kind, id, label }: { kind: 'coupon' | 'campaign'; id: string; label: string }) {
  const [pending, start] = useTransition()
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => confirm(`¿Borrar ${label}?`) && start(() => (kind === 'coupon' ? deleteCoupon(id) : deleteCampaign(id)))}
      className="grid h-8 w-8 place-items-center rounded text-brand-muted hover:bg-red-50 hover:text-red-700"
      aria-label={`Borrar ${label}`}
    >
      <Trash2 size={16} />
    </button>
  )
}

type CampaignValue = { id?: string; title: string; subtitle: string; ctaLabel: string; ctaHref: string; startsAt: string; endsAt: string; showOnHome: boolean }

export function CampaignForm({ value, onDone }: { value?: CampaignValue; onDone?: () => void }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveCampaign, undefined)
  const ref = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (state?.ok) {
      if (!value?.id) ref.current?.reset()
      onDone?.()
    }
  }, [state, value?.id, onDone])
  return (
    <form ref={ref} action={action} className="grid gap-3 p-5 sm:grid-cols-2">
      {value?.id && <input type="hidden" name="id" value={value.id} />}
      <label className="sm:col-span-2"><Label>Título</Label><input name="title" required defaultValue={value?.title} className={input} placeholder="Black Friday" /></label>
      <label className="sm:col-span-2"><Label>Bajada</Label><input name="subtitle" defaultValue={value?.subtitle} className={input} placeholder="Hasta 30% OFF en toda la tienda" /></label>
      <label><Label>Texto del botón</Label><input name="ctaLabel" defaultValue={value?.ctaLabel} className={input} placeholder="Ver ofertas" /></label>
      <label><Label>Link del botón</Label><input name="ctaHref" defaultValue={value?.ctaHref} className={input} placeholder="/ofertas" /></label>
      <label><Label>Desde</Label><input name="startsAt" type="date" required defaultValue={value?.startsAt} className={input} /></label>
      <label><Label>Hasta</Label><input name="endsAt" type="date" required defaultValue={value?.endsAt} className={input} /></label>
      <label className="sm:col-span-2"><Label>Imagen {value?.id && '(dejala vacía para mantener la actual)'}</Label><input name="image" type="file" accept="image/*" className={`${input} file:mr-3 file:rounded file:border-0 file:bg-brand-mist file:px-3 file:py-1.5`} /></label>
      <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" name="showOnHome" defaultChecked={value?.showOnHome ?? true} className="h-4 w-4 accent-brand-primary" /> Mostrar en la página de inicio</label>
      <div className="flex items-center gap-3 sm:col-span-2">
        <button type="submit" disabled={pending} className={btn.primary}>{pending && <Loader2 size={16} className="animate-spin" />} {value?.id ? 'Guardar' : 'Crear campaña'}</button>
        {state?.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      </div>
    </form>
  )
}
