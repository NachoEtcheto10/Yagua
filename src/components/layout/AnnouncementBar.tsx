'use client'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ANNOUNCEMENTS } from '@/lib/site'

export function AnnouncementBar() {
  const [i, setI] = useState(0)
  const reduce = useReducedMotion()
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % ANNOUNCEMENTS.length), 4500)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="relative h-9 overflow-hidden bg-brand-secondary text-brand-ink" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={i}
          initial={reduce ? false : { y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? undefined : { y: -18, opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="absolute inset-0 flex items-center justify-center px-4 text-center font-display text-sm font-bold uppercase tracking-wider"
        >
          {ANNOUNCEMENTS[i]}
        </motion.p>
      </AnimatePresence>
      {/* Acceso a ventas mayoristas (en compu, a la derecha de la barra) */}
      <Link href="/mayoristas" className="absolute inset-y-0 right-4 hidden items-center font-display text-xs font-extrabold uppercase tracking-wider underline-offset-4 hover:underline md:flex lg:right-10">
        Mayoristas
      </Link>
    </div>
  )
}
