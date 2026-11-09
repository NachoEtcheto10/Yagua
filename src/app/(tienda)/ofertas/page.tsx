import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { CatalogListing } from '@/features/catalog/components/CatalogListing'
import type { SearchParams } from '@/features/catalog/params'
import { COMMERCE } from '@/lib/site'

export const metadata: Metadata = { title: 'Ofertas', description: 'Productos deportivos en oferta en Yaguá.' }

export default async function OffersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return (
    <>
      <section className="bg-brand-accent text-white">
        <Container className="py-14 lg:py-20">
          <p className="font-display text-sm font-bold uppercase tracking-[0.3em] text-white/80">Ofertas</p>
          <h1 className="mt-2 font-display text-7xl font-black uppercase italic leading-[0.85] lg:text-9xl">Precios<br />que pican</h1>
          <p className="mt-5 max-w-lg text-lg text-white/90">
            Y sumale {COMMERCE.transferDiscountPct}% OFF extra pagando con transferencia.
          </p>
        </Container>
      </section>
      <Container className="py-12 lg:py-16">
        <CatalogListing scope={{ onSale: true }} searchParams={await searchParams} basePath="/ofertas" />
      </Container>
    </>
  )
}
