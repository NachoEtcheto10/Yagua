'use client'
import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity, wrap } from 'framer-motion'
import { useRef, type ReactNode } from 'react'
import { cn } from '@/lib/format'

/**
 * Cinta de texto gigante que se mueve sola y se acelera con el scroll (cambia de sentido si subís).
 * Va inclinada para cortar la página en diagonal. Respeta "reducir movimiento".
 */
export function KineticBand({ words, tone = 'turquoise', speed = 2.4, tilt = -2 }: { words: string[]; tone?: 'turquoise' | 'pink' | 'ink' | 'lime'; speed?: number; tilt?: number }) {
  const reduce = useReducedMotion()
  const x = useMotionValue(0)
  const { scrollY } = useScroll()
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 })
  const boost = useTransform(velocity, [-1500, 0, 1500], [-4, 0, 4], { clamp: false })
  const dir = useRef(1)

  useAnimationFrame((_, delta) => {
    if (reduce) return
    const b = boost.get()
    if (b < 0) dir.current = -1
    else if (b > 0) dir.current = 1
    x.set(wrap(-50, 0, x.get() - dir.current * (speed + Math.abs(b) * speed) * (delta / 1000)))
  })
  const translate = useTransform(x, (v) => `${v}%`)

  const colors = {
    turquoise: 'bg-brand-turquoise text-brand-ink',
    pink: 'bg-brand-accent text-white',
    ink: 'bg-brand-ink text-brand-secondary',
    lime: 'bg-brand-secondary text-brand-ink',
  }[tone]
  const line = (
    <span className="flex shrink-0 items-center">
      {words.map((w, i) => (
        <span key={i} className="flex items-center">
          <span className="px-6 sm:px-10">{w}</span>
          <span aria-hidden className="inline-flex gap-1.5">
            <span className="h-5 w-2.5 -skew-x-[18deg] bg-current opacity-40 sm:h-8 sm:w-3.5" />
          </span>
        </span>
      ))}
    </span>
  )
  return (
    <div className="relative overflow-hidden py-6 sm:py-10" aria-hidden>
      <div className={cn('py-3 sm:py-5', colors)} style={{ transform: `rotate(${tilt}deg) scale(1.05)` }}>
        <motion.div className="flex w-max whitespace-nowrap font-display text-4xl font-black uppercase leading-none sm:text-7xl" style={{ x: translate }}>
          {line}
          {line}
        </motion.div>
      </div>
    </div>
  )
}

/** Barra fina arriba de la pantalla que muestra cuánto falta de la página */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 })
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-gradient-to-r from-brand-turquoise via-brand-secondary to-brand-accent"
      style={{ scaleX }}
    />
  )
}

/** Inclina el contenido en 3D siguiendo el mouse (solo con mouse; en celular no hace nada) */
export function Tilt({ children, className, max = 8 }: { children: ReactNode; className?: string; max?: number }) {
  const reduce = useReducedMotion()
  const rx = useSpring(0, { stiffness: 250, damping: 20 })
  const ry = useSpring(0, { stiffness: 250, damping: 20 })
  return (
    <motion.div
      className={className}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== 'mouse') return
        const r = e.currentTarget.getBoundingClientRect()
        ry.set(((e.clientX - r.left) / r.width - 0.5) * 2 * max)
        rx.set(-((e.clientY - r.top) / r.height - 0.5) * 2 * max)
      }}
      onPointerLeave={() => {
        rx.set(0)
        ry.set(0)
      }}
    >
      {children}
    </motion.div>
  )
}

/** La foto aparece con un barrido (cortina) al entrar en pantalla */
export function WipeReveal({ children, className, delay = 0, from = 'bottom' }: { children: ReactNode; className?: string; delay?: number; from?: 'bottom' | 'left' }) {
  const reduce = useReducedMotion()
  const hidden = from === 'left' ? 'inset(0 100% 0 0)' : 'inset(100% 0 0 0)'
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { clipPath: hidden, scale: 1.08 }}
      whileInView={{ clipPath: 'inset(0 0% 0 0)', scale: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.9, delay, ease: [0.77, 0, 0.18, 1] }}
    >
      {children}
    </motion.div>
  )
}
