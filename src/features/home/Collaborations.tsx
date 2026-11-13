import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { buttonClass, Container, SectionTitle } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'

// Colaboraciones de la marca. TODO: pasar al admin si suman más (por ahora, la de la FAP)
const FAP = [
  { href: '/padel/indumentaria/remera-fap-hombre', image: '/products/fap/remera-fap-hombre.webp', label: 'Hombre', detail: 'Cuello redondo' },
  { href: '/padel/indumentaria/remera-fap-mujer', image: '/products/fap/remera-fap-mujer.webp', label: 'Mujer', detail: 'Cuello en V, entallada' },
]

/** "Colaboraciones que nos llenan de orgullo": indumentaria oficial de la Federación Argentina de Pádel */
export function Collaborations() {
  return (
    <section className="py-16 lg:py-24">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-16">
          <Reveal>
            <p className="font-display text-base font-bold uppercase tracking-[0.25em] text-brand-accent">Colaboraciones que nos llenan de orgullo</p>
            <SectionTitle className="mt-3 !text-5xl lg:!text-7xl">FAP × Yaguá</SectionTitle>
            <p className="mt-6 max-w-md text-lg text-brand-muted">
              Diseñamos y confeccionamos la indumentaria oficial de la <strong className="text-brand-ink">Federación Argentina de Pádel</strong> para el Nacional Libres 2026. Una remera técnica, liviana y de secado rápido, en versión hombre y mujer.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2 text-sm">
              {['Dry Fit de secado rápido', 'Escudo FAP + Yaguá', 'Hecha en Concepción del Uruguay'].map((t) => (
                <li key={t} className="border border-brand-line px-3 py-1.5">{t}</li>
              ))}
            </ul>
            <Link href="/padel/indumentaria" className={`${buttonClass.primary} mt-8`}>
              Ver la colección <ArrowRight size={20} className="transition group-hover:translate-x-1" />
            </Link>
          </Reveal>

          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            {FAP.map((f, i) => (
              <Reveal key={f.href} delay={i * 0.1}>
                <Link href={f.href} className="group block">
                  {/* Las imágenes tienen fondo blanco: se ven enteras, sin bordes */}
                  <div className="relative aspect-[673/820] overflow-hidden bg-white">
                    <Image src={f.image} alt={`Remera oficial FAP ${f.label}, frente y espalda`} fill sizes="(min-width: 1024px) 28vw, 48vw" className="object-contain transition duration-700 group-hover:scale-[1.03]" />
                  </div>
                  <p className="mt-3 flex items-center justify-between font-display text-xl font-bold uppercase">
                    {f.label} <ArrowRight size={18} className="transition group-hover:translate-x-1" />
                  </p>
                  <p className="text-sm text-brand-muted">{f.detail}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
