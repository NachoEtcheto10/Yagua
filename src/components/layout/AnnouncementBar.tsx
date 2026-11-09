'use client'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
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
    </div>
  )
}
