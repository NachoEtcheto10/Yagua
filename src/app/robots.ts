import type { MetadataRoute } from 'next'
import { INDEXABLE, SITE } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  if (!INDEXABLE) return { rules: { userAgent: '*', disallow: '/' } }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/checkout', '/cuenta', '/admin', '/api/'] },
    sitemap: new URL('/sitemap.xml', SITE.url).toString(),
  }
}
