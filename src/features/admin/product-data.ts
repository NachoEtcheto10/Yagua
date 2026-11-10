import 'server-only'
import { db } from '@/lib/db'
import type { Options, ProductFormValue } from './components/ProductForm'

export async function getProductOptions(): Promise<Options> {
  const [sports, brands] = await Promise.all([
    db.sport.findMany({ orderBy: { sortOrder: 'asc' }, select: { id: true, name: true, categories: { orderBy: { sortOrder: 'asc' }, select: { id: true, name: true } } } }),
    db.brand.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])
  return { sports, brands }
}

export async function getProductForm(id: string): Promise<ProductFormValue | null> {
  const p = await db.product.findUnique({
    where: { id },
    include: { variants: { orderBy: { sku: 'asc' } }, images: { orderBy: { sortOrder: 'asc' } } },
  })
  if (!p) return null
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    sportId: p.sportId,
    categoryId: p.categoryId,
    brandId: p.brandId,
    gender: p.gender,
    price: p.price,
    salePrice: p.salePrice,
    tags: p.tags,
    sizeGuide: (p.sizeGuide ?? '') as ProductFormValue['sizeGuide'],
    active: p.active,
    specs: Array.isArray(p.specs) ? (p.specs as { label: string; value: string }[]) : [],
    variants: p.variants.map((v) => ({ id: v.id, size: v.size, color: v.color, colorHex: v.colorHex, stock: v.stock, sku: v.sku })),
    images: p.images.map((i) => ({ url: i.url, alt: i.alt, color: i.color })),
  }
}
