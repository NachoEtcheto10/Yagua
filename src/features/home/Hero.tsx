'use client'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { buttonClass } from '@/components/ui/Container'
import { getLenis } from '@/components/ui/SmoothScroll'

/**
 * Portada a pantalla completa, oscura, con el título grande en blanco y una frase chica abajo.
 * Mientras no esté el video, pasan fotos reales de la marca con un zoom lento (como si fuera un video).
 * Cuando el cliente mande el video: guardarlo en /public/home/hero.mp4 y completar VIDEO.
 */
const VIDEO: string | null = null // '/home/hero.mp4'
// Fotos reales de la marca. pos: qué parte de la foto queda a la vista en pantallas anchas
const SLIDES = [
  { src: '/real/padel-gugu.webp', label: 'Pádel', pos: 'object-[50%_36%]' },
  { src: '/real/pesca-trucha.webp', label: 'Pesca', pos: 'object-[55%_45%]' },
  { src: '/real/comunidad.webp', label: 'Comunidad', pos: 'object-[50%_18%]' },
]
const SLIDE_MS = 5500

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '30%'])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0])

  useEffect(() => {
    if (VIDEO || reduce) return
    // Un temporizador por foto: si la persona toca una rayita, esa foto dura su tiempo completo
    const t = setTimeout(() => setI((n) => (n + 1) % SLIDES.length), SLIDE_MS)
    return () => clearTimeout(t)
  }, [i, reduce])

  // Con tocar apenas la rueda (o deslizar un poco el dedo) desde la portada, baja sola hasta "Elegí tu deporte"
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
      const t = e.target as HTMLElement
      if (t.closest('input, textarea, select')) return
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

  const appear = (delay: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } }

  return (
    <section ref={ref} className="relative flex h-svh min-h-[560px] flex-col overflow-hidden bg-brand-primary text-white">
      {/* Fondo: video o fotos que se van pasando */}
      <div className="absolute inset-0">
        {VIDEO ? (
          <video src={VIDEO} autoPlay muted loop playsInline className="h-full w-full object-cover" />
        ) : (
          <AnimatePresence initial={false}>
            <motion.div
              key={SLIDES[i].src}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
            >
              <motion.div
                className="absolute inset-0"
                initial={{ scale: reduce ? 1 : 1.14 }}
                animate={{ scale: 1 }}
                transition={{ duration: (SLIDE_MS + 1400) / 1000, ease: 'linear' }}
              >
                <Image src={SLIDES[i].src} alt="" fill priority={i === 0} sizes="100vw" className={`object-cover ${SLIDES[i].pos}`} />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}
        {/* Oscurecido para que el texto se lea siempre */}
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      </div>

      {/* Contenido */}
      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="relative mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-4 sm:px-6 lg:px-10">
        {/* Ojos de la marca arriba (la barra de menú aparece recién al deslizar), sin fondo */}
        <motion.div {...appear(0.05)} className="pt-12 lg:pt-16">
          <Link href="/" aria-label="Yaguá, inicio" className="inline-block">
            <Image src="/brand/yagua-eyes.svg" alt="Yaguá" width={140} height={40} priority className="h-10 w-auto origin-center animate-blink lg:h-12" />
          </Link>
        </motion.div>
        <div className="flex flex-1 items-center">
          <h1 className="font-display text-[3.4rem] font-extrabold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl xl:text-[8.5rem]">
            {[['Mirada', ''], ['de', ''], ['yaguá.', 'text-brand-secondary']].map(([w, c], k) => (
              <span key={w} className={`${k === 0 ? 'block w-fit' : 'inline-block'} mr-[0.22em] overflow-hidden pb-[0.08em] align-bottom`}>
                <motion.span
                  className={`inline-block ${c}`}
                  initial={reduce ? false : { y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.15 + k * 0.14, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                >
                  {w}
                </motion.span>
              </span>
            ))}
          </h1>
        </div>

        {/* Pie de la portada: frase chica a la izquierda, botones a la derecha */}
        <div className="flex flex-col gap-6 pb-16 sm:flex-row sm:items-end sm:justify-between xl:pb-12">
          <motion.div {...appear(0.55)} className="max-w-sm">
            <p className="font-display text-sm font-bold uppercase leading-snug tracking-wide text-white/90">
              Ropa y equipamiento para entrenar, jugar y salir al río. Hecho en Concepción del Uruguay, con la garra del litoral.
            </p>
            {/* Indicador de fotos */}
            {!VIDEO && (
              <div className="mt-5 flex items-center gap-3">
                {SLIDES.map((s, k) => (
                  <button key={s.src} type="button" onClick={() => setI(k)} aria-label={`Ver foto de ${s.label}`} className="group py-2">
                    <span className="relative block h-0.5 w-10 overflow-hidden bg-white/30">
                      {k === i && (
                        <motion.span
                          key={`bar-${i}`}
                          className="absolute inset-0 origin-left bg-brand-secondary"
                          initial={{ scaleX: reduce ? 1 : 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: SLIDE_MS / 1000, ease: 'linear' }}
                        />
                      )}
                    </span>
                  </button>
                ))}
                <span className="ml-1 font-display text-xs font-bold uppercase tracking-[0.2em] text-white/70">{SLIDES[i].label}</span>
              </div>
            )}
          </motion.div>
          <motion.div {...appear(0.7)} className="flex flex-wrap items-center gap-3">
            <Link href="/buscar?orden=novedades" className={buttonClass.lime}>
              Ver novedades <ArrowRight size={20} className="transition group-hover:translate-x-1" />
            </Link>
            <Link href="#deportes" className="inline-flex items-center gap-3 border-2 border-white/80 px-6 py-3 font-display text-lg font-bold uppercase tracking-wide transition hover:border-brand-accent hover:bg-brand-accent">
              Elegí tu deporte <ArrowDown size={18} />
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Indicador para deslizar: un "mouse" con un punto que baja. Lleva a Elegí tu deporte */}
      <motion.a
        href="#deportes"
        aria-label="Deslizá para ver más"
        style={{ opacity: contentOpacity }}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-white/80 transition hover:text-white xl:bottom-10"
      >
        <span className="relative h-9 w-[22px] rounded-full border-2 border-current">
          <motion.span
            className="absolute left-1/2 top-1.5 h-2 w-1 -translate-x-1/2 rounded-full bg-brand-secondary"
            animate={reduce ? undefined : { y: [0, 12, 12], opacity: [1, 0, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', times: [0, 0.7, 1] }}
          />
        </span>
        <span className="hidden font-display text-[11px] font-bold uppercase tracking-[0.3em] xl:block">Deslizá</span>
      </motion.a>
    </section>
  )
}
