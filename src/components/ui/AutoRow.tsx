'use client'
import { Children, useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/format'

/**
 * En el celular: fila que se desliza con el dedo y avanza sola, de a una tarjeta.
 * Desde `sm` en adelante: la grilla de siempre (`gridClass`, con prefijos sm:/lg:).
 * Sólo avanza si la fila se puede deslizar (o sea, en el celular), si está a la vista,
 * y se frena un rato cuando la persona la toca. Respeta "reducir movimiento".
 */
export function AutoRow({
  children,
  label,
  gridClass,
  itemClass,
  interval = 3500,
}: {
  children: ReactNode
  label: string
  /** Grilla en pantallas grandes, ej. 'sm:grid-cols-2 lg:grid-cols-4 sm:gap-3' */
  gridClass: string
  /** Ancho de cada tarjeta en el celular, ej. 'w-[68%]' */
  itemClass: string
  interval?: number
}) {
  const track = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = track.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let visible = false
    let pausedUntil = 0
    const pause = () => { pausedUntil = Date.now() + 7000 }
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }, { threshold: 0.4 })
    io.observe(el)
    el.addEventListener('pointerdown', pause)
    el.addEventListener('touchstart', pause, { passive: true })
    el.addEventListener('wheel', pause, { passive: true })

    const id = window.setInterval(() => {
      if (!visible || Date.now() < pausedUntil || el.scrollWidth <= el.clientWidth + 4) return
      const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
      const next = (Array.from(el.children) as HTMLElement[]).find((it) => it.offsetLeft - pad > el.scrollLeft + 4)
      el.scrollTo({ left: atEnd || !next ? 0 : next.offsetLeft - pad, behavior: 'smooth' })
    }, interval)

    return () => {
      window.clearInterval(id)
      io.disconnect()
      el.removeEventListener('pointerdown', pause)
      el.removeEventListener('touchstart', pause)
      el.removeEventListener('wheel', pause)
    }
  }, [interval])

  return (
    <div
      ref={track}
      role="region"
      aria-roledescription="carrusel"
      aria-label={label}
      className={cn(
        // celular: fila deslizable de borde a borde
        'scrollbar-none relative -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4',
        // sm+: grilla normal
        'sm:mx-0 sm:grid sm:snap-none sm:overflow-visible sm:px-0',
        gridClass,
      )}
    >
      {Children.map(children, (child) => (
        <div className={cn('shrink-0 snap-start sm:w-auto', itemClass)}>{child}</div>
      ))}
    </div>
  )
}
