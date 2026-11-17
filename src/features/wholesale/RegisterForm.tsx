'use client'
import { Loader2 } from 'lucide-react'
import { useActionState } from 'react'
import { buttonClass } from '@/components/ui/Container'
import { cn } from '@/lib/format'
import { requestWholesaleAction, type WholesaleFormState } from './actions'
import { BUSINESS_TYPES, VOLUMES } from './schema'

const input = 'mt-1.5 w-full border border-brand-line bg-white px-3 py-3 outline-none transition focus:border-brand-ink'

function Field({ name, label, error, children, hint, className }: { name: string; label: string; error?: string; children?: React.ReactNode; hint?: string; className?: string }) {
  return (
    <label htmlFor={name} className={cn('block text-sm font-semibold', className)}>
      {label}
      {children}
      {hint && !error && <span className="mt-1 block text-xs font-normal text-brand-muted">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-brand-accent">{error}</span>}
    </label>
  )
}

/** Solicitud de cuenta mayorista. Con sesión iniciada solo pide los datos de la empresa. */
export function WholesaleRegisterForm({ loggedIn }: { loggedIn: boolean }) {
  const [state, action, pending] = useActionState<WholesaleFormState, FormData>(requestWholesaleAction, undefined)
  const e = state?.fieldErrors ?? {}
  const v = state?.values ?? {}
  return (
    <form key={JSON.stringify(v)} action={action} className="space-y-8" noValidate>
      {!loggedIn && (
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-3 font-display text-xl font-black uppercase">Tu cuenta</legend>
          <Field name="name" label="Nombre y apellido" error={e.name}><input id="name" name="name" defaultValue={v.name} autoComplete="name" className={input} /></Field>
          <Field name="email" label="E-mail" error={e.email}><input id="email" name="email" defaultValue={v.email} type="email" autoComplete="email" className={input} /></Field>
          <Field name="password" label="Contraseña" error={e.password} hint="Mínimo 8 caracteres" className="sm:col-span-2">
            <input id="password" name="password" type="password" autoComplete="new-password" className={input} />
          </Field>
        </fieldset>
      )}

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 font-display text-xl font-black uppercase">Tu empresa</legend>
        <Field name="companyName" label="Razón social" error={e.companyName}><input id="companyName" name="companyName" defaultValue={v.companyName} autoComplete="organization" className={input} /></Field>
        <Field name="cuit" label="CUIT" error={e.cuit} hint="11 números, con o sin guiones"><input id="cuit" name="cuit" defaultValue={v.cuit} inputMode="numeric" placeholder="30-71234567-8" className={input} /></Field>
        <Field name="businessType" label="Tipo de negocio" error={e.businessType}>
          <select id="businessType" name="businessType" defaultValue={v.businessType ?? ''} className={input}>
            <option value="" disabled>Elegí…</option>
            {BUSINESS_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field name="monthlyVolume" label="¿Cuánto comprarías por mes?" error={e.monthlyVolume}>
          <select id="monthlyVolume" name="monthlyVolume" defaultValue={v.monthlyVolume ?? ''} className={input}>
            <option value="" disabled>Elegí…</option>
            {VOLUMES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field name="phone" label="Teléfono / WhatsApp" error={e.phone}><input id="phone" name="phone" defaultValue={v.phone} type="tel" autoComplete="tel" className={input} /></Field>
        <Field name="city" label="Ciudad" error={e.city}><input id="city" name="city" defaultValue={v.city} autoComplete="address-level2" className={input} /></Field>
        <Field name="instagram" label="Instagram" error={e.instagram} hint="Opcional"><input id="instagram" name="instagram" defaultValue={v.instagram} placeholder="@tutienda" className={input} /></Field>
        <Field name="website" label="Página web" error={e.website} hint="Opcional"><input id="website" name="website" defaultValue={v.website} placeholder="www.tutienda.com.ar" className={input} /></Field>
        <Field name="message" label="Contanos qué necesitás" error={e.message} hint="Opcional: productos, cantidades, fechas…" className="sm:col-span-2">
          <textarea id="message" name="message" defaultValue={v.message} rows={3} className={input} />
        </Field>
      </fieldset>

      {state?.error && <p role="alert" className="text-sm font-semibold text-brand-accent">{state.error}</p>}
      {Object.keys(e).length > 0 && <p role="alert" className="text-sm font-semibold text-brand-accent">Revisá los campos marcados.</p>}
      <button type="submit" disabled={pending} className={cn(buttonClass.primary, 'w-full sm:w-auto disabled:opacity-60')}>
        {pending && <Loader2 size={18} className="animate-spin" />} Enviar solicitud
      </button>
      <p className="text-xs text-brand-muted">Usamos estos datos solo para evaluar tu cuenta y facturarte. Te respondemos en 24-48 h hábiles.</p>
    </form>
  )
}
