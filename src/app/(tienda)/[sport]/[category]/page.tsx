import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { CatalogListing } from '@/features/catalog/components/CatalogListing'
import { SportHero } from '@/features/catalog/components/SportHero'
import type { SearchParams } from '@/features/catalog/params'
import { getSport } from '@/features/catalog/queries'

type Props = { params: Promise<{ sport: string; category: string }>; searchParams: Promise<SearchParams> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sport: s, category: c } = await params
  const sport = await getSport(s)
  const category = sport?.categories.find((x) => x.slug === c)
  if (!sport || !category) return {}
  return { title: `${category.name} de ${sport.name}`, description: `${category.name} de ${sport.name} en Yaguá. ${sport.description ?? ''}` }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { sport: s, category: c } = await params
  const sport = await getSport(s)
  const category = sport?.categories.find((x) => x.slug === c)
  if (!sport || !category) notFound()
  return (
    <>
      <SportHero sport={sport} categories={sport.categories.filter((x) => x._count.products > 0)} activeCategory={category.slug} title={category.name} />
      <section className="py-12 lg:py-16">
        <Container>
          <CatalogListing scope={{ sport: sport.slug, category: category.slug }} searchParams={await searchParams} basePath={`/${sport.slug}/${category.slug}`} />
        </Container>
      </section>
    </>
  )
}
