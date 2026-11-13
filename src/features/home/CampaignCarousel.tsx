'use client'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { buttonClass } from '@/components/ui/Container'
import { cn } from '@/lib/format'

export type CampaignSlide = { id: string; title: string; subtitle: string | null; image: string; ctaLabel: string | null; ctaHref: string | null }

const INTERVAL = 6000

/**
 * Banners de campañas y eventos (Cyber Monday, colaboraciones, temporadas...).
 * Con una sola campaña queda fija; con varias pasan solas cada 6 s (se pausa al pasar el mouse o tocar).
 * Los banners traen el texto en la imagen; el título va como texto alternativo.
 */
export function CampaignCarousel({ slides }: { slides: CampaignSlide[] }) {
  const [i, setI] = useState(0)
  const [dir, setDir] = useState(1)
  const [paused, setPaused] = useState(false)
  const reduce = useReducedMotion()
  const touchX = useRef<number | null>(null)
  const many = slides.length > 1

  const go = useCallback((step: number) => {
    setDir(step)
    setI((n) => (n + step + slides.length) % slides.length)
  }, [slides.length])

  useEffect(() => {
    if (!many || paused || reduce) return
    const t = setTimeout(() => go(1), INTERVAL)
    return () => clearTimeout(t)
  }, [i, many, paused, reduce, go])

  if (slides.length === 0) return null
  const s = slides[i]

  return (
    <div
      className="relative overflow-hidden bg-brand-mist"
      role={many ? 'region' : undefined}
      aria-roledescription={many ? 'carrusel' : undefined}
      aria-label="Campañas"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; setPaused(true) }}
      onTouchEnd={(e) => {
        if (touchX.current == null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        touchX.current = null
        if (many && Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
      }}
    >
      {/* Proporción fija (la de los banners de la tienda) para que la página no salte al cambiar de banner */}
      <div className="relative aspect-[1580/600]">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={s.id}
            custom={dir}
            initial={reduce ? { opacity: 0 } : { x: `${dir * 100}%` }}
            animate={reduce ? { opacity: 1 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: `${dir * -100}%` }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Link href={s.ctaHref ?? '/ofertas'} className="group block h-full w-full overflow-hidden">
              {/* Fondo: la misma imagen difuminada, para banners de otra proporción (fotos cuadradas, etc.) */}
              <Image src={s.image} alt="" aria-hidden fill sizes="40vw" className="scale-110 object-cover opacity-70 blur-2xl" />
              {/* El banner siempre entero: traen el texto en la imagen y no se puede recortar */}
              <Image
                src={s.image}
                alt={`${s.title}${s.subtitle ? `. ${s.subtitle}` : ''}`}
                fill
                sizes="(min-width: 1440px) 1360px, 100vw"
                priority={i === 0}
                className="object-contain transition duration-700 group-hover:scale-[1.02]"
              />
              {/* En el celular no va el botón (tapa el banner): se toca el banner entero */}
              <span className="absolute bottom-4 right-4 hidden sm:block">
                <span className={buttonClass.primary}>
                  {s.ctaLabel ?? 'Ver más'} <ArrowRight size={20} className="transition group-hover:translate-x-1" />
                </span>
              </span>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {many && (
        <>
          <button type="button" onClick={() => go(-1)} aria-label="Campaña anterior" className="absolute left-3 top-1/2 hidden h-10 w-10 sm:grid -translate-y-1/2 place-items-center bg-white/90 text-brand-ink shadow transition hover:bg-brand-secondary">
            <ChevronLeft size={22} />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Campaña siguiente" className="absolute right-3 top-1/2 hidden h-10 w-10 sm:grid -translate-y-1/2 place-items-center bg-white/90 text-brand-ink shadow transition hover:bg-brand-secondary">
            <ChevronRight size={22} />
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-2 sm:bottom-3">
            {slides.map((x, n) => (
              <button
                key={x.id}
                type="button"
                onClick={() => { setDir(n > i ? 1 : -1); setI(n) }}
                aria-label={`Ver ${x.title}`}
                aria-current={n === i}
                className={cn('h-2 rounded-full transition-all', n === i ? 'w-7 bg-brand-accent' : 'w-2 bg-white/80 hover:bg-white')}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
