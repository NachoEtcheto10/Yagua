import Link from 'next/link'
import { Reveal } from '@/components/ui/Reveal'
import { cn } from '@/lib/format'
import { parseFilters, type SearchParams } from '../params'
import { getFilterOptions, listProducts, type ProductFilters } from '../queries'
import { Filters, SortSelect } from './Filters'
import { ProductCard } from './ProductCard'

/** Grilla de productos con filtros, orden y paginación. Lee todo de la URL. */
export async function CatalogListing({
  scope,
  searchParams,
  basePath,
  hideGender,
}: {
  scope: Pick<ProductFilters, 'sport' | 'category' | 'onSale'>
  searchParams: SearchParams
  basePath: string
  hideGender?: boolean
}) {
  const filters = { ...parseFilters(searchParams), ...scope, onSale: scope.onSale || parseFilters(searchParams).onSale }
  const [result, options] = await Promise.all([
    listProducts({ ...filters, pageSize: 12 }),
    getFilterOptions({ sport: scope.sport, category: scope.category, q: filters.q, onSale: scope.onSale }),
  ])

  const pageHref = (page: number) => {
    const sp = new URLSearchParams()
    for (const [k, v] of Object.entries(searchParams)) if (typeof v === 'string' && k !== 'pagina') sp.set(k, v)
    if (page > 1) sp.set('pagina', String(page))
    return `${basePath}${sp.size ? `?${sp}` : ''}`
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr] xl:grid-cols-[260px_1fr]">
      <Filters options={options} total={result.total} hideGender={hideGender} />
      <div>
        <div className="mb-6 flex items-center justify-between gap-3">
          <p className="text-sm text-brand-muted">
            <strong className="text-brand-ink">{result.total}</strong> {result.total === 1 ? 'producto' : 'productos'}
          </p>
          <SortSelect />
        </div>
        {result.items.length === 0 ? (
          <div className="bg-brand-mist p-10 text-center">
            <p className="font-display text-2xl font-bold uppercase">No encontramos productos</p>
            <p className="mt-2 text-sm text-brand-muted">Probá quitando algún filtro.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 md:grid-cols-3 xl:grid-cols-4">
            {result.items.map((p, i) => (
              <Reveal as="li" key={p.id} delay={(i % 4) * 0.05} y={16}>
                <ProductCard product={p} priority={i < 4} />
              </Reveal>
            ))}
          </ul>
        )}
        {result.pageCount > 1 && (
          <nav className="mt-12 flex items-center justify-center gap-1" aria-label="Páginas">
            {Array.from({ length: result.pageCount }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                href={pageHref(n)}
                aria-current={n === result.page ? 'page' : undefined}
                className={cn('grid h-10 w-10 place-items-center border text-sm font-semibold', n === result.page ? 'border-brand-ink bg-brand-ink text-white' : 'border-brand-line hover:border-brand-ink')}
              >
                {n}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </div>
  )
}
