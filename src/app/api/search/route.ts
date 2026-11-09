import { NextResponse, type NextRequest } from 'next/server'
import { searchSuggestions } from '@/features/catalog/queries'

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') ?? '').slice(0, 60)
  const results = await searchSuggestions(q)
  return NextResponse.json(results, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } })
}
