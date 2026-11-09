'use client'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/format'

/**
 * Carrusel horizontal: swipe nativo en celular (scroll-snap) y flechas en escritorio.
 * `itemClass` define el ancho de cada elemento por breakpoint.
 */
export function Carousel({
  children,
  itemClass = 'w-[72%] sm:w-[42%] lg:w-[23.5%]',
  label,
  dark,
}: {
  children: ReactNode
  itemClass?: string
  label: string
  dark?: boolean
}) {
  const track = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const update = useCallback(() => {
    const el = track.current
    if (!el) return
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [update])

  const step = (dir: 1 | -1) => {
    const el = track.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' })
  }

  const arrow = cn(
    'grid h-11 w-11 place-items-center border transition disabled:pointer-events-none disabled:opacity-30',
    dark ? 'border-white/40 text-white hover:bg-white hover:text-brand-ink' : 'border-brand-ink text-brand-ink hover:bg-brand-ink hover:text-white',
  )

  return (
    <div className="relative" role="region" aria-roledescription="carrusel" aria-label={label}>
      <div className="absolute -top-16 right-0 hidden gap-2 md:flex">
        <button type="button" className={arrow} onClick={() => step(-1)} disabled={!canPrev} aria-label="Anteriores">
          <ArrowLeft size={20} />
        </button>
        <button type="button" className={arrow} onClick={() => step(1)} disabled={!canNext} aria-label="Siguientes">
          <ArrowRight size={20} />
        </button>
      </div>
      <div
        ref={track}
        onScroll={update}
        className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:gap-4 lg:px-0"
      >
        {Children.map(children, (child) => (
          <div className={cn('shrink-0 snap-start', itemClass)}>{child}</div>
        ))}
      </div>
    </div>
  )
}
