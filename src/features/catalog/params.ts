import type { Gender } from '@/generated/prisma/client'
import type { ProductFilters, SortKey } from './queries'

export type SearchParams = Record<string, string | string[] | undefined>

const GENDERS: Record<string, Gender> = { hombre: 'HOMBRE', mujer: 'MUJER', unisex: 'UNISEX', ninos: 'NINOS' }
const SORTS: SortKey[] = ['relevancia', 'novedades', 'precio-asc', 'precio-desc', 'mas-vendidos']

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)
const list = (v: string | string[] | undefined) => (one(v) ?? '').split(',').map((s) => s.trim()).filter(Boolean)
const int = (v: string | string[] | undefined) => {
  const n = Number(one(v))
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined
}

/** Lee los filtros de la URL (?talle=M,L&color=Negro&orden=precio-asc&pagina=2) */
export function parseFilters(sp: SearchParams): ProductFilters {
  const sort = one(sp.orden) as SortKey | undefined
  return {
    sizes: list(sp.talle),
    colors: list(sp.color),
    gender: GENDERS[one(sp.genero) ?? ''],
    brand: one(sp.marca) || undefined,
    minPrice: int(sp.min),
    maxPrice: int(sp.max),
    onSale: one(sp.oferta) === '1',
    q: one(sp.q)?.slice(0, 60) || undefined,
    sort: sort && SORTS.includes(sort) ? sort : 'relevancia',
    page: int(sp.pagina) ?? 1,
  }
}
