import { Plus, Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { btn, Card, Empty, input, PageHeader, td, th } from '@/features/admin/components/ui'
import { db } from '@/lib/db'
import { cn, formatPrice } from '@/lib/format'
import type { Prisma } from '@/generated/prisma/client'

export const metadata = { title: 'Productos' }

const PAGE = 25
type SP = Promise<{ q?: string; deporte?: string; estado?: string; pagina?: string }>

export default async function ProductsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const q = sp.q?.trim()
  const page = Math.max(1, Number(sp.pagina) || 1)
  const where: Prisma.ProductWhereInput = {
    ...(q && { OR: [{ name: { contains: q, mode: 'insensitive' } }, { variants: { some: { sku: { contains: q, mode: 'insensitive' } } } }] }),
    ...(sp.deporte && { sport: { slug: sp.deporte } }),
    ...(sp.estado === 'ocultos' && { active: false }),
    ...(sp.estado === 'activos' && { active: true }),
    ...(sp.estado === 'sin-stock' && { variants: { none: { stock: { gt: 0 } } } }),
    ...(sp.estado === 'poco-stock' && { variants: { some: { stock: { lte: 2 } } } }),
  }
  const [products, total, sports] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: [{ active: 'desc' }, { updatedAt: 'desc' }],
      skip: (page - 1) * PAGE,
      take: PAGE,
      select: {
        id: true, name: true, price: true, salePrice: true, active: true,
        sport: { select: { name: true } }, category: { select: { name: true } },
        images: { take: 1, orderBy: { sortOrder: 'asc' }, select: { url: true } },
        variants: { select: { stock: true } },
      },
    }),
    db.product.count({ where }),
    db.sport.findMany({ orderBy: { sortOrder: 'asc' }, select: { slug: true, name: true } }),
  ])
  const pages = Math.max(1, Math.ceil(total / PAGE))
  const href = (p: Record<string, string | undefined>) => {
    const u = new URLSearchParams()
    for (const [k, v] of Object.entries({ q, deporte: sp.deporte, estado: sp.estado, ...p })) if (v) u.set(k, v)
    return `/admin/productos${u.size ? `?${u}` : ''}`
  }

  return (
    <>
      <PageHeader title="Productos" subtitle={`${total} ${total === 1 ? 'producto' : 'productos'}`} actions={<Link href="/admin/productos/nuevo" className={btn.primary}><Plus size={16} /> Nuevo producto</Link>} />
      <Card>
        <form className="grid gap-2 border-b border-brand-line p-3 sm:grid-cols-[1fr_180px_160px_auto]" action="/admin/productos">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input name="q" defaultValue={q} placeholder="Buscar por nombre o SKU" className={cn(input, 'pl-9')} />
          </div>
          <select name="deporte" defaultValue={sp.deporte ?? ''} className={input} aria-label="Deporte">
            <option value="">Todos los deportes</option>
            {sports.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
          </select>
          <select name="estado" defaultValue={sp.estado ?? ''} className={input} aria-label="Estado">
            <option value="">Todos</option>
            <option value="activos">Visibles</option>
            <option value="ocultos">Ocultos</option>
            <option value="poco-stock">Poco stock</option>
            <option value="sin-stock">Sin stock</option>
          </select>
          <button type="submit" className={btn.secondary}>Filtrar</button>
        </form>
        {products.length === 0 ? <Empty>No hay productos con esos filtros.</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-brand-line"><tr><th className={th}>Producto</th><th className={th}>Deporte</th><th className={`${th} text-right`}>Precio</th><th className={`${th} text-right`}>Stock</th><th className={th}>Estado</th></tr></thead>
              <tbody className="divide-y divide-brand-line">
                {products.map((p) => {
                  const stock = p.variants.reduce((n, v) => n + v.stock, 0)
                  const out = p.variants.filter((v) => v.stock === 0).length
                  return (
                    <tr key={p.id} className="hover:bg-brand-mist/60">
                      <td className={td}>
                        <Link href={`/admin/productos/${p.id}`} className="flex items-center gap-3">
                          <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-brand-mist">
                            {p.images[0] && <Image src={p.images[0].url} alt="" fill sizes="48px" className="object-cover" />}
                          </span>
                          <span className="font-semibold hover:underline">{p.name}</span>
                        </Link>
                      </td>
                      <td className={td}>{p.sport.name}<p className="text-xs text-brand-muted">{p.category.name}</p></td>
                      <td className={`${td} text-right tabular-nums`}>
                        {p.salePrice ? <><span className="font-semibold text-brand-accent">{formatPrice(p.salePrice)}</span><p className="text-xs text-brand-muted line-through">{formatPrice(p.price)}</p></> : formatPrice(p.price)}
                      </td>
                      <td className={`${td} text-right tabular-nums`}>
                        <span className={cn('font-semibold', stock === 0 ? 'text-red-700' : stock <= 5 && 'text-amber-700')}>{stock}</span>
                        {out > 0 && stock > 0 && <p className="text-xs text-brand-muted">{out} sin stock</p>}
                      </td>
                      <td className={td}>
                        <span className={cn('inline-block rounded-full px-2.5 py-1 text-xs font-semibold', p.active ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-700')}>{p.active ? 'Visible' : 'Oculto'}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {pages > 1 && (
        <nav className="mt-4 flex flex-wrap justify-center gap-1" aria-label="Páginas">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <Link key={n} href={href({ pagina: n > 1 ? String(n) : undefined })} aria-current={n === page ? 'page' : undefined} className={cn('grid h-9 w-9 place-items-center rounded border text-sm font-semibold', n === page ? 'border-brand-ink bg-brand-ink text-white' : 'border-brand-line bg-white')}>{n}</Link>
          ))}
        </nav>
      )}
    </>
  )
}
