import type { ReactNode } from 'react'
import { cn } from '@/lib/format'

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10', className)}>{children}</div>
}

/** Título de sección estilo deportivo: mayúsculas, condensado, bold */
export function SectionTitle({ children, className, light }: { children: ReactNode; className?: string; light?: boolean }) {
  return (
    <h2
      className={cn(
        'font-display text-3xl font-extrabold uppercase italic leading-none tracking-tight sm:text-4xl lg:text-5xl',
        light ? 'text-white' : 'text-brand-ink',
        className,
      )}
    >
      {children}
    </h2>
  )
}

/** Botón-link principal: negro con flecha, estilo deportivo */
export const buttonClass = {
  primary:
    'group inline-flex items-center justify-center gap-3 bg-brand-primary px-6 py-3.5 font-display text-lg font-bold uppercase tracking-wide text-white transition hover:bg-brand-primary/85',
  light:
    'group inline-flex items-center justify-center gap-3 bg-white px-6 py-3.5 font-display text-lg font-bold uppercase tracking-wide text-brand-ink transition hover:bg-brand-secondary',
  outline:
    'group inline-flex items-center justify-center gap-3 border-2 border-brand-ink px-6 py-3 font-display text-lg font-bold uppercase tracking-wide text-brand-ink transition hover:bg-brand-ink hover:text-white',
}
