import type { ReactNode } from 'react'

/** Cinta infinita (logos de sponsors / asociaciones). Se detiene al pasar el mouse. */
export function Marquee({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="group relative overflow-hidden" aria-label={label}>
      <div className="flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused]">
        <div className="flex gap-4">{children}</div>
        <div className="flex gap-4" aria-hidden>{children}</div>
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white" />
    </div>
  )
}
