import { NextResponse, type NextRequest } from 'next/server'
import { getCardsBySlugs } from '@/features/catalog/queries'

// Tarjetas de productos por slug (favoritos y vistos recientemente, que viven en el navegador)
export async function GET(req: NextRequest) {
  const slugs = (req.nextUrl.searchParams.get('slugs') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => /^[a-z0-9-]{1,80}$/.test(s))
    .slice(0, 24)
  return NextResponse.json(await getCardsBySlugs(slugs))
}
