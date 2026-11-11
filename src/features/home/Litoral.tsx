import { ArrowRight, Clock, MapPin, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { buttonClass, Container, Rosettes, SectionTitle } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { SITE } from '@/lib/site'

// Fotos reales de la marca sacadas en la costanera (catálogo de Tiendanube)
const PHOTOS = [
  { src: '/products/tn/calza-larga-deportiva-tiro-alto-luxe-1.webp', href: '/running/calzas/calza-larga-deportiva-tiro-alto-luxe', label: 'Calza Larga Luxe' },
  { src: '/products/tn/crop-top-deportivo-luxe-1.webp', href: '/running/tops/crop-top-deportivo-luxe', label: 'Crop Top Luxe' },
  { src: '/products/tn/crop-top-deportivo-nature-1.webp', href: '/running/tops/crop-top-deportivo-nature', label: 'Crop Top Nature' },
  { src: '/products/tn/calza-deportiva-biker-spirit-1.webp', href: '/running/calzas/calza-deportiva-biker-spirit', label: 'Biker Spirit' },
]

/** "Somos de acá": identidad local, fotos en la costanera y cómo llegar al local */
export function Litoral() {
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.mapsQuery)}`
  return (
    <section className="relative overflow-hidden bg-brand-primary text-white">
      <Rosettes />
      <Container className="relative grid gap-10 py-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-16 lg:py-24">
        <Reveal>
          <p className="font-display text-base font-bold uppercase tracking-[0.25em] text-brand-secondary">Somos de acá</p>
          <SectionTitle light className="mt-3 !text-5xl lg:!text-7xl">A orillas del río Uruguay</SectionTitle>
          <p className="mt-6 max-w-md text-lg text-white/80">
            Diseñamos y probamos cada prenda en Concepción del Uruguay: en la costanera, en las canchas de la ciudad y en el río. Si querés probártela, te esperamos en el local.
          </p>
          <ul className="mt-8 space-y-3 text-white/85">
            <li className="flex gap-3"><MapPin size={20} className="mt-0.5 shrink-0 text-brand-secondary" /> {SITE.address} · {SITE.city}</li>
            <li className="flex gap-3"><Clock size={20} className="mt-0.5 shrink-0 text-brand-secondary" /> {SITE.hours}</li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={maps} target="_blank" rel="noopener" className={buttonClass.lime}>
              Cómo llegar <ArrowRight size={20} className="transition group-hover:translate-x-1" />
            </a>
            <a
              href={`https://wa.me/${SITE.whatsapp}`}
              target="_blank"
              rel="noopener"
              className="group inline-flex items-center gap-3 border-2 border-white/80 px-6 py-3 font-display text-lg font-bold uppercase tracking-wide transition hover:border-brand-accent hover:bg-brand-accent"
            >
              <MessageCircle size={20} /> Escribinos
            </a>
          </div>
        </Reveal>

        {/* fotos escalonadas: las de la derecha bajan un poco (va en el Link porque Reveal anima la posición) */}
        <div className="grid grid-cols-2 gap-3 pb-8 sm:gap-4 sm:pb-12">
          {PHOTOS.map((p, i) => (
            <Reveal key={p.src} delay={i * 0.08}>
              <Link href={p.href} className={`group relative block aspect-[3/4] overflow-hidden bg-white/5 ${i % 2 === 1 ? 'translate-y-8 sm:translate-y-12' : ''}`}>
                <Image src={p.src} alt={`${p.label} en la costanera de Concepción del Uruguay`} fill sizes="(min-width: 1024px) 24vw, 46vw" className="object-cover transition duration-700 group-hover:scale-105" />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-10 font-display text-sm font-bold uppercase tracking-wide sm:text-base">
                  {p.label}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
