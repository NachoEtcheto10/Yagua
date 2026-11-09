import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Carousel } from '@/components/ui/Carousel'
import { Container, SectionTitle } from '@/components/ui/Container'
import { CatalogListing } from '@/features/catalog/components/CatalogListing'
import { ProductCard } from '@/features/catalog/components/ProductCard'
import { SportHero } from '@/features/catalog/components/SportHero'
import type { SearchParams } from '@/features/catalog/params'
import { getBySport, getSport } from '@/features/catalog/queries'

type Props = { params: Promise<{ sport: string }>; searchParams: Promise<SearchParams> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const sport = await getSport((await params).sport)
  if (!sport) return {}
  return {
    title: sport.name,
    description: sport.description ?? undefined,
    openGraph: { images: [sport.heroImage] },
  }
}

export default async function SportPage({ params, searchParams }: Props) {
  const { sport: slug } = await params
  const sport = await getSport(slug)
  if (!sport) notFound()
  const [featured, sp] = await Promise.all([getBySport(slug, 8), searchParams])
  const filtered = Object.keys(sp).length > 0

  return (
    <>
      <SportHero sport={sport} categories={sport.categories.filter((c) => c._count.products > 0)} />
      {!filtered && featured.length > 3 && (
        <section className={sport.isSubBrand ? 'bg-kf-deep py-14 text-white [&_h3]:text-white [&_p]:text-white/70' : 'py-14'}>
          <Container>
            <SectionTitle light={sport.isSubBrand}>Destacados</SectionTitle>
            <div className="mt-8">
              <Carousel label={`Destacados de ${sport.name}`} dark={sport.isSubBrand}>
                {featured.map((p) => <ProductCard key={p.id} product={p} />)}
              </Carousel>
            </div>
          </Container>
        </section>
      )}
      <section className="py-12 lg:py-16">
        <Container>
          <SectionTitle className="mb-8">Todo {sport.name}</SectionTitle>
          <CatalogListing scope={{ sport: slug }} searchParams={sp} basePath={`/${slug}`} />
        </Container>
      </section>
    </>
  )
}
