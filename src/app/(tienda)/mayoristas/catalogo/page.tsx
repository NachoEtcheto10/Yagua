import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { getWholesaleAccess, getWholesaleSettings, wholesalePrice } from '@/features/wholesale/settings'
import { WholesaleStatus } from '@/features/wholesale/StatusPanel'
import { WholesaleCatalog, type WholesaleProduct } from '@/features/wholesale/WholesaleCatalog'
import { effectivePrice } from '@/features/checkout/pricing'
import { db } from '@/lib/db'

export const metadata: Metadata = { title: 'Catálogo mayorista', robots: { index: false } }

export default async function WholesaleCatalogPage() {
  const access = await getWholesaleAccess()
  if (access.state !== 'APPROVED') {
    return <Container className="py-16"><WholesaleStatus access={access} next="/mayoristas/catalogo" /></Container>
  }
  // Los precios mayoristas se calculan acá, en el servidor, solo para cuentas aprobadas
  const [settings, rows] = await Promise.all([
    getWholesaleSettings(),
    db.product.findMany({
      where: { active: true },
      orderBy: [{ sport: { sortOrder: 'asc' } }, { name: 'asc' }],
      select: {
        id: true, name: true, price: true, salePrice: true,
        sport: { select: { name: true } },
        images: { orderBy: { sortOrder: 'asc' }, take: 1, select: { url: true } },
        variants: { select: { id: true, size: true, color: true, colorHex: true, stock: true } },
      },
    }),
  ])
  const products: WholesaleProduct[] = rows.map((p) => ({
    id: p.id,
    name: p.name,
    sport: p.sport.name,
    image: p.images[0]?.url ?? null,
    listPrice: effectivePrice(p),
    wholesalePrice: wholesalePrice(p, settings.discountPct),
    variants: p.variants,
  }))
  return (
    <Container className="py-10 lg:py-14">
      <p className="font-display text-sm font-extrabold uppercase tracking-[0.2em] text-brand-turquoise-deep">{access.account.companyName}</p>
      <h1 className="mt-1 font-display text-4xl font-black uppercase sm:text-5xl">Catálogo mayorista</h1>
      <p className="mb-8 mt-2 text-brand-muted">Abrí cada producto y cargá las cantidades por talle y color.</p>
      <WholesaleCatalog products={products} minPurchase={settings.minPurchase} discountPct={settings.discountPct} />
    </Container>
  )
}
