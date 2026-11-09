import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { SITE } from '@/lib/site'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [sports, products] = await Promise.all([
    db.sport.findMany({ where: { active: true }, include: { categories: true } }),
    db.product.findMany({ where: { active: true }, select: { slug: true, updatedAt: true, sport: { select: { slug: true } }, category: { select: { slug: true } } } }),
  ])
  const url = (path: string) => new URL(path, SITE.url).toString()
  return [
    { url: url('/'), changeFrequency: 'daily', priority: 1 },
    ...['/ofertas', '/personalizados', '/comunidad'].map((p) => ({ url: url(p), changeFrequency: 'weekly' as const })),
    ...sports.flatMap((s) => [
      { url: url(`/${s.slug}`), changeFrequency: 'daily' as const, priority: 0.8 },
      ...s.categories.map((c) => ({ url: url(`/${s.slug}/${c.slug}`), changeFrequency: 'daily' as const })),
    ]),
    ...products.map((p) => ({ url: url(`/${p.sport.slug}/${p.category.slug}/${p.slug}`), lastModified: p.updatedAt, priority: 0.7 })),
  ]
}
