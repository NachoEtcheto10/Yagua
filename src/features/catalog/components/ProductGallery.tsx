'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/format'

type Img = { id: string; url: string; alt: string }

/** Galería con zoom: lupa siguiendo el mouse en escritorio, pantalla completa al tocar. */
export function ProductGallery({ images }: { images: Img[] }) {
  const [index, setIndex] = useState(0)
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null)
  const [full, setFull] = useState(false)
  const touchX = useRef<number | null>(null)
  const safe = Math.min(index, images.length - 1)
  const current = images[safe]

  useEffect(() => setIndex(0), [images])
  useEffect(() => {
    if (!full) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFull(false)
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % images.length)
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [full, images.length])

  if (!current) return <div className="aspect-square bg-brand-mist" />
  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + images.length) % images.length)

  return (
    <div className="lg:sticky lg:top-24">
      <div className="flex min-w-0 flex-col-reverse gap-3 lg:flex-row">
        {images.length > 1 && (
          <ul className="scrollbar-none flex gap-2 overflow-x-auto lg:max-h-[640px] lg:w-20 lg:flex-col lg:overflow-y-auto">
            {images.map((img, i) => (
              <li key={img.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Ver foto ${i + 1}`}
                  aria-current={i === safe}
                  className={cn('relative block h-20 w-20 bg-brand-mist ring-offset-2 transition', i === safe ? 'ring-2 ring-brand-ink' : 'opacity-70 hover:opacity-100')}
                >
                  <Image src={img.url} alt="" fill sizes="80px" className="object-contain p-1" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div
          className="relative aspect-square flex-1 cursor-zoom-in overflow-hidden bg-brand-mist"
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect()
            setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
          }}
          onMouseLeave={() => setZoom(null)}
          onClick={() => setFull(true)}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current == null) return
            const dx = e.changedTouches[0].clientX - touchX.current
            touchX.current = null
            if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={current.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="absolute inset-0">
              <Image
                src={current.url}
                alt={current.alt}
                fill
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-contain p-4 transition-transform duration-200"
                style={zoom ? { transform: 'scale(2)', transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
              />
            </motion.div>
          </AnimatePresence>
          <span className="pointer-events-none absolute bottom-3 right-3 grid h-9 w-9 place-items-center bg-white/90"><ZoomIn size={18} /></span>
          {images.length > 1 && (
            <span className="absolute bottom-3 left-3 bg-white/90 px-2 py-1 text-xs font-semibold tabular-nums lg:hidden">{safe + 1}/{images.length}</span>
          )}
        </div>
      </div>

      <AnimatePresence>
        {full && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-white" role="dialog" aria-modal="true" aria-label="Fotos del producto">
            <Image src={current.url} alt={current.alt} fill sizes="100vw" className="object-contain p-6" />
            <button type="button" onClick={() => setFull(false)} className="absolute right-4 top-4 grid h-12 w-12 place-items-center bg-brand-ink text-white" aria-label="Cerrar">
              <X size={24} />
            </button>
            {images.length > 1 && (
              <>
                <button type="button" onClick={() => go(-1)} className="absolute left-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center border border-brand-ink bg-white" aria-label="Foto anterior"><ChevronLeft /></button>
                <button type="button" onClick={() => go(1)} className="absolute right-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center border border-brand-ink bg-white" aria-label="Foto siguiente"><ChevronRight /></button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
