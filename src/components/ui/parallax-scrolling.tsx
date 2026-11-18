'use client'
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import Image from 'next/image'
import { useRef, type ReactNode } from 'react'
import { cn } from '@/lib/format'

/**
 * Escena con capas que se mueven a distinta velocidad al hacer scroll (efecto parallax).
 * Adaptado del recurso "Parallax" de Osmo: en vez de GSAP + un segundo Lenis usa Framer Motion,
 * porque la tienda ya tiene su propio scroll suave (SmoothScroll).
 *
 * yPercent: cuánto baja la capa mientras la escena sale de pantalla. Más alto = parece más lejana.
 */
export type ParallaxLayer =
  | { kind: 'image'; src: string; alt?: string; yPercent: number; priority?: boolean; className?: string }
  | { kind: 'content'; content: ReactNode; yPercent: number; className?: string }

function Layer({ layer, progress, reduce }: { layer: ParallaxLayer; progress: MotionValue<number>; reduce: boolean | null }) {
  const y = useTransform(progress, [0, 1], ['0%', reduce ? '0%' : `${layer.yPercent}%`])
  if (layer.kind === 'image') {
    return (
      <motion.div style={{ y }} className="pointer-events-none absolute inset-x-0 -top-[17.5%] h-[117.5%] will-change-transform">
        <Image src={layer.src} alt={layer.alt ?? ''} fill priority={layer.priority} sizes="100vw" className={cn('object-cover', layer.className)} />
      </motion.div>
    )
  }
  return (
    <motion.div style={{ y }} className={cn('absolute inset-x-0 top-0 h-svh will-change-transform', layer.className)}>
      {layer.content}
    </motion.div>
  )
}

export function ParallaxScene({
  layers,
  fadeTo = 'from-transparent to-black',
  children,
  className,
}: {
  /** De atrás hacia adelante: la primera es la más lejana */
  layers: ParallaxLayer[]
  /** Degradé del borde de abajo, para fundir con la sección siguiente */
  fadeTo?: string
  /** Lo que va por encima de todas las capas (botones, textos fijos) */
  children?: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  return (
    <section className={cn('relative flex min-h-svh items-center justify-center overflow-hidden', className)}>
      <div ref={ref} className="absolute inset-x-0 top-0 h-[120%]">
        <div className="absolute inset-0 overflow-hidden">
          {layers.map((l, i) => <Layer key={i} layer={l} progress={scrollYProgress} reduce={reduce} />)}
        </div>
      </div>
      {/* El degradé va en el borde de abajo de la sección (las capas siguen un 20% más abajo, recortadas) */}
      <div className={cn('pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[22%] bg-gradient-to-b', fadeTo)} />
      {children && <div className="relative z-40 w-full self-stretch">{children}</div>}
    </section>
  )
}
