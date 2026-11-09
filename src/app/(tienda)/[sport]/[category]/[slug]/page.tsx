import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { Carousel } from '@/components/ui/Carousel'
import { Container, SectionTitle } from '@/components/ui/Container'
import { ProductCard } from '@/features/catalog/components/ProductCard'
import { RecentlyViewed } from '@/features/catalog/components/ProductStrip'
import { ProductView, type ProductViewData } from '@/features/catalog/components/ProductView'
import { getCompleteTheLook, getProduct, getRelated, productHref } from '@/features/catalog/queries'
import { effectivePrice } from '@/features/checkout/pricing'
import { SITE } from '@/lib/site'

type Props = { params: Promise<{ sport: string; category: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).slug)
  if (!product) return {}
  return {
    title: product.name,
    description: product.description.slice(0, 155),
    alternates: { canonical: productHref(product) },
    openGraph: { type: 'website', title: product.name, images: product.images.slice(0, 1).map((i) => i.url) },
  }
}

export default async function ProductPage({ params }: Props) {
  const { sport, category, slug } = await params
  const product = await getProduct(slug)
  if (!product || !product.active) notFound()
  // URL canónica: /deporte/categoria/producto
  if (product.sport.slug !== sport || product.category.slug !== category) permanentRedirect(productHref(product))

  const [related, look] = await Promise.all([getRelated(product), getCompleteTheLook(product)])
  const href = productHref(product)
  const data: ProductViewData = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    href,
    price: product.price,
    salePrice: product.salePrice,
    tags: product.tags,
    sportName: product.sport.name,
    categoryName: product.category.name,
    brandName: product.brand.name,
    description: product.description,
    specs: Array.isArray(product.specs) ? (product.specs as { label: string; value: string }[]) : [],
    sizeGuide: product.sizeGuide,
    images: product.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt, color: i.color })),
    variants: product.variants.map((v) => ({ id: v.id, size: v.size, color: v.color, colorHex: v.colorHex, stock: v.stock })),
  }

  // Datos estructurados (Google Shopping / resultados enriquecidos)
  const inStock = product.variants.some((v) => v.stock > 0)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images.map((i) => new URL(i.url, SITE.url).toString()),
    sku: product.variants[0]?.sku,
    brand: { '@type': 'Brand', name: product.brand.name },
    offers: {
      '@type': 'Offer',
      url: new URL(href, SITE.url).toString(),
      priceCurrency: 'ARS',
      price: effectivePrice(product),
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  }

  return (
    <Container className="py-6 lg:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <nav aria-label="Ubicación" className="mb-5 text-sm text-brand-muted">
        <Link href="/" className="hover:text-brand-ink">Inicio</Link>
        <span className="mx-2">/</span>
        <Link href={`/${product.sport.slug}`} className="hover:text-brand-ink">{product.sport.name}</Link>
        <span className="mx-2">/</span>
        <Link href={`/${product.sport.slug}/${product.category.slug}`} className="hover:text-brand-ink">{product.category.name}</Link>
      </nav>

      <ProductView product={data} />

      {look.length > 0 && (
        <section className="mt-20">
          <SectionTitle className="!text-3xl lg:!text-4xl">Completá el look</SectionTitle>
          <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {look.map((p) => <li key={p.id}><ProductCard product={p} /></li>)}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-20">
          <SectionTitle className="!text-3xl lg:!text-4xl">También te puede gustar</SectionTitle>
          <div className="mt-8">
            <Carousel label="Productos relacionados">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </Carousel>
          </div>
        </section>
      )}

      <RecentlyViewed exclude={product.slug} />
    </Container>
  )
}
