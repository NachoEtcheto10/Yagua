'use client'
import { AnimatePresence, motion, useMotionTemplate, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { ArrowRight, MapPin, PenTool, Shirt, Wind, type LucideIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { buttonClass, Container } from '@/components/ui/Container'

/* ------------------------------------------------------------------ */
/* 1. Manifiesto: el texto se va encendiendo palabra por palabra       */
/* ------------------------------------------------------------------ */

function Word({ word, range, progress, highlight }: { word: string; range: [number, number]; progress: MotionValue<number>; highlight: boolean }) {
  const opacity = useTransform(progress, range, [0.14, 1])
  return (
    <motion.span style={{ opacity }} className={`mr-[0.25em] inline-block ${highlight ? 'text-brand-accent' : ''}`}>
      {word}
    </motion.span>
  )
}

export function Manifesto({ label, text, highlight = [] }: { label: string; text: string; highlight?: string[] }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] })
  const words = text.split(' ')
  return (
    <section className="py-20 lg:py-32">
      <Container className="grid gap-6 lg:grid-cols-[220px_1fr] lg:gap-10">
        <p className="flex items-center gap-2 self-start pt-2 font-display text-xs font-extrabold uppercase tracking-[0.25em] text-brand-muted">
          <span className="h-2.5 w-2.5 bg-brand-secondary" />
          {label}
        </p>
        <p ref={ref} className="max-w-5xl font-display text-[1.9rem] font-extrabold leading-[1.12] text-brand-ink sm:text-5xl lg:text-[3.6rem]">
          {words.map((w, i) =>
            reduce ? (
              <span key={i} className={`mr-[0.25em] inline-block ${highlight.includes(w) ? 'text-brand-accent' : ''}`}>{w}</span>
            ) : (
              <Word key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} highlight={highlight.includes(w)} />
            ),
          )}
        </p>
      </Container>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* 2. Foto que se agranda hasta ocupar toda la pantalla                */
/* ------------------------------------------------------------------ */

export function ExpandingMedia({
  src, alt, eyebrow, title, text, cta,
}: { src: string; alt: string; eyebrow: string; title: string; text: string; cta: { href: string; label: string } }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  // Arranca recortada (márgenes a los costados y arriba, puntas redondeadas) y termina a pantalla completa
  const side = useTransform(scrollYProgress, [0.15, 0.6], reduce ? [0, 0] : [16, 0])
  const top = useTransform(scrollYProgress, [0.15, 0.6], reduce ? [0, 0] : [22, 0])
  const radius = useTransform(scrollYProgress, [0.15, 0.6], reduce ? [0, 0] : [28, 0])
  const clipPath = useMotionTemplate`inset(${top}% ${side}% 0% ${side}% round ${radius}px)`
  const scale = useTransform(scrollYProgress, [0.15, 0.8], reduce ? [1, 1] : [1.25, 1])
  const cardY = useTransform(scrollYProgress, [0.55, 0.85], reduce ? [0, 0] : [80, 0])
  const cardOpacity = useTransform(scrollYProgress, [0.55, 0.8], reduce ? [1, 1] : [0, 1])

  return (
    <section ref={ref} className="relative h-[170vh] bg-white">
      <div className="sticky top-16 h-[calc(100svh-4rem)] overflow-hidden lg:top-[72px] lg:h-[calc(100svh-72px)]">
        <motion.div style={{ clipPath }} className="absolute inset-0 overflow-hidden">
          <motion.div style={{ scale }} className="absolute inset-0">
            <Image src={src} alt={alt} fill sizes="100vw" className="object-cover" />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        </motion.div>
        <motion.div style={{ y: cardY, opacity: cardOpacity }} className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6 lg:inset-x-auto lg:bottom-10 lg:left-10 lg:max-w-xl">
          <div className="bg-brand-primary/85 p-6 text-white backdrop-blur-md lg:p-8">
            <p className="flex items-center gap-2 font-display text-xs font-extrabold uppercase tracking-[0.25em] text-brand-secondary">
              <span className="h-2.5 w-2.5 bg-brand-accent" /> {eyebrow}
            </p>
            <h2 className="mt-3 font-display text-3xl font-black uppercase leading-[0.95] lg:text-5xl">{title}</h2>
            <p className="mt-3 text-white/75">{text}</p>
            <Link href={cta.href} className={`${buttonClass.lime} mt-6`}>
              {cta.label} <ArrowRight size={20} className="transition group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* 3. Foto fija a la izquierda que cambia con cada característica      */
/* ------------------------------------------------------------------ */

export type Feature = { icon: LucideIcon; title: string; text: string; image: string; alt: string }

function FeatureItem({ f, i, onActive }: { f: Feature; i: number; onActive: (i: number) => void }) {
  const ref = useRef<HTMLLIElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Activa la característica cuando cruza la mitad de la pantalla
    const io = new IntersectionObserver(([e]) => e.isIntersecting && onActive(i), { rootMargin: '-50% 0px -50% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [i, onActive])
  const Icon = f.icon
  return (
    <li ref={ref} className="py-10 lg:flex lg:min-h-[70vh] lg:flex-col lg:justify-center lg:py-0">
      {/* En el celular cada característica muestra su foto */}
      <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-xl lg:hidden">
        <Image src={f.image} alt={f.alt} fill sizes="100vw" className="object-cover" />
      </div>
      <div className="flex gap-5">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg border border-white/15 text-brand-secondary">
          <Icon size={24} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="border-b border-white/15 pb-4 font-display text-2xl font-black uppercase lg:text-3xl">{f.title}</h3>
          <p className="mt-4 max-w-md text-white/70">{f.text}</p>
        </div>
      </div>
    </li>
  )
}

export function StickyFeatures({ eyebrow, title, features }: { eyebrow: string; title: string; features: Feature[] }) {
  const [active, setActive] = useState(0)
  const f = features[active]
  return (
    <section className="bg-brand-primary text-white">
      <Container className="py-20 lg:py-28">
        <p className="flex items-center gap-2 font-display text-xs font-extrabold uppercase tracking-[0.25em] text-white/60">
          <span className="h-2.5 w-2.5 bg-brand-secondary" /> {eyebrow}
        </p>
        <h2 className="mt-3 max-w-3xl font-display text-4xl font-black uppercase leading-[0.95] lg:text-6xl">{title}</h2>
        <div className="mt-6 grid gap-12 lg:mt-0 lg:grid-cols-2 lg:gap-20">
          <div className="hidden lg:block">
            <div className="sticky top-[calc(72px+12vh)] aspect-[4/5] max-h-[72vh] overflow-hidden rounded-xl bg-white/5">
              <AnimatePresence initial={false}>
                <motion.div
                  key={f.image}
                  initial={{ opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  <Image src={f.image} alt={f.alt} fill sizes="50vw" className="object-cover" />
                </motion.div>
              </AnimatePresence>
              {/* Contador 01 / 04 */}
              <p className="absolute bottom-4 left-4 bg-brand-primary/80 px-3 py-1.5 font-display text-sm font-extrabold tabular-nums">
                <span className="text-brand-secondary">{String(active + 1).padStart(2, '0')}</span> / {String(features.length).padStart(2, '0')}
              </p>
            </div>
          </div>
          <ul>
            {features.map((x, i) => <FeatureItem key={x.title} f={x} i={i} onActive={setActive} />)}
          </ul>
        </div>
      </Container>
    </section>
  )
}

/** Las cuatro razones de la marca, con su foto (fija a la izquierda en la compu) */
export function HomeFeatures() {
  return (
    <StickyFeatures
      eyebrow="Por qué Yaguá"
      title="Cada detalle tiene un motivo"
      features={[
        { icon: Wind, title: 'Telas técnicas', text: 'Livianas, de secado rápido y cómodas para moverte. Pensadas para entrenar con calor, correr temprano o jugar el tercer set.', image: '/sports/running-2.webp', alt: 'Corredor en pleno salto con ropa deportiva' },
        { icon: PenTool, title: 'Diseño propio', text: 'Cada colección se diseña acá, con la identidad del yaguareté: los ojos, las manchas y los colores de la marca.', image: '/products/camiseta-dry-celeste-modelo.webp', alt: 'Camiseta Dry de Yaguá' },
        { icon: Shirt, title: 'Personalizados para tu equipo', text: 'Camisetas con tus colores, escudo, nombres y números. Mientras más prendas, mejor precio.', image: '/custom/equipos.webp', alt: 'Camisetas personalizadas para equipos' },
        { icon: MapPin, title: 'Hecho en el litoral', text: 'Somos de Concepción del Uruguay. Ropa para la gente del río, del club y de la ruta, con envíos a todo el país.', image: '/sports/nautica-2.webp', alt: 'El río Uruguay al atardecer' },
      ]}
    />
  )
}
