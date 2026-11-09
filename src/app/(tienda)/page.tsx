import { ArrowRight, Fish, Shirt } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Carousel } from '@/components/ui/Carousel'
import { Container, SectionTitle, buttonClass } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { ProductCard } from '@/features/catalog/components/ProductCard'
import { getBestSellers, getBySport, getNewArrivals, getSports } from '@/features/catalog/queries'
import { Ambassadors, Players, SponsorsAndAssociations } from '@/features/home/CommunityBlocks'
import { Hero } from '@/features/home/Hero'
import { ProductTabs } from '@/features/home/ProductTabs'
import { getActiveCampaign, getCommunity } from '@/features/home/queries'

export const revalidate = 300

export default async function HomePage() {
  const [sports, newArrivals, bestSellers, kingFishing, campaign, community] = await Promise.all([
    getSports(),
    getNewArrivals(10),
    getBestSellers(10),
    getBySport('king-fishing', 6),
    getActiveCampaign(),
    getCommunity(),
  ])
  const mainSports = sports.filter((s) => !s.isSubBrand && s.slug !== 'accesorios')

  return (
    <>
      {/* 1. Hero */}
      <Hero />

      {/* 2. Accesos por deporte */}
      <section className="py-16 lg:py-24">
        <Container>
          <SectionTitle>Elegí tu deporte</SectionTitle>
          <div className="mt-8 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
            {mainSports.map((s, i) => (
              <Reveal key={s.slug} delay={(i % 4) * 0.06} className={i < 2 ? 'lg:col-span-2' : ''}>
                <Link href={`/${s.slug}`} className={`group relative block overflow-hidden bg-brand-mist ${i < 2 ? 'aspect-[4/5] lg:aspect-[16/10]' : 'aspect-[4/5]'}`}>
                  <Image
                    src={s.cardImage}
                    alt={s.name}
                    fill
                    sizes={i < 2 ? '(min-width: 1024px) 50vw, 50vw' : '(min-width: 1024px) 25vw, 50vw'}
                    className="object-cover transition duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 lg:p-6">
                    <div>
                      <p className="hidden text-sm text-white/80 sm:block">{s.tagline}</p>
                      <p className="font-display text-3xl font-black uppercase italic leading-none text-white lg:text-5xl">{s.name}</p>
                    </div>
                    <span className="grid h-10 w-10 shrink-0 place-items-center bg-white text-brand-ink transition group-hover:bg-brand-secondary">
                      <ArrowRight size={20} />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
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

      {/* 4. Campaña de temporada (editable desde el admin) */}
      {campaign && (
        <section className="bg-brand-accent">
          <div className="mx-auto grid max-w-[1440px] items-stretch md:grid-cols-2">
            <Reveal className="flex flex-col justify-center px-4 py-14 sm:px-6 lg:px-16 lg:py-24">
              <p className="font-display text-sm font-bold uppercase tracking-[0.3em] text-white/80">Campaña</p>
              <h2 className="mt-3 font-display text-6xl font-black uppercase italic leading-[0.85] text-white lg:text-8xl">{campaign.title}</h2>
              {campaign.subtitle && <p className="mt-5 max-w-md text-lg text-white/90">{campaign.subtitle}</p>}
              {campaign.ctaHref && (
                <Link href={campaign.ctaHref} className={`${buttonClass.light} mt-8 self-start`}>
                  {campaign.ctaLabel ?? 'Ver más'} <ArrowRight size={20} className="transition group-hover:translate-x-1" />
                </Link>
              )}
            </Reveal>
            <div className="relative min-h-[460px] bg-brand-primary">
              <Image src={campaign.image} alt={campaign.title} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-contain" />
            </div>
          </div>
        </section>
      )}

      {/* 5. King Fishing */}
      <section className="relative overflow-hidden bg-kf-deep text-white">
        <Image src="/sports/nautica-2.webp" alt="" fill sizes="100vw" className="object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-kf-deep via-kf-deep/90 to-kf-deep/40" />
        <Container className="relative py-16 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.6fr] lg:items-end">
            <Reveal>
              <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.3em] text-kf-gold">
                <Fish size={18} /> Pesca y náutica
              </p>
              <h2 className="mt-3 font-display text-6xl font-black uppercase italic leading-[0.85] lg:text-8xl">
                King<br />Fishing
              </h2>
              <p className="mt-5 max-w-sm text-white/80">Cañas, reeles y señuelos probados en el río Uruguay. La línea de pesca de Yaguá.</p>
              <Link href="/king-fishing" className="mt-8 inline-flex items-center gap-3 bg-kf-gold px-6 py-3.5 font-display text-lg font-bold uppercase tracking-wide text-kf-deep transition hover:bg-white">
                Entrar a King Fishing <ArrowRight size={20} />
              </Link>
            </Reveal>
            <div className="[&_h3]:text-white [&_p]:text-white/70">
              <Carousel label="Productos King Fishing" itemClass="w-[62%] sm:w-[40%] lg:w-[31%]" dark>
                {kingFishing.map((p) => <ProductCard key={p.id} product={p} />)}
              </Carousel>
            </div>
          </div>
        </Container>
      </section>

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

      {/* 7. Embajadores */}
      <Ambassadors ambassadors={community.ambassadors} />

      {/* 8. Jugadores que vistieron la marca */}
      <Players players={community.players} />

      {/* 9. Sponsors y asociaciones */}
      <SponsorsAndAssociations sponsors={community.sponsors} associations={community.associations} />

      {/* 10. Newsletter + footer: en el layout */}
    </>
  )
}
