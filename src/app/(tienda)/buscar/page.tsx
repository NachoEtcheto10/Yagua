import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { CatalogListing } from '@/features/catalog/components/CatalogListing'
import type { SearchParams } from '@/features/catalog/params'

type Props = { searchParams: Promise<SearchParams> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = (await searchParams).q
  return { title: q ? `Resultados para “${q}”` : 'Todos los productos', robots: { index: !q } }
}

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams
  const q = typeof sp.q === 'string' ? sp.q : ''
  return (
    <Container className="py-10 lg:py-14">
      <p className="text-sm text-brand-muted">{q ? 'Resultados de búsqueda' : 'Catálogo'}</p>
      <h1 className="mb-10 font-display text-5xl font-black uppercase italic lg:text-6xl">{q ? `“${q}”` : 'Todos los productos'}</h1>
      <CatalogListing scope={{}} searchParams={sp} basePath="/buscar" />
    </Container>
  )
}
