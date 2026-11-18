'use client'
import { ArrowRight } from 'lucide-react'
import Image, { getImageProps } from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getLenis } from '@/components/ui/SmoothScroll'
import { cn } from '@/lib/format'

/**
 * Portada de la home: foto a pantalla completa que rota entre deportes, con un solo bloque de texto
 * a la izquierda (etiqueta → título → descripción → botones) y pestañas de deporte abajo.
 * Cuando el cliente mande el video: guardarlo en /public/home/hero.mp4 y completar VIDEO.
 */
const VIDEO: string | null = null // '/home/hero.mp4'

type Slide = {
  label: string
  /** Categoría a la que lleva el botón principal */
  href: string
  alt: string
  /** Foto horizontal (compu) */
  src: string
  /** Foto vertical para el celular (recortada alrededor de la persona) */
  mobile: string
  /** Encuadre en compu: la persona hacia la derecha, sin texto encima */
  pos: string
}

const SLIDES: Slide[] = [
  { label: 'Pesca', href: '/king-fishing', alt: 'Pescador con campera Yaguá mostrando una trucha en el río', src: '/real/pesca-trucha.webp', mobile: '/real/pesca-trucha-m.webp', pos: 'md:object-[60%_40%]' },
  { label: 'Pádel', href: '/padel', alt: 'Jugador de pádel con ropa Yaguá, esperando la pelota en posición de defensa', src: '/real/padel-gugu.webp', mobile: '/real/padel-gugu.webp', pos: 'md:object-[50%_36%]' },
  { label: 'Hockey', href: '/hockey', alt: 'Jugadora de hockey llevando la bocha en una cancha de noche', src: '/real/hero-hockey.webp', mobile: '/real/hero-hockey-m.webp', pos: 'md:object-right' },
  { label: 'Trekking', href: '/trekking', alt: 'Persona haciendo trekking entre las piedras de un río de montaña', src: '/real/hero-trekking.webp', mobile: '/real/hero-trekking-m.webp', pos: 'md:object-right' },
  { label: 'Golf', href: '/golf', alt: 'Golfista terminando el swing en la cancha al atardecer', src: '/real/hero-golf.webp', mobile: '/real/hero-golf-m.webp', pos: 'md:object-right' },
]
const SLIDE_MS = 6000

/** Foto con dirección de arte: vertical en el celular, horizontal en compu (<picture>) */
function SlideImage({ s, first }: { s: Slide; first: boolean }) {
  const common = { alt: s.alt, fill: true, sizes: '100vw', quality: 80 } as const
  const {
    props: { srcSet: mobileSet },
  } = getImageProps({ ...common, src: s.mobile })
  const {
    props: { srcSet: desktopSet, ...rest },
  } = getImageProps({ ...common, src: s.src, priority: first, loading: first ? undefined : 'lazy' })
  return (
    <picture>
      <source media="(max-width: 767px)" srcSet={mobileSet} sizes="100vw" />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- el alt viene en rest (getImageProps) */}
      <img {...rest} srcSet={desktopSet} className={cn('object-cover object-center', s.pos)} />
    </picture>
  )
}

/** "Reducir movimiento" del sistema, leído directo y actualizado si cambia */
function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false)
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduce(m.matches)
    sync()
    m.addEventListener('change', sync)
    return () => m.removeEventListener('change', sync)
  }, [])
  return reduce
}

/** Con tocar apenas la rueda (o deslizar un poco el dedo) desde la portada, baja sola hasta "Elegí tu deporte" */
function useHeroAutoScroll(reduce: boolean | null) {
  useEffect(() => {
    if (reduce) return
    let busy = false
    let touchY = 0
    const inHero = () => window.scrollY < window.innerHeight * 0.6
    const go = () => {
      if (busy) return
      busy = true
      const el = document.getElementById('deportes')
      const y = el ? el.getBoundingClientRect().top + window.scrollY - 72 : window.innerHeight
      const lenis = getLenis()
      if (lenis) lenis.scrollTo(y, { duration: 1.3, lock: true, force: true, onComplete: () => { busy = false } })
      else {
        window.scrollTo({ top: y, behavior: 'smooth' })
        setTimeout(() => { busy = false }, 1200)
      }
    }
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 0 && inHero()) { e.preventDefault(); go() }
    }
    const onTouchStart = (e: TouchEvent) => { touchY = e.touches[0].clientY }
    const onTouchMove = (e: TouchEvent) => {
      if (touchY - e.touches[0].clientY > 12 && inHero()) { e.preventDefault(); go() }
    }
    const onKey = (e: KeyboardEvent) => {
      // Sobre botones, links o campos, las teclas hacen lo suyo (la barra espaciadora activa el botón)
      if ((e.target as HTMLElement).closest('input, textarea, select, button, a, [role="tab"]')) return
      if (['ArrowDown', 'PageDown', ' '].includes(e.key) && inHero()) { e.preventDefault(); go() }
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('keydown', onKey)
    }
  }, [reduce])
}

export function Hero() {
  const reduce = usePrefersReducedMotion()
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const autoplay = !VIDEO && !reduce
  const slide = SLIDES[i]
  const next = () => setI((n) => (n + 1) % SLIDES.length)

  useHeroAutoScroll(reduce)

  // Flechas izquierda/derecha entre pestañas (patrón de tabs accesible)
  const onTabKey = (e: React.KeyboardEvent, k: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const n = (k + (e.key === 'ArrowRight' ? 1 : -1) + SLIDES.length) % SLIDES.length
    setI(n)
    document.getElementById(`hero-tab-${n}`)?.focus()
  }

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Deportes destacados"
      className="relative h-svh min-h-[600px] overflow-hidden bg-brand-primary text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Fondo: video o fotos apiladas con crossfade de 600ms */}
      <div className="absolute inset-0">
        {VIDEO ? (
          <video src={VIDEO} autoPlay muted loop playsInline className="h-full w-full object-cover" />
        ) : (
          SLIDES.map((s, k) => (
            <div
              key={s.src}
              aria-hidden={k !== i}
              className={cn('absolute inset-0 transition-opacity ease-in-out motion-reduce:transition-none', k === i ? 'opacity-100' : 'opacity-0')}
              style={{ transitionDuration: '600ms' }}
            >
              <SlideImage s={s} first={k === 0} />
            </div>
          ))
        )}
        {/* Degradé: oscuro a la izquierda (texto) y transparente desde el 60% (persona a la derecha) */}
        <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0.45)_35%,rgba(0,0,0,0)_60%)] md:block" />
        {/* Arriba, para la navbar; abajo, para las pestañas. En el celular el de abajo es más fuerte */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black/90 via-black/50 to-transparent md:h-1/3 md:from-black/60 md:via-black/20" />
      </div>

      {/* Bloque de texto: abajo en el celular, centrado verticalmente en compu */}
      <div className="relative mx-auto flex h-full w-full max-w-[1440px] flex-col justify-end px-4 pb-28 pt-24 sm:px-6 md:justify-center md:pb-24 lg:px-10">
        <div className="max-w-[560px]">
          {/* Ojos de la marca con su parpadeo */}
          <Image src="/brand/yagua-eyes.svg" alt="" width={140} height={40} priority className="h-12 w-auto origin-center animate-blink motion-reduce:animate-none lg:h-16" />
          <h1 className="mt-5 font-display text-[clamp(3rem,7vw,6rem)] font-extrabold leading-none tracking-tight">
            Mirada de <span className="text-brand-secondary">yaguá.</span>
          </h1>
          <p className="mt-5 text-[17px] leading-relaxed text-white/85 md:text-lg">
            Ropa y equipamiento para entrenar, jugar y salir al río. Hecho en Concepción del Uruguay, con la garra del litoral.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`${slide.href}?orden=novedades`}
              className="group inline-flex w-full items-center justify-center gap-2 bg-brand-secondary px-6 py-3.5 font-display text-base font-bold uppercase tracking-wide text-brand-ink transition hover:brightness-110 sm:w-auto"
            >
              Ver novedades
              <ArrowRight size={20} aria-hidden className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              href="#deportes"
              className="inline-flex w-full items-center justify-center border-2 border-white px-6 py-3 font-display text-base font-bold uppercase tracking-wide text-white transition hover:bg-white hover:text-brand-ink sm:w-auto"
            >
              Elegí tu deporte
            </Link>
          </div>
        </div>
      </div>

      {/* Pestañas de deporte, con barra de progreso del slide */}
      {!VIDEO && (
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-[1440px] px-4 pb-6 sm:px-6 lg:px-10 lg:pb-8">
            <div role="tablist" aria-label="Elegí el deporte de la portada" className="grid grid-cols-5 gap-1.5 sm:flex sm:gap-4">
              {SLIDES.map((s, k) => {
                const active = k === i
                return (
                  <button
                    key={s.label}
                    id={`hero-tab-${k}`}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    tabIndex={active ? 0 : -1}
                    onClick={() => setI(k)}
                    onKeyDown={(e) => onTabKey(e, k)}
                    className={cn(
                      'min-w-0 pt-2 text-left font-display text-[10px] font-extrabold uppercase tracking-[0.08em] transition-colors sm:shrink-0 sm:px-1 sm:text-sm sm:tracking-[0.2em]',
                      active ? 'text-white' : 'text-white/50 hover:text-white/80',
                    )}
                  >
                    {s.label}
                    <span className="mt-2 block h-[3px] w-full overflow-hidden bg-white/20 sm:min-w-28">
                      {active && (
                        <span
                          key={`${i}-${autoplay}`}
                          className="block h-full origin-left bg-brand-secondary [backface-visibility:hidden] [will-change:transform]"
                          style={
                            autoplay
                              ? { animation: `hero-progress ${SLIDE_MS}ms linear forwards`, animationPlayState: paused ? 'paused' : 'running' }
                              : undefined
                          }
                          onAnimationEnd={autoplay ? next : undefined}
                        />
                      )}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
