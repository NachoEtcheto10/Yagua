import { ArrowRight, Droplets, Fish, Sun, Timer, Wind } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Carousel } from '@/components/ui/Carousel'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { ProductCard } from '@/features/catalog/components/ProductCard'
import type { ProductCardData } from '@/features/catalog/queries'

/** Beneficios de las prendas técnicas (los que destaca Kiiing Adventure en sus remeras Neo Dry) */
const TECH = [
  { icon: Wind, title: 'Respirable', text: 'Libera el calor del cuerpo y evita el sobrecalentamiento.' },
  { icon: Droplets, title: 'Control de humedad', text: 'Saca la transpiración hacia afuera para que estés seco.' },
  { icon: Timer, title: 'Secado rápido', text: 'Telas de microfibra que se secan en minutos.' },
  { icon: Sun, title: 'UPF 50+', text: 'Protección contra el sol para días largos en el río.' },
]

/** Líneas de producto: llevan a la búsqueda de cada una */
const LINES = [
  { label: 'Remeras Neo Dry UPF 50+', href: '/buscar?q=neo%20dry' },
  { label: 'Térmicas', href: '/buscar?q=termica' },
  { label: 'Buzos micropolar', href: '/buscar?q=micropolar' },
  { label: 'Camperas impermeables', href: '/buscar?q=impermeable' },
  { label: 'Pantalones cargo', href: '/buscar?q=cargo' },
]

export function KingFishing({ products }: { products: ProductCardData[] }) {
  return (
    <section className="relative overflow-hidden bg-kf-deep text-white">
      <Image src="/real/pesca-campera.webp" alt="" fill sizes="100vw" className="object-cover opacity-35" />
      <div className="absolute inset-0 bg-gradient-to-r from-kf-deep via-kf-deep/90 to-kf-deep/50" />
      <Container className="relative py-16 lg:py-24">
        {/* Encabezado */}
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
          <Reveal>
            <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.3em] text-kf-gold">
              <Fish size={18} /> Pesca y aventura
            </p>
            <h2 className="mt-3 font-display text-6xl font-black uppercase leading-[0.85] lg:text-8xl">
              King<br />Fishing
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="font-display text-3xl font-black uppercase leading-[0.95] lg:text-5xl">
              Seco por dentro.<br />
              <span className="text-kf-gold">Activo por fuera.</span>
            </p>
            <p className="mt-4 max-w-md text-white/75">
              Indumentaria outdoor de Kiiing Adventure y equipos de pesca para pasar el día en el río, con frío, sol o lluvia.
            </p>
          </Reveal>
        </div>

        {/* Beneficios técnicos */}
        <ul className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/10 lg:grid-cols-4">
          {TECH.map((t, i) => (
            <Reveal as="li" key={t.title} delay={i * 0.06} className="bg-kf-deep/80 p-5 backdrop-blur-sm lg:p-6">
              <t.icon size={26} className="text-kf-gold" />
              <p className="mt-4 font-display text-lg font-black uppercase leading-tight lg:text-xl">{t.title}</p>
              <p className="mt-1.5 text-sm text-white/65">{t.text}</p>
            </Reveal>
          ))}
        </ul>

        {/* Líneas de producto */}
        <div className="mt-10 flex flex-wrap gap-2">
          {LINES.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="rounded-full border border-white/25 px-4 py-2 text-sm font-semibold transition hover:border-kf-gold hover:bg-kf-gold hover:text-kf-deep"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Productos */}
        <div className="mt-10 [&_h3]:text-white [&_p]:text-white/70">
          <Carousel label="Productos King Fishing" itemClass="w-[62%] sm:w-[40%] lg:w-[23%]" dark>
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </Carousel>
        </div>

        <Link href="/king-fishing" className="mt-10 inline-flex items-center gap-3 bg-kf-gold px-6 py-3.5 font-display text-lg font-bold uppercase tracking-wide text-kf-deep transition hover:bg-white">
          Entrar a King Fishing <ArrowRight size={20} />
        </Link>
      </Container>
    </section>
  )
}
