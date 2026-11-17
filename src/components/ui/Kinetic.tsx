'use client'
import { motion, useReducedMotion, useSpring } from 'framer-motion'
import type { ReactNode } from 'react'

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
