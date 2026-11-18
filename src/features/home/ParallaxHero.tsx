'use client'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { buttonClass } from '@/components/ui/Container'
import { ParallaxScene } from '@/components/ui/parallax-scrolling'
import { useHeroAutoScroll } from './Hero'

/**
 * Portada con parallax: cielo, montaña, la palabra YAGUÁ y una persona adelante que tapa las letras.
 * Las capas son las del ejemplo de Osmo (foto de muestra). Para la versión final hacen falta
 * capas propias: una foto de la marca separada en fondo, medio y primer plano (PNG/WebP con transparencia).
 */
export function ParallaxHero() {
  const reduce = useReducedMotion()
  useHeroAutoScroll(reduce, 1.8)
  // La frase y los botones se desvanecen apenas empieza el scroll, para no pisarse con las letras
  const { scrollY } = useScroll()
  const ctaOpacity = useTransform(scrollY, [0, 220], [1, reduce ? 1 : 0])

  const appear = (delay: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.9, ease: [0.22, 1, 0.36, 1] as const } }

  return (
    <ParallaxScene
      className="bg-brand-primary text-white"
      fadeTo="from-transparent to-white"
      layers={[
        { kind: 'image', src: '/parallax/cielo.webp', yPercent: 70, priority: true },
        { kind: 'image', src: '/parallax/montana.webp', yPercent: 55, priority: true },
        {
          kind: 'content',
          yPercent: 40,
          className: 'flex flex-col items-center justify-center',
          content: (
            <>
              <motion.div {...appear(0.1)}>
                <Image src="/brand/yagua-eyes.svg" alt="" width={140} height={40} priority className="h-10 w-auto animate-blink sm:h-14" />
              </motion.div>
              <motion.h1
                initial={reduce ? false : { opacity: 0, y: 40, letterSpacing: '0.2em' }}
                animate={{ opacity: 1, y: 0, letterSpacing: '-0.02em' }}
                transition={{ delay: 0.2, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="mt-2 font-display text-[24vw] font-black uppercase leading-[0.9] sm:text-[20vw]"
              >
                Yaguá
              </motion.h1>
            </>
          ),
        },
        { kind: 'image', src: '/parallax/frente.webp', yPercent: 10, priority: true },
      ]}
    >
      {/* Frase y botones abajo, por encima de todas las capas */}
      <motion.div style={{ opacity: ctaOpacity }} className="mx-auto flex h-svh w-full max-w-[1440px] flex-col justify-end px-4 pb-[14svh] sm:px-6 lg:px-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <motion.p {...appear(0.6)} className="max-w-sm font-display text-sm font-bold uppercase leading-snug tracking-wide text-white/90">
            Ropa y equipamiento para entrenar, jugar y salir al río. Hecho en Concepción del Uruguay, con la garra del litoral.
          </motion.p>
          <motion.div {...appear(0.75)} className="flex flex-wrap items-center gap-3">
            <Link href="/buscar?orden=novedades" className={buttonClass.lime}>
              Ver novedades <ArrowRight size={20} className="transition group-hover:translate-x-1" />
            </Link>
            <Link href="#deportes" className="inline-flex items-center gap-3 border-2 border-white/80 px-6 py-3 font-display text-lg font-bold uppercase tracking-wide transition hover:border-brand-accent hover:bg-brand-accent">
              Elegí tu deporte <ArrowDown size={18} />
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </ParallaxScene>
  )
}
