'use client'
import Link from 'next/link'
import { useActionState } from 'react'
import { buttonClass } from '@/components/ui/Container'
import { cn } from '@/lib/format'
import { googleLoginAction, loginAction, registerAction } from './actions'

const input = 'mt-1 h-12 w-full border border-brand-line px-3 text-[16px] outline-none focus:border-brand-ink sm:text-sm'

function GoogleButton({ redirectTo }: { redirectTo: string }) {
  return (
    <form action={googleLoginAction}>
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <button type="submit" className="flex h-12 w-full items-center justify-center gap-3 border-2 border-brand-ink font-semibold hover:bg-brand-mist">
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.3-.4-3.5z"/></svg>
        Continuar con Google
      </button>
    </form>
  )
}

export function LoginForm({ redirectTo, google }: { redirectTo: string; google: boolean }) {
  const [state, action, pending] = useActionState(loginAction, undefined)
  return (
    <div className="space-y-6">
      {google && <><GoogleButton redirectTo={redirectTo} /><p className="text-center text-xs uppercase tracking-widest text-brand-muted">o con tu e-mail</p></>}
      <form action={action} className="space-y-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <label className="block text-sm font-semibold">E-mail<input name="email" type="email" autoComplete="email" required className={input} /></label>
        <label className="block text-sm font-semibold">Contraseña<input name="password" type="password" autoComplete="current-password" required className={input} /></label>
        {state?.error && <p role="alert" className="text-sm font-semibold text-brand-accent">{state.error}</p>}
        <button type="submit" disabled={pending} className={cn(buttonClass.primary, 'w-full disabled:opacity-60')}>{pending ? 'Ingresando…' : 'Ingresar'}</button>
        {/* TODO Fase 3: recuperar contraseña por e-mail */}
        <p className="text-center text-sm text-brand-muted">¿Olvidaste tu contraseña? Escribinos y te ayudamos.</p>
      </form>
      <p className="text-center text-sm">¿No tenés cuenta? <Link href={`/registro?volver=${encodeURIComponent(redirectTo)}`} className="font-semibold underline">Registrate</Link></p>
    </div>
  )
}

export function RegisterForm({ redirectTo, google }: { redirectTo: string; google: boolean }) {
  const [state, action, pending] = useActionState(registerAction, undefined)
  const err = state?.fieldErrors ?? {}
  return (
    <div className="space-y-6">
      {google && <><GoogleButton redirectTo={redirectTo} /><p className="text-center text-xs uppercase tracking-widest text-brand-muted">o con tu e-mail</p></>}
      <form action={action} className="space-y-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <label className="block text-sm font-semibold">Nombre y apellido<input name="name" autoComplete="name" required className={input} />{err.name && <span className="text-xs text-brand-accent">{err.name}</span>}</label>
        <label className="block text-sm font-semibold">E-mail<input name="email" type="email" autoComplete="email" required className={input} />{err.email && <span className="text-xs text-brand-accent">{err.email}</span>}</label>
        <label className="block text-sm font-semibold">Contraseña<input name="password" type="password" autoComplete="new-password" minLength={8} required className={input} />{err.password && <span className="text-xs text-brand-accent">{err.password}</span>}</label>
        {state?.error && <p role="alert" className="text-sm font-semibold text-brand-accent">{state.error}</p>}
        <button type="submit" disabled={pending} className={cn(buttonClass.primary, 'w-full disabled:opacity-60')}>{pending ? 'Creando cuenta…' : 'Crear cuenta'}</button>
      </form>
      <p className="text-center text-sm">¿Ya tenés cuenta? <Link href={`/ingresar?volver=${encodeURIComponent(redirectTo)}`} className="font-semibold underline">Ingresá</Link></p>
    </div>
  )
}
