'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/format'

/** Pestañas "Novedades / Lo más vendido": el contenido llega ya renderizado desde el servidor */
export function ProductTabs({ tabs }: { tabs: { key: string; label: string; content: ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0]?.key)
  const current = tabs.find((t) => t.key === active)
  return (
    <div>
      <div role="tablist" className="mb-8 flex gap-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={t.key === active}
            onClick={() => setActive(t.key)}
            className={cn(
              'relative pb-2 font-display text-3xl font-extrabold uppercase italic transition sm:text-4xl lg:text-5xl',
              t.key === active ? 'text-brand-ink' : 'text-brand-ink/25 hover:text-brand-ink/50',
            )}
          >
            {t.label}
            {t.key === active && <motion.span layoutId="tab-underline" className="absolute inset-x-0 bottom-0 h-1 bg-brand-secondary" />}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
          {current?.content}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
