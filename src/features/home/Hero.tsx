'use client'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import { buttonClass } from '@/components/ui/Container'

/** Portada a pantalla completa con parallax suave */
export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '22%'])
  const scale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.08])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '40%'])
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <section ref={ref} className="relative h-[calc(100svh-100px)] min-h-[520px] overflow-hidden bg-brand-primary">
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <Image src="/sports/padel-2.webp" alt="" fill priority sizes="100vw" className="object-cover object-[50%_35%]" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
      <motion.div style={{ y: textY, opacity: fade }} className="relative mx-auto flex h-full max-w-[1440px] flex-col justify-end px-4 pb-14 sm:px-6 lg:px-10 lg:pb-20">
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="font-display text-lg font-bold uppercase tracking-[0.3em] text-brand-secondary"
        >
          Nueva temporada
        </motion.p>
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-2 max-w-4xl font-display text-6xl font-black uppercase italic leading-[0.85] text-white sm:text-8xl lg:text-[9rem]"
        >
          Mirada de <span className="text-brand-secondary">yaguá</span>
        </motion.h1>
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-5 max-w-lg text-lg text-white/85"
        >
          Indumentaria y equipamiento para running, hockey, pádel, tenis, trekking, golf y pesca. Diseñado en Concepción del Uruguay.
        </motion.p>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <Link href="/padel" className={buttonClass.light}>
            Comprar pádel <ArrowRight size={20} className="transition group-hover:translate-x-1" />
          </Link>
          <Link href="/buscar" className="group inline-flex items-center gap-3 border-2 border-white px-6 py-3 font-display text-lg font-bold uppercase tracking-wide text-white transition hover:bg-white hover:text-brand-ink">
            Ver todo
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}
