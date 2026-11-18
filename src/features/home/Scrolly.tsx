'use client'
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { ArrowRight, MapPin, PenTool, Shirt, Wind, type LucideIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/format'

/* ------------------------------------------------------------------ */
/* "Por qué Yaguá": foto fija a la izquierda que cambia con cada razón  */
/* ------------------------------------------------------------------ */

type Feature = {
  icon: LucideIcon
  title: string
  text: string
  tags: string[]
  cta: { href: string; label: string }
  image: string
  alt: string
  pos?: string
}

const FEATURES: Feature[] = [
  {
    icon: Wind,
    title: 'Telas técnicas',
    text: 'Livianas, de secado rápido y cómodas para moverte. Pensadas para entrenar con calor, correr temprano o jugar el tercer set.',
    tags: ['Secado rápido', 'Livianas', 'Cómodas'],
    cta: { href: '/running', label: 'Ver running' },
    image: '/real/camiseta-lima.webp',
    alt: 'Camiseta deportiva Yaguá color lima, de frente y de espalda',
  },
  {
    icon: PenTool,
    title: 'Diseño propio',
    text: 'Cada colección se diseña con la identidad del yaguareté: los ojos, las manchas y los colores de la marca, en ropa y accesorios.',
    tags: ['Los ojos del yaguareté', 'Colores de la marca'],
    cta: { href: '/buscar?orden=novedades', label: 'Ver novedades' },
    image: '/real/bolso-ojos.webp',
    alt: 'Bolso Yaguá negro con los ojos del yaguareté',
  },
  {
    icon: Shirt,
    title: 'Personalizados para tu equipo',
    text: 'Camisetas, shorts y medias con tus colores, escudo, nombres y números. Mientras más prendas, mejor precio.',
    tags: ['Escudo y colores', 'Nombres y números', 'Desde 10 prendas'],
    cta: { href: '/personalizados', label: 'Diseñar camiseta' },
    image: '/real/equipo-parque-sur.webp',
    alt: 'Equipo personalizado de Parque Sur: camiseta, short y medias',
  },
  {
    icon: MapPin,
    title: 'Hecho en el litoral',
    text: 'Somos de Concepción del Uruguay. Ropa para la gente del río, del club y de la ruta, con envíos a todo el país.',
    tags: ['Concepción del Uruguay', 'Envíos a todo el país'],
    cta: { href: '/king-fishing', label: 'Ver King Fishing' },
    image: '/real/pesca-dueno.webp',
    alt: 'Pescando con mosca en el río con campera Yaguá',
    pos: 'object-[50%_30%]',
  },
]

const pad = (n: number) => String(n).padStart(2, '0')

function FeatureItem({ f, i, active, onActive }: { f: Feature; i: number; active: boolean; onActive: (i: number) => void }) {
  const ref = useRef<HTMLLIElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Se activa cuando cruza la mitad de la pantalla
    const io = new IntersectionObserver(([e]) => e.isIntersecting && onActive(i), { rootMargin: '-50% 0px -50% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [i, onActive])
  const Icon = f.icon
  return (
    <li ref={ref} className="py-10 lg:flex lg:min-h-[78vh] lg:flex-col lg:justify-center lg:py-0">
      {/* En el celular cada razón muestra su foto */}
      <div className="relative mb-6 aspect-[4/5] overflow-hidden rounded-2xl bg-white/5 lg:hidden">
        <Image src={f.image} alt={f.alt} fill sizes="100vw" className={cn('object-cover', f.pos)} />
      </div>
      <div className={cn('transition duration-500 lg:opacity-30', active && 'lg:opacity-100')}>
        <div className="flex items-center gap-4">
          <span className="font-display text-6xl font-black leading-none text-transparent [-webkit-text-stroke:1.5px_var(--color-brand-secondary)] lg:text-7xl">
            {pad(i + 1)}
          </span>
          <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-secondary text-brand-ink">
            <Icon size={22} />
          </span>
        </div>
        <h3 className="mt-6 font-display text-3xl font-black uppercase leading-[0.95] lg:text-5xl">{f.title}</h3>
        <p className="mt-4 max-w-md text-lg text-white/70">{f.text}</p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {f.tags.map((t) => (
            <li key={t} className="rounded-full border border-white/20 px-3 py-1 text-sm text-white/80">{t}</li>
          ))}
        </ul>
        <Link href={f.cta.href} className="group mt-8 inline-flex items-center gap-2 font-display text-lg font-bold uppercase tracking-wide text-brand-secondary">
          {f.cta.label}
          <ArrowRight size={20} className="transition group-hover:translate-x-1" />
        </Link>
      </div>
    </li>
  )
}

export function HomeFeatures() {
  const [active, setActive] = useState(0)
  const reduce = useReducedMotion()
  const listRef = useRef<HTMLUListElement>(null)
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start center', 'end center'] })
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 25 })
  const f = FEATURES[active]

  return (
    <section className="relative overflow-clip bg-brand-primary text-white">
      {/* manchas del yaguareté muy sutiles */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-rosettes-dark opacity-[0.05]" />
      <Container className="relative py-20 lg:py-28">
        {/* Encabezado: título a la izquierda, intro a la derecha */}
        <div className="grid gap-6 border-b border-white/15 pb-10 lg:grid-cols-2 lg:items-end lg:gap-20">
          <div>
            <p className="flex items-center gap-2 font-display text-xs font-extrabold uppercase tracking-[0.25em] text-white/60">
              <span className="h-2.5 w-2.5 bg-brand-secondary" /> Por qué Yaguá
            </p>
            <h2 className="mt-3 font-display text-5xl font-black uppercase leading-[0.9] lg:text-7xl">
              Cada detalle<br />
              <span className="text-brand-secondary">tiene un motivo</span>
            </h2>
          </div>
          <p className="max-w-md text-lg text-white/70 lg:justify-self-end">
            Ropa deportiva pensada desde la cancha y el río: telas que acompañan, diseño con identidad y prendas para todo tu equipo.
          </p>
        </div>

        <div className="mt-6 grid gap-12 lg:mt-0 lg:grid-cols-2 lg:gap-20">
          {/* Foto fija (solo compu) */}
          <div className="hidden lg:block">
            <div className="sticky top-[calc(72px+10vh)] aspect-[4/5] max-h-[76vh] overflow-hidden rounded-2xl bg-white/5">
              <AnimatePresence initial={false}>
                <motion.div
                  key={f.image}
                  initial={reduce ? { opacity: 0 } : { clipPath: 'inset(100% 0% 0% 0%)' }}
                  animate={reduce ? { opacity: 1 } : { clipPath: 'inset(0% 0% 0% 0%)' }}
                  exit={{ opacity: 0.999 }}
                  transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                  className="absolute inset-0"
                >
                  <motion.div className="absolute inset-0" initial={{ scale: reduce ? 1 : 1.15 }} animate={{ scale: 1 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}>
                    <Image src={f.image} alt={f.alt} fill sizes="50vw" className={cn('object-cover', f.pos)} />
                  </motion.div>
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
              {/* Contador y nombre de la razón actual */}
              <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={f.title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3 }}
                    className="font-display text-2xl font-black uppercase leading-none"
                  >
                    {f.title}
                  </motion.p>
                </AnimatePresence>
                <p className="shrink-0 font-display text-sm font-extrabold tabular-nums">
                  <span className="text-brand-secondary">{pad(active + 1)}</span> / {pad(FEATURES.length)}
                </p>
              </div>
            </div>
          </div>

          {/* Lista con barra de progreso al costado */}
          <div className="relative lg:pl-10">
            <div aria-hidden className="absolute bottom-0 left-0 top-0 hidden w-px bg-white/15 lg:block">
              <motion.div style={{ scaleY: progress }} className="h-full w-full origin-top bg-brand-secondary" />
            </div>
            <ul ref={listRef}>
              {FEATURES.map((x, i) => <FeatureItem key={x.title} f={x} i={i} active={i === active} onActive={setActive} />)}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  )
}
