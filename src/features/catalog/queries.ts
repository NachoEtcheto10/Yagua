import 'server-only'
import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import { db } from '@/lib/db'
import type { Gender, Prisma } from '@/generated/prisma/client'
import { sortSizes } from '@/lib/sizes'

// ───────────────────────────── Caché
// El catálogo cambia poco: se guarda en caché unos minutos para que navegar entre deportes sea instantáneo.
// TODO (Fase 2): al editar productos desde el admin, llamar a revalidateTag(CATALOG_TAG).
// El precio y el stock se vuelven a validar contra la base en el checkout.
export const CATALOG_TAG = 'catalog'

function cached<A extends unknown[], R>(name: string, fn: (...args: A) => Promise<R>) {
  return cache(unstable_cache(fn, ['catalog', name], { revalidate: 120, tags: [CATALOG_TAG] }))
}

// ───────────────────────────── Tipos para la UI

export type ProductCardData = {
  id: string
  slug: string
  name: string
  price: number
  salePrice: number | null
  tags: string[]
  href: string
  sportName: string
  images: { url: string; alt: string }[]
  colors: { name: string; hex: string }[]
  inStock: boolean
}

const cardInclude = {
  sport: { select: { slug: true, name: true } },
  category: { select: { slug: true } },
  images: { orderBy: { sortOrder: 'asc' }, select: { url: true, alt: true, color: true } },
  variants: { select: { color: true, colorHex: true, stock: true } },
} satisfies Prisma.ProductInclude

type CardRow = Prisma.ProductGetPayload<{ include: typeof cardInclude }>

export function productHref(p: { slug: string; sport: { slug: string }; category: { slug: string } }) {
  return `/${p.sport.slug}/${p.category.slug}/${p.slug}`
}

function toCard(p: CardRow): ProductCardData {
  const colors = new Map<string, string>()
  for (const img of p.images) {
    const hex = img.color && p.variants.find((v) => v.color === img.color)?.colorHex
    if (img.color && hex && !colors.has(img.color)) colors.set(img.color, hex)
  }
  for (const v of p.variants) if (!colors.has(v.color)) colors.set(v.color, v.colorHex)
  // Foto principal + una segunda para el hover (preferentemente del mismo color)
  const first = p.images[0]
  const second = p.images.find((i, idx) => idx > 0 && i.color === first?.color) ?? p.images[1]
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    salePrice: p.salePrice,
    tags: p.tags,
    href: productHref(p),
    sportName: p.sport.name,
    images: [first, second].filter(Boolean).map((i) => ({ url: i!.url, alt: i!.alt })),
    colors: [...colors].map(([name, hex]) => ({ name, hex })),
    inStock: p.variants.some((v) => v.stock > 0),
  }
}

// ───────────────────────────── Deportes

export const getSports = cached('getSports', async () =>
  db.sport.findMany({
    where: { active: true },
    orderBy: { sortOrder: 'asc' },
    include: { categories: { orderBy: { sortOrder: 'asc' } } },
  }),
)

export const getSport = cached('getSport', async (slug: string) =>
  db.sport.findUnique({
    where: { slug },
    include: { categories: { orderBy: { sortOrder: 'asc' }, include: { _count: { select: { products: true } } } } },
  }),
)

// ───────────────────────────── Listado con filtros

export type SortKey = 'relevancia' | 'novedades' | 'precio-asc' | 'precio-desc' | 'mas-vendidos'

export type ProductFilters = {
  sport?: string
  category?: string
  gender?: Gender
  sizes?: string[]
  colors?: string[]
  brand?: string
  minPrice?: number
  maxPrice?: number
  onSale?: boolean
  q?: string
  sort?: SortKey
  page?: number
  pageSize?: number
}

function buildWhere(f: ProductFilters): Prisma.ProductWhereInput {
  const and: Prisma.ProductWhereInput[] = [{ active: true }]
  if (f.sport) and.push({ sport: { slug: f.sport } })
  if (f.category) and.push({ category: { slug: f.category } })
  if (f.gender) and.push({ gender: { in: [f.gender, 'UNISEX'] } })
  if (f.brand) and.push({ brand: { slug: f.brand } })
  if (f.onSale) and.push({ salePrice: { not: null } })
  if (f.sizes?.length) and.push({ variants: { some: { size: { in: f.sizes }, stock: { gt: 0 } } } })
  if (f.colors?.length) and.push({ variants: { some: { color: { in: f.colors } } } })
  if (f.minPrice != null) and.push({ OR: [{ salePrice: { gte: f.minPrice } }, { salePrice: null, price: { gte: f.minPrice } }] })
  if (f.maxPrice != null) and.push({ OR: [{ salePrice: { lte: f.maxPrice } }, { salePrice: null, price: { lte: f.maxPrice } }] })
  if (f.q) {
    const terms = f.q.trim().split(/\s+/).slice(0, 5)
    for (const t of terms) {
      and.push({
        OR: [
          { name: { contains: t, mode: 'insensitive' } },
          { description: { contains: t, mode: 'insensitive' } },
          { sport: { name: { contains: t, mode: 'insensitive' } } },
          { category: { name: { contains: t, mode: 'insensitive' } } },
        ],
      })
    }
  }
  return { AND: and }
}

function buildOrder(sort: SortKey = 'relevancia'): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case 'novedades':
      return [{ createdAt: 'desc' }]
    case 'precio-asc':
      return [{ price: 'asc' }]
    case 'precio-desc':
      return [{ price: 'desc' }]
    case 'mas-vendidos':
      return [{ soldCount: 'desc' }]
    default:
      return [{ soldCount: 'desc' }, { createdAt: 'desc' }]
  }
}

export const listProducts = cached('listProducts', async (f: ProductFilters) => {
  const pageSize = f.pageSize ?? 12
  const page = Math.max(1, f.page ?? 1)
  const where = buildWhere(f)
  const [rows, total] = await Promise.all([
    db.product.findMany({ where, orderBy: buildOrder(f.sort), include: cardInclude, skip: (page - 1) * pageSize, take: pageSize }),
    db.product.count({ where }),
  ])
  let items = rows.map(toCard)
  // El orden por precio debe usar el precio efectivo (oferta si existe)
  if (f.sort === 'precio-asc' || f.sort === 'precio-desc') {
    const eff = (p: ProductCardData) => p.salePrice ?? p.price
    items = items.sort((a, b) => (f.sort === 'precio-asc' ? eff(a) - eff(b) : eff(b) - eff(a)))
  }
  return { items, total, page, pageCount: Math.max(1, Math.ceil(total / pageSize)) }
})

/** Opciones disponibles para los filtros dentro de un deporte/categoría */
export const getFilterOptions = cached('getFilterOptions', async (scope: { sport?: string; category?: string; q?: string; onSale?: boolean }) => {
  const where = buildWhere(scope)
  const [variants, prices, brands] = await Promise.all([
    db.productVariant.findMany({ where: { product: where }, select: { size: true, color: true, colorHex: true }, distinct: ['size', 'color'] }),
    db.product.aggregate({ where, _min: { price: true }, _max: { price: true } }),
    db.brand.findMany({ where: { products: { some: where } }, select: { slug: true, name: true } }),
  ])
  const sizes = sortSizes([...new Set(variants.map((v) => v.size))])
  const colors = new Map<string, string>()
  for (const v of variants) if (!colors.has(v.color)) colors.set(v.color, v.colorHex)
  return {
    sizes,
    colors: [...colors].map(([name, hex]) => ({ name, hex })),
    brands,
    priceRange: [prices._min.price ?? 0, prices._max.price ?? 0] as const,
  }
})

// ───────────────────────────── Colecciones para la home

export const getNewArrivals = cached('getNewArrivals', async (take: number = 10) => {
  const rows = await db.product.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' }, include: cardInclude, take })
  return rows.map(toCard)
})

export const getBestSellers = cached('getBestSellers', async (take: number = 10) => {
  const rows = await db.product.findMany({ where: { active: true }, orderBy: { soldCount: 'desc' }, include: cardInclude, take })
  return rows.map(toCard)
})

export const getBySport = cached('getBySport', async (sport: string, take: number = 8) => {
  const rows = await db.product.findMany({
    where: { active: true, sport: { slug: sport } },
    orderBy: [{ soldCount: 'desc' }],
    include: cardInclude,
    take,
  })
  return rows.map(toCard)
})

// ───────────────────────────── Ficha de producto

export const getProduct = cached('getProduct', async (slug: string) =>
  db.product.findUnique({
    where: { slug },
    include: {
      sport: true,
      category: true,
      brand: true,
      images: { orderBy: { sortOrder: 'asc' } },
      variants: { orderBy: { sku: 'asc' } },
    },
  }),
)

export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProduct>>>

export const getRelated = cached('getRelated', async (product: { id: string; sportId: string; categoryId: string }, take: number = 8) => {
  const rows = await db.product.findMany({
    where: { active: true, id: { not: product.id }, sportId: product.sportId },
    orderBy: [{ soldCount: 'desc' }],
    include: cardInclude,
    take: take * 2,
  })
  // primero los de la misma categoría
  rows.sort((a, b) => Number(b.categoryId === product.categoryId) - Number(a.categoryId === product.categoryId))
  return rows.slice(0, take).map(toCard)
})

/** "Completá el look": productos de otros deportes/categorías que combinan (accesorios e indumentaria) */
export const getCompleteTheLook = cached('getCompleteTheLook', async (product: { id: string; categoryId: string }, take: number = 4) => {
  const rows = await db.product.findMany({
    where: {
      active: true,
      id: { not: product.id },
      categoryId: { not: product.categoryId },
      OR: [{ sport: { slug: 'accesorios' } }, { category: { slug: { in: ['indumentaria', 'shorts', 'remeras'] } } }],
    },
    orderBy: { soldCount: 'desc' },
    include: cardInclude,
    take,
  })
  return rows.map(toCard)
})

export const getCardsBySlugs = cached('getCardsBySlugs', async (slugs: string[]) => {
  if (!slugs.length) return []
  const rows = await db.product.findMany({ where: { slug: { in: slugs }, active: true }, include: cardInclude })
  return slugs.map((s) => rows.find((r) => r.slug === s)).filter(Boolean).map((r) => toCard(r!))
})

// ───────────────────────────── Búsqueda en vivo

export async function searchSuggestions(q: string) {
  if (q.trim().length < 2) return []
  const rows = await db.product.findMany({
    where: buildWhere({ q }),
    orderBy: { soldCount: 'desc' },
    take: 6,
    include: cardInclude,
  })
  return rows.map(toCard)
}
