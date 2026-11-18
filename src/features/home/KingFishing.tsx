import { ArrowRight, ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Carousel } from '@/components/ui/Carousel'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { ProductCard } from '@/features/catalog/components/ProductCard'
import type { ProductCardData } from '@/features/catalog/queries'

/** Las categorías reales de King Fishing en la tienda */
const CATEGORIES = [
  { label: 'Indumentaria técnica', href: '/king-fishing/indumentaria' },
  { label: 'Cañas', href: '/king-fishing/canas' },
  { label: 'Reeles', href: '/king-fishing/reeles' },
  { label: 'Señuelos', href: '/king-fishing/senuelos' },
  { label: 'Bolsos y accesorios', href: '/king-fishing/accesorios' },
]

/** King Fishing en la home: fotos reales de pesca, texto corto y las categorías como lista */
export function KingFishing({ products }: { products: ProductCardData[] }) {
  return (
    <section className="bg-kf-deep text-white">
      <Container className="py-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          {/* Fotos: una grande y una chica encimada */}
          <Reveal className="relative pb-16 sm:pb-24 lg:pb-0">
            <div className="relative aspect-[4/5] w-[82%] overflow-hidden rounded-sm">
              <Image src="/real/pesca-dueno-2.webp" alt="Pescando con mosca en el río, con campera Yaguá" fill sizes="(min-width: 1024px) 45vw, 82vw" className="object-cover object-[50%_30%]" />
            </div>
            <div className="absolute bottom-0 right-0 aspect-[4/3] w-[52%] overflow-hidden rounded-sm border-[6px] border-kf-deep">
              <Image src="/real/pesca-campera.webp" alt="Detalle de la campera con los ojos del yaguareté" fill sizes="(min-width: 1024px) 28vw, 52vw" className="object-cover" />
            </div>
          </Reveal>

          {/* Texto y categorías */}
          <Reveal delay={0.1} className="flex flex-col justify-center">
            <p className="font-display text-sm font-bold uppercase tracking-[0.3em] text-kf-gold">Pesca y aventura</p>
            <h2 className="mt-3 font-display text-6xl font-black uppercase leading-[0.85] lg:text-8xl">
              King<br />Fishing
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-white/75">
              Para los que madrugan para ir al río. Ropa con protección solar, abrigo para el frío de la mañana y todo lo que hace falta para pescar.
            </p>
            <ul className="mt-8 border-t border-white/15">
              {CATEGORIES.map((c) => (
                <li key={c.href} className="border-b border-white/15">
                  <Link href={c.href} className="group flex items-center justify-between py-3.5 text-lg transition hover:text-kf-gold">
                    {c.label}
                    <ArrowUpRight size={20} className="text-white/40 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-kf-gold" />
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/king-fishing" className="mt-8 inline-flex items-center gap-3 self-start bg-kf-gold px-6 py-3.5 font-display text-lg font-bold uppercase tracking-wide text-kf-deep transition hover:bg-white">
              Ver todo King Fishing <ArrowRight size={20} />
            </Link>
          </Reveal>
        </div>

        {/* Productos */}
        <div className="mt-16 [&_h3]:text-white [&_p]:text-white/70">
          <p className="mb-5 font-display text-2xl font-black uppercase">Lo más elegido para el río</p>
          <Carousel label="Productos King Fishing" itemClass="w-[62%] sm:w-[40%] lg:w-[23%]" dark>
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </Carousel>
        </div>
      </Container>
    </section>
  )
}
