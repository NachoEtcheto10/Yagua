import { ArrowRight, Shirt } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Carousel } from '@/components/ui/Carousel'
import { Container, SectionTitle, buttonClass } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { ProductCard } from '@/features/catalog/components/ProductCard'
import { getBestSellers, getBySport, getNewArrivals, getSports } from '@/features/catalog/queries'
import { Ambassadors, Players, SponsorsAndAssociations } from '@/features/home/CommunityBlocks'
import { Hero } from '@/features/home/Hero'
import { Litoral } from '@/features/home/Litoral'
import { ProductTabs } from '@/features/home/ProductTabs'
import { CampaignCarousel } from '@/features/home/CampaignCarousel'
import { Collaborations } from '@/features/home/Collaborations'
import { HomeFeatures } from '@/features/home/Scrolly'
import { KingFishing } from '@/features/home/KingFishing'
import { getActiveCampaigns, getCommunity } from '@/features/home/queries'

export const revalidate = 300

// Punto de la foto que tiene que quedar a la vista en las tarjetas de deporte (por defecto, el centro)
const CARD_FOCUS: Record<string, string> = {
  ninos: 'object-[50%_32%]', // la foto tiene un título arriba: se muestra la cara del nene, no el título
  accesorios: 'object-[50%_25%]', // la gorra y la cara
  padel: 'object-[50%_45%]', // Gugú en posición de juego
}

export default async function HomePage() {
  const [sports, newArrivals, bestSellers, kingFishing, campaigns, community] = await Promise.all([
    getSports(),
    getNewArrivals(10),
    getBestSellers(10),
    getBySport('king-fishing', 8),
    getActiveCampaigns(),
    getCommunity(),
  ])
  const mainSports = sports.filter((s) => !s.isSubBrand) // 8 tarjetas: grilla de 4×2 completa

  return (
    <>
      {/* 1. Hero */}
      <Hero />

      {/* 2. Accesos por deporte */}
      <section id="deportes" className="scroll-mt-20 py-16 lg:py-24">
        <Container>
          <SectionTitle>Elegí tu deporte</SectionTitle>
          <div className="mt-8 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
            {mainSports.map((s, i) => {
              // Las 2 primeras van grandes; si sobran 2 al final, también, para que la grilla cierre sin huecos
              const big = i < 2 || ((mainSports.length - 2) % 4 === 2 && i >= mainSports.length - 2)
              return (
              <Reveal key={s.slug} delay={(i % 4) * 0.06} className={big ? 'lg:col-span-2' : ''}>
                <Link href={`/${s.slug}`} className={`group relative block overflow-hidden bg-brand-mist ${big ? 'aspect-[4/5] lg:aspect-[16/10]' : 'aspect-[4/5]'}`}>
                  <Image
                    src={s.cardImage}
                    alt={s.name}
                    fill
                    sizes={big ? '(min-width: 1024px) 50vw, 50vw' : '(min-width: 1024px) 25vw, 50vw'}
                    className={`object-cover transition duration-700 ease-out group-hover:scale-105 ${CARD_FOCUS[s.slug] ?? ''}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 lg:p-6">
                    <div>
                      <p className="hidden text-sm text-white/80 sm:block">{s.tagline}</p>
                      <p className={`font-display text-3xl font-black uppercase italic leading-none text-white ${big ? 'lg:text-5xl' : 'lg:text-4xl'}`}>{s.name}</p>
                    </div>
                    <span className="grid h-10 w-10 shrink-0 place-items-center bg-white text-brand-ink transition group-hover:bg-brand-secondary">
                      <ArrowRight size={20} />
                    </span>
                  </div>
                </Link>
              </Reveal>
              )
            })}
          </div>
        </Container>
      </section>

      {/* 3. Novedades / Lo más vendido */}
      <section className="pb-16 lg:pb-24">
        <Container>
          <ProductTabs
            tabs={[
              {
                key: 'nuevo',
                label: 'Novedades',
                content: (
                  <Carousel label="Novedades">
                    {newArrivals.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 2} />)}
                  </Carousel>
                ),
              },
              {
                key: 'top',
                label: 'Lo más vendido',
                content: (
                  <Carousel label="Lo más vendido">
                    {bestSellers.map((p) => <ProductCard key={p.id} product={p} />)}
                  </Carousel>
                ),
              },
            ]}
          />
        </Container>
      </section>

      {/* 4. Campañas y eventos (editables desde el admin): carrusel si hay más de una */}
      {campaigns.length > 0 && (
        <section className="py-10 lg:py-14">
          <Container>
            <Reveal>
              <CampaignCarousel slides={campaigns} />
            </Reveal>
          </Container>
        </section>
      )}

      {/* 4b. Colaboraciones: FAP × Yaguá */}
      <Collaborations />

      {/* Por qué Yaguá: foto fija que cambia con cada característica */}
      <HomeFeatures />

      {/* 5. King Fishing: pesca y aventura (indumentaria Kiiing Adventure) */}
      <KingFishing products={kingFishing} />

      {/* 6. Personalizados para equipos */}
      <section className="py-16 lg:py-24">
        <Container>
          <div className="grid overflow-hidden bg-brand-mist lg:grid-cols-2">
            <div className="relative min-h-[320px]">
              <Image src="/custom/equipos.webp" alt="Camisetas personalizadas para equipos" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
            <Reveal className="flex flex-col justify-center p-8 lg:p-16">
              <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.3em] text-brand-accent">
                <Shirt size={18} /> Personalizados
              </p>
              <SectionTitle className="mt-3">Vestí a tu equipo</SectionTitle>
              <p className="mt-4 max-w-md text-brand-muted">
                Camisetas y remeras con tus colores, escudo, nombres y números. Elegí el modelo, armá la lista de jugadores y pedí tu presupuesto.
                Mientras más prendas, mejor precio.
              </p>
              <ul className="mt-6 grid grid-cols-3 gap-3 text-center">
                {[['10+', 'prendas'], ['15%', 'OFF desde 20'], ['15', 'días hábiles']].map(([n, l]) => (
                  <li key={l} className="bg-white py-4">
                    <span className="block font-display text-3xl font-black italic">{n}</span>
                    <span className="text-xs uppercase tracking-wide text-brand-muted">{l}</span>
                  </li>
                ))}
              </ul>
              <Link href="/personalizados" className={`${buttonClass.primary} mt-8 self-start`}>
                Diseñar camiseta <ArrowRight size={20} className="transition group-hover:translate-x-1" />
              </Link>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* 7. Identidad local: somos de Concepción del Uruguay */}
      <Litoral />

      {/* 8. Embajadores */}
      <Ambassadors ambassadors={community.ambassadors} />

      {/* 9. Jugadores que vistieron la marca */}
      <Players players={community.players} />

      {/* 10. Sponsors y asociaciones */}
      <SponsorsAndAssociations sponsors={community.sponsors} associations={community.associations} />

      {/* 11. Newsletter + footer: en el layout */}
    </>
  )
}
