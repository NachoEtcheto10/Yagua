'use client'
import { ArrowRight, Check } from 'lucide-react'
import { useActionState } from 'react'
import { subscribeNewsletter } from './newsletter-action'

export function Newsletter() {
  const [state, action, pending] = useActionState(subscribeNewsletter, undefined)
  return (
    <section className="bg-brand-secondary">
      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-12 sm:px-6 md:grid-cols-2 md:items-center lg:px-10 lg:py-16">
        <div>
          <h2 className="font-display text-4xl font-extrabold uppercase italic leading-none sm:text-5xl">Sumate a la manada</h2>
          <p className="mt-3 max-w-md text-brand-ink/80">Lanzamientos, ofertas exclusivas y 10% OFF en tu primera compra.</p>
        </div>
        {state?.ok ? (
          <p className="flex items-center gap-3 font-display text-2xl font-bold uppercase">
            <Check size={28} /> ¡Listo! Revisá tu correo
          </p>
        ) : (
          <form action={action} className="w-full">
            <div className="flex border-b-2 border-brand-ink">
              <label htmlFor="nl-email" className="sr-only">Tu e-mail</label>
              <input
                id="nl-email"
                name="email"
                type="email"
                required
                placeholder="Tu e-mail"
                className="h-14 min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-brand-ink/60"
              />
              <button type="submit" disabled={pending} className="flex items-center gap-2 font-display text-lg font-bold uppercase disabled:opacity-50">
                Suscribirme <ArrowRight size={20} />
              </button>
            </div>
            {state?.error && <p className="mt-2 text-sm font-semibold text-brand-accent">{state.error}</p>}
          </form>
        )}
      </div>
    </section>
  )
}
