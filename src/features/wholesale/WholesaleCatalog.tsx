'use client'
import { ChevronDown, Search, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { buttonClass } from '@/components/ui/Container'
import { cn, formatPrice } from '@/lib/format'
import { sortSizes } from '@/lib/sizes'
import { useWholesaleCart, wholesaleTotals } from './cart'

export type WholesaleProduct = {
  id: string
  name: string
  sport: string
  image: string | null
  listPrice: number
  wholesalePrice: number
  variants: { id: string; size: string; color: string; colorHex: string; stock: number }[]
}

/** Catálogo mayorista: precios mayoristas y carga de cantidades por talle y color */
export function WholesaleCatalog({ products, minPurchase, discountPct }: { products: WholesaleProduct[]; minPurchase: number; discountPct: number }) {
  const [q, setQ] = useState('')
  const [sport, setSport] = useState('Todos')
  const [open, setOpen] = useState<string | null>(null)
  const lines = useWholesaleCart((s) => s.lines)
  const setQty = useWholesaleCart((s) => s.setQty)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const sports = useMemo(() => ['Todos', ...new Set(products.map((p) => p.sport))], [products])
  const shown = products.filter((p) => (sport === 'Todos' || p.sport === sport) && p.name.toLowerCase().includes(q.trim().toLowerCase()))
  const qtyOf = (variantId: string) => lines.find((l) => l.variantId === variantId)?.quantity ?? 0
  const { units, subtotal } = wholesaleTotals(mounted ? lines : [])
  const missing = Math.max(0, minPurchase - subtotal)

  return (
    <div className="pb-28">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Buscar productos</span>
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre…" className="w-full border border-brand-line py-3 pl-10 pr-3 outline-none focus:border-brand-ink" />
        </label>
        <div className="scrollbar-none flex gap-2 overflow-x-auto">
          {sports.map((s) => (
            <button key={s} type="button" onClick={() => setSport(s)} className={cn('shrink-0 border px-3.5 py-2 text-sm font-semibold', sport === s ? 'border-brand-ink bg-brand-ink text-white' : 'border-brand-line hover:border-brand-ink')}>
              {s}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-4 text-sm text-brand-muted">{shown.length} productos · precios mayoristas con {discountPct}% menos que la lista, IVA incluido</p>

      <ul className="mt-4 divide-y divide-brand-line border-y border-brand-line">
        {shown.map((p) => {
          const isOpen = open === p.id
          const inCart = mounted ? p.variants.reduce((n, v) => n + qtyOf(v.id), 0) : 0
          const colors = [...new Map(p.variants.map((v) => [v.color, v.colorHex])).entries()]
          const sizes = sortSizes([...new Set(p.variants.map((v) => v.size))])
          return (
            <li key={p.id}>
              <button type="button" onClick={() => setOpen(isOpen ? null : p.id)} aria-expanded={isOpen} className="flex w-full items-center gap-4 py-3 text-left">
                <span className="relative h-16 w-14 shrink-0 overflow-hidden bg-white">
                  {p.image && <Image src={p.image} alt="" fill sizes="56px" className="object-cover" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{p.name}</span>
                  <span className="text-xs text-brand-muted">{p.sport}</span>
                </span>
                <span className="text-right tabular-nums">
                  <span className="block text-xs text-brand-muted line-through">{formatPrice(p.listPrice)}</span>
                  <span className="font-display text-lg font-black">{formatPrice(p.wholesalePrice)}</span>
                </span>
                {inCart > 0 && <span className="grid h-7 min-w-7 place-items-center rounded-full bg-brand-turquoise px-2 text-xs font-bold">{inCart}</span>}
                <ChevronDown size={20} className={cn('shrink-0 transition', isOpen && 'rotate-180')} />
              </button>
              {isOpen && (
                <div className="overflow-x-auto pb-5">
                  <table className="text-sm">
                    <thead>
                      <tr><th className="pr-3 text-left text-xs font-semibold uppercase text-brand-muted">Color \ Talle</th>{sizes.map((s) => <th key={s} className="px-1 text-center text-xs font-semibold">{s}</th>)}</tr>
                    </thead>
                    <tbody>
                      {colors.map(([color, hex]) => (
                        <tr key={color}>
                          <td className="py-1 pr-3"><span className="flex items-center gap-2 whitespace-nowrap"><span className="h-4 w-4 rounded-full border border-brand-line" style={{ background: hex }} />{color}</span></td>
                          {sizes.map((size) => {
                            const v = p.variants.find((x) => x.color === color && x.size === size)
                            if (!v) return <td key={size} className="px-1 text-center text-brand-line">—</td>
                            return (
                              <td key={size} className="px-1 py-1">
                                <input
                                  type="number"
                                  min={0}
                                  max={v.stock}
                                  inputMode="numeric"
                                  aria-label={`${p.name} ${color} talle ${size} (stock ${v.stock})`}
                                  title={`Stock: ${v.stock}`}
                                  disabled={v.stock === 0}
                                  value={mounted ? qtyOf(v.id) || '' : ''}
                                  placeholder={v.stock === 0 ? '×' : '0'}
                                  onChange={(e) => setQty({ variantId: v.id, productId: p.id, name: p.name, image: p.image, size, color, unitPrice: p.wholesalePrice, maxStock: v.stock }, Number(e.target.value) || 0)}
                                  className="h-10 w-16 border border-brand-line text-center tabular-nums outline-none focus:border-brand-ink disabled:bg-brand-mist"
                                />
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      {/* Barra del pedido, siempre visible */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-brand-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
          <div className="min-w-0 text-sm">
            <p><strong className="font-display text-xl font-black tabular-nums">{formatPrice(subtotal)}</strong> · {units} unidades</p>
            <div className="mt-1 h-1.5 w-56 max-w-full overflow-hidden rounded-full bg-brand-mist">
              <div className="h-full bg-brand-turquoise transition-all" style={{ width: `${Math.min(100, (subtotal / minPurchase) * 100)}%` }} />
            </div>
            <p className="mt-1 text-xs text-brand-muted">{missing > 0 ? `Te faltan ${formatPrice(missing)} para la compra mínima (${formatPrice(minPurchase)})` : 'Compra mínima alcanzada'}</p>
          </div>
          <Link href="/mayoristas/pedido" aria-disabled={units === 0} className={cn(buttonClass.primary, units === 0 && 'pointer-events-none opacity-40')}>
            <ShoppingBag size={18} /> Ver pedido
          </Link>
        </div>
      </div>
    </div>
  )
}
