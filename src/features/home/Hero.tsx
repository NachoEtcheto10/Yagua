'use client'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, MapPin } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import { buttonClass, Rosettes } from '@/components/ui/Container'

/**
 * Portada dividida: a la izquierda la marca (ojos del yaguareté, manchas, lima y rosa) y a la derecha
 * una foto real de la comunidad. Así no se tapa a nadie con el texto.
 * TODO: cambiar por video cuando el cliente lo mande (misma caja, <video autoPlay muted loop playsInline>).
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '12%'])

  const appear = (delay: number, dist = 24) =>
    reduce ? {} : { initial: { opacity: 0, y: dist }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } }

  return (
    <section ref={ref} className="grid bg-brand-turquoise lg:h-[min(calc(100svh-100px),720px)] lg:min-h-[560px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.55fr)]">
      {/* Foto (arriba en el celular, a la derecha en la compu) */}
      <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/10] lg:order-2 lg:aspect-auto">
        <motion.div style={{ y }} className="absolute inset-0 -bottom-[12%]">
          <Image
            src="/home/hero-club.webp"
            alt="Jugadoras y jugadores de pádel con ropa Yaguá, en el bar del club"
            fill
            priority
            sizes="(min-width: 1024px) 61vw, 100vw"
            className="object-cover object-[45%_55%]"
          />
        </motion.div>
        {/* franja lima/rosa en el borde que toca el panel */}
        <div aria-hidden className="absolute inset-x-0 bottom-0 flex h-1.5 lg:inset-y-0 lg:left-0 lg:right-auto lg:h-auto lg:w-1.5 lg:flex-col">
          <span className="flex-1 bg-brand-secondary" />
          <span className="flex-1 bg-brand-accent" />
        </div>
      </div>

      {/* Panel de marca */}
      <div className="relative flex flex-col justify-center overflow-hidden bg-brand-turquoise px-4 py-12 sm:px-6 lg:order-1 lg:px-12 lg:py-16 xl:px-16">
        <Rosettes tone="light" className="opacity-[0.07]" />
        <div className="relative">
          <motion.div {...appear(0.05, 12)}>
            {/* Ojos con su contorno negro original (no la versión blanca) */}
            <Image src="/brand/yagua-eyes.svg" alt="" width={140} height={40} className="h-10 w-auto origin-center animate-blink lg:h-12" priority />
          </motion.div>
          <motion.p {...appear(0.12)} className="mt-6 flex items-center gap-2 font-display text-sm font-extrabold uppercase tracking-[0.2em] text-brand-ink">
            <MapPin size={16} /> Desde Concepción del Uruguay
          </motion.p>
          {/* El título entra palabra por palabra, como una persiana */}
          <h1 className="mt-3 font-display text-[3.1rem] font-black uppercase leading-[0.95] text-brand-ink sm:text-7xl lg:text-6xl xl:text-[5.4rem]">
            {[['Mirada', ''], ['de', ''], ['yaguá', 'text-white']].map(([w, c], i) => (
              <span key={w} className="mr-[0.2em] inline-block overflow-hidden pb-[0.06em] align-bottom">
                <motion.span
                  className={`inline-block ${c}`}
                  initial={reduce ? false : { y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.15 + i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  {w}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p {...appear(0.35)} className="mt-6 max-w-md text-lg font-medium text-brand-ink/80">
            Ropa y equipamiento para entrenar, jugar y salir al río. Hecho para la gente del litoral, con la garra de nuestra tierra.
          </motion.p>
          <motion.div {...appear(0.48)} className="mt-8 flex flex-wrap gap-3">
            <Link href="/buscar?orden=novedades" className={buttonClass.primary}>
              Ver novedades <ArrowRight size={20} className="transition group-hover:translate-x-1" />
            </Link>
            <Link href="/padel" className="group inline-flex items-center gap-3 border-2 border-brand-ink px-6 py-3 font-display text-lg font-bold uppercase tracking-wide text-brand-ink transition hover:bg-white">
              Comprar pádel
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
