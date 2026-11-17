'use client'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, MapPin } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { buttonClass, Container, Rosettes } from '@/components/ui/Container'

/**
 * Portada de marca: ojos del yaguareté, título grande y franja lima/rosa, sobre fondo claro.
 * TODO: cuando el cliente mande el video, va de fondo en esta misma caja (<video autoPlay muted loop playsInline>).
 */
export function Hero() {
  const reduce = useReducedMotion()
  const appear = (delay: number, dist = 24) =>
    reduce ? {} : { initial: { opacity: 0, y: dist }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } }

  return (
    <section className="relative overflow-hidden bg-brand-mist">
      <Rosettes tone="light" className="opacity-[0.06]" />
      <Container className="relative py-16 sm:py-20 lg:py-28">
        <motion.div {...appear(0.05, 12)}>
          <Image src="/brand/yagua-eyes.svg" alt="" width={140} height={40} className="h-10 w-auto origin-center animate-blink lg:h-14" priority />
        </motion.div>
        <motion.p {...appear(0.12)} className="mt-6 flex items-center gap-2 font-display text-sm font-extrabold uppercase tracking-[0.2em] text-brand-muted">
          <MapPin size={16} /> Desde Concepción del Uruguay
        </motion.p>
        {/* El título entra palabra por palabra, como una persiana */}
        <h1 className="mt-3 font-display text-[3.1rem] font-black uppercase leading-[0.95] text-brand-ink sm:text-7xl lg:text-8xl xl:text-[7.5rem]">
          {[['Mirada', ''], ['de', ''], ['yaguá', 'text-brand-accent']].map(([w, c], i) => (
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
        <motion.p {...appear(0.35)} className="mt-6 max-w-xl text-lg font-medium text-brand-ink/75">
          Ropa y equipamiento para entrenar, jugar y salir al río. Hecho para la gente del litoral, con la garra de nuestra tierra.
        </motion.p>
        <motion.div {...appear(0.48)} className="mt-8 flex flex-wrap gap-3">
          <Link href="/buscar?orden=novedades" className={buttonClass.primary}>
            Ver novedades <ArrowRight size={20} className="transition group-hover:translate-x-1" />
          </Link>
          <Link href="/padel" className="group inline-flex items-center gap-3 border-2 border-brand-ink px-6 py-3 font-display text-lg font-bold uppercase tracking-wide text-brand-ink transition hover:bg-brand-secondary">
            Comprar pádel
          </Link>
        </motion.div>
      </Container>
      {/* franja lima/rosa abajo */}
      <div aria-hidden className="flex h-1.5">
        <span className="flex-1 bg-brand-secondary" />
        <span className="flex-1 bg-brand-accent" />
      </div>
    </section>
  )
}
