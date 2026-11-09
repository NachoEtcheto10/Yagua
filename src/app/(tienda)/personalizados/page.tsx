import { ArrowRight, MessageCircle } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import { Container, SectionTitle, buttonClass } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Personalizados para equipos',
  description: 'Camisetas y remeras personalizadas para equipos y clubes: tus colores, escudo, nombres y números.',
}

const STEPS = [
  ['Elegí el modelo', 'Camiseta, musculosa, remera técnica o chomba.'],
  ['Tus colores', 'Combiná los colores del club en cuerpo, mangas y detalles.'],
  ['Escudo y sponsors', 'Mandanos el logo en buena calidad y lo aplicamos.'],
  ['Nombres y números', 'Pasanos la lista de jugadores con talle, nombre y número.'],
]

const PRICES = [
  ['10 a 19 prendas', 'Precio de lista'],
  ['20 a 39 prendas', '15% OFF'],
  ['40 o más', '25% OFF'],
]

export default function CustomPage() {
  // TODO Fase 2: configurador con vista previa en vivo (frente y espalda), carga de CSV y pedido de presupuesto en el admin
  const wa = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent('¡Hola! Quiero pedir un presupuesto de camisetas personalizadas para mi equipo.')}`
  return (
    <>
      <section className="relative overflow-hidden bg-brand-primary text-white">
        <Image src="/custom/festejo.webp" alt="" fill priority sizes="100vw" className="object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
        <Container className="relative py-24 lg:py-36">
          <p className="font-display text-sm font-bold uppercase tracking-[0.3em] text-brand-secondary">Personalizados</p>
          <h1 className="mt-2 max-w-3xl font-display text-6xl font-black uppercase italic leading-[0.85] lg:text-9xl">Vestí a tu equipo</h1>
          <p className="mt-5 max-w-lg text-lg text-white/85">Camisetas para clubes, colegios, empresas y grupos de entrenamiento. Diseño, producción y entrega en Concepción del Uruguay.</p>
          <a href={wa} target="_blank" rel="noopener" className={`${buttonClass.light} mt-8`}>
            <MessageCircle size={20} /> Pedir presupuesto
          </a>
        </Container>
      </section>

      <Container className="py-16 lg:py-24">
        <SectionTitle>Cómo funciona</SectionTitle>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([t, d], i) => (
            <Reveal as="li" key={t} delay={i * 0.08} className="bg-brand-mist p-6">
              <span className="font-display text-5xl font-black italic text-brand-secondary">0{i + 1}</span>
              <p className="mt-3 font-display text-2xl font-bold uppercase">{t}</p>
              <p className="mt-1 text-sm text-brand-muted">{d}</p>
            </Reveal>
          ))}
        </ol>
      </Container>

      <section className="bg-brand-secondary">
        <Container className="grid gap-8 py-16 lg:grid-cols-2 lg:items-center lg:py-20">
          <div>
            <SectionTitle>Más prendas, mejor precio</SectionTitle>
            <p className="mt-3 max-w-md">Precios por volumen sobre el valor de lista. {/* TODO: confirmar escala con el cliente */}</p>
          </div>
          <ul className="grid gap-2">
            {PRICES.map(([q, p]) => (
              <li key={q} className="flex items-center justify-between bg-white px-5 py-4">
                <span className="font-semibold">{q}</span>
                <span className="font-display text-2xl font-black italic">{p}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <Container className="py-16 lg:py-24">
        <SectionTitle>Trabajos para clubes</SectionTitle>
        {/* TODO: fotos reales de trabajos hechos */}
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {['/custom/equipos.webp', '/custom/festejo.webp', '/community/jugador-5.webp'].map((src) => (
            <div key={src} className="relative aspect-[4/3] overflow-hidden bg-brand-mist">
              <Image src={src} alt="Trabajo personalizado para un club" fill sizes="33vw" className="object-cover" />
            </div>
          ))}
        </div>
        <a href={wa} target="_blank" rel="noopener" className={`${buttonClass.primary} mt-10`}>
          Quiero mis camisetas <ArrowRight size={20} className="transition group-hover:translate-x-1" />
        </a>
      </Container>
    </>
  )
}
