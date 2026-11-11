import type { ReactNode } from 'react'
import { cn } from '@/lib/format'

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10', className)}>{children}</div>
}

/** Sello de marca: los dos ojos del yaguareté (lima y rosa) como dos barras inclinadas */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn('inline-flex shrink-0 gap-[0.12em]', className)}>
      <span className="h-[0.62em] w-[0.26em] -skew-x-[18deg] bg-brand-secondary" />
      <span className="h-[0.62em] w-[0.26em] -skew-x-[18deg] bg-brand-accent" />
    </span>
  )
}

/** Título de sección: mayúsculas, condensado, con el sello de los ojos */
export function SectionTitle({ children, className, light, mark = true }: { children: ReactNode; className?: string; light?: boolean; mark?: boolean }) {
  return (
    <h2
      className={cn(
        'flex items-baseline gap-[0.3em] font-display text-3xl font-extrabold uppercase italic leading-none tracking-tight text-balance sm:text-4xl lg:text-5xl',
        light ? 'text-white' : 'text-brand-ink',
        className,
      )}
    >
      {mark && <BrandMark />}
      <span>{children}</span>
    </h2>
  )
}

/** Textura de manchas de yaguareté para fondos (va dentro de un contenedor relative) */
export function Rosettes({ tone = 'dark', className }: { tone?: 'dark' | 'light'; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0', tone === 'dark' ? 'bg-rosettes-dark opacity-[0.06]' : 'bg-rosettes-light opacity-[0.045]', className)}
    />
  )
}

/** Botón-link principal: negro con flecha; al pasar el mouse toma el rosa del ojo derecho */
export const buttonClass = {
  primary:
    'group inline-flex items-center justify-center gap-3 bg-brand-primary px-6 py-3.5 font-display text-lg font-bold uppercase tracking-wide text-white transition hover:bg-brand-accent',
  light:
    'group inline-flex items-center justify-center gap-3 bg-white px-6 py-3.5 font-display text-lg font-bold uppercase tracking-wide text-brand-ink transition hover:bg-brand-secondary',
  lime:
    'group inline-flex items-center justify-center gap-3 bg-brand-secondary px-6 py-3.5 font-display text-lg font-bold uppercase tracking-wide text-brand-ink transition hover:bg-white',
  outline:
    'group inline-flex items-center justify-center gap-3 border-2 border-brand-ink px-6 py-3 font-display text-lg font-bold uppercase tracking-wide text-brand-ink transition hover:bg-brand-ink hover:text-white',
}
