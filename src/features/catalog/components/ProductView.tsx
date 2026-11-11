'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, CreditCard, Landmark, RotateCcw, ShieldCheck, ShoppingBag, Store } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Price } from '@/components/ui/Price'
import { useCart } from '@/features/cart/store'
import { effectivePrice, installmentAmount, transferDiscount } from '@/features/checkout/pricing'
import { cn, formatPrice } from '@/lib/format'
import { COMMERCE } from '@/lib/site'
import { sortSizes } from '@/lib/sizes'
import { useFavorites } from '../favorites'
import { FavoriteButton } from './FavoriteButton'
import { ProductGallery } from './ProductGallery'
import { ShippingCalculator } from './ShippingCalculator'
import { SIZE_GUIDES } from './size-guides'

export type ProductViewData = {
  id: string
  slug: string
  name: string
  href: string
  price: number
  salePrice: number | null
  tags: string[]
  sportName: string
  categoryName: string
  brandName: string
  description: string
  specs: { label: string; value: string }[]
  sizeGuide: string | null
  images: { id: string; url: string; alt: string; color: string | null }[]
  variants: { id: string; size: string; color: string; colorHex: string; stock: number }[]
}

const TABS = ['Descripción', 'Especificaciones', 'Guía de talles', 'Envíos y cambios'] as const

export function ProductView({ product }: { product: ProductViewData }) {
  const colors = useMemo(() => {
    const m = new Map<string, string>()
    for (const v of product.variants) if (!m.has(v.color)) m.set(v.color, v.colorHex)
    // Mismo orden que las fotos: el primer color es el principal
    const pos = (c: string) => {
      const i = product.images.findIndex((img) => img.color === c)
      return i < 0 ? Infinity : i
    }
    return [...m].map(([name, hex]) => ({ name, hex })).sort((a, b) => pos(a.name) - pos(b.name))
  }, [product.variants, product.images])
  const sizes = useMemo(() => sortSizes([...new Set(product.variants.map((v) => v.size))]), [product.variants])
  const singleSize = sizes.length === 1

  const [color, setColor] = useState(colors[0]?.name ?? '')
  const [size, setSize] = useState<string | null>(singleSize ? sizes[0] : null)
  const [qty, setQty] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [added, setAdded] = useState(false)
  const [tab, setTab] = useState<(typeof TABS)[number]>('Descripción')
  const add = useCart((s) => s.add)
  const addRecent = useFavorites((s) => s.addRecent)

  useEffect(() => addRecent(product.slug), [addRecent, product.slug])

  const images = useMemo(() => {
    const own = product.images.filter((i) => i.color === color)
    return own.length ? own : product.images
  }, [product.images, color])

  const variant = product.variants.find((v) => v.color === color && v.size === size)
  const stockFor = (s: string) => product.variants.find((v) => v.color === color && v.size === s)?.stock ?? 0
  const price = effectivePrice(product)
  const tabs = TABS.filter((t) => t !== 'Guía de talles' || (product.sizeGuide && SIZE_GUIDES[product.sizeGuide]))

  const onAdd = () => {
    if (!variant) {
      setError('Elegí un talle')
      return
    }
    if (variant.stock < 1) return
    add(
      {
        variantId: variant.id,
        productId: product.id,
        name: product.name,
        href: product.href,
        image: images[0]?.url ?? product.images[0]?.url ?? '',
        size: variant.size,
        color: variant.color,
        unitPrice: price,
        maxStock: variant.stock,
      },
      qty,
    )
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  // [&>*]:min-w-0: las columnas pueden achicarse más que su contenido (si no, las miniaturas ensanchan la página en el celular)
  return (
    <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-14 [&>*]:min-w-0">
      <ProductGallery images={images} />

      <div>
        <p className="text-sm text-brand-muted">{product.sportName} · {product.categoryName} · {product.brandName}</p>
        <div className="mt-2 flex items-start justify-between gap-4">
          <h1 className="font-display text-4xl font-extrabold uppercase italic leading-none lg:text-5xl">{product.name}</h1>
          <FavoriteButton slug={product.slug} className="shrink-0 border border-brand-line" size={20} />
        </div>
        <Price price={product.price} salePrice={product.salePrice} size="lg" className="mt-5" />
        <p className="mt-1 text-xs text-brand-muted">Precio final con IVA incluido</p>

        {/* Calculador de cuotas */}
        <div className="mt-5 space-y-1.5 bg-brand-mist p-4 text-sm">
          {COMMERCE.interestFreeInstallments.map((n) => (
            <p key={n} className="flex items-center gap-2">
              <CreditCard size={16} className="shrink-0" />
              <span><strong>{n} cuotas sin interés</strong> de {formatPrice(installmentAmount(price, n))}</span>
            </p>
          ))}
          <p className="flex items-center gap-2">
            <Landmark size={16} className="shrink-0" />
            <span><strong>{formatPrice(price - transferDiscount(price))}</strong> pagando con transferencia ({COMMERCE.transferDiscountPct}% OFF)</span>
          </p>
        </div>

        {/* Color */}
        {colors.length > 0 && (
          <fieldset className="mt-6">
            <legend className="text-sm"><span className="font-semibold">Color:</span> {color}</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => {
                    setColor(c.name)
                    if (!singleSize) setSize(null)
                    setError(null)
                  }}
                  aria-pressed={c.name === color}
                  aria-label={c.name}
                  title={c.name}
                  className={cn('grid h-11 w-11 place-items-center rounded-full ring-offset-2 transition', c.name === color ? 'ring-2 ring-brand-ink' : 'hover:ring-1 hover:ring-brand-line')}
                >
                  <span className="h-9 w-9 rounded-full border border-black/15" style={{ background: c.hex }} />
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {/* Talle */}
        {!singleSize && (
          <fieldset className="mt-6">
            <div className="flex items-center justify-between">
              <legend className="text-sm font-semibold">Talle</legend>
              {product.sizeGuide && SIZE_GUIDES[product.sizeGuide] && (
                <button type="button" onClick={() => { setTab('Guía de talles'); document.getElementById('tabs')?.scrollIntoView({ behavior: 'smooth' }) }} className="text-sm underline underline-offset-4">
                  Guía de talles
                </button>
              )}
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {sizes.map((s) => {
                const stock = stockFor(s)
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={stock < 1}
                    onClick={() => {
                      setSize(s)
                      setQty(1)
                      setError(null)
                    }}
                    aria-pressed={s === size}
                    className={cn(
                      'h-12 border text-sm font-semibold transition',
                      s === size ? 'border-brand-ink bg-brand-ink text-white' : 'border-brand-line hover:border-brand-ink',
                      stock < 1 && 'cursor-not-allowed text-brand-muted line-through opacity-50',
                    )}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </fieldset>
        )}

        {/* Stock */}
        <p className="mt-4 min-h-5 text-sm" aria-live="polite">
          {variant ? (
            variant.stock < 1 ? <span className="text-brand-accent">Sin stock en este talle</span>
            : variant.stock <= 3 ? <span className="font-semibold text-brand-accent">¡Últimas {variant.stock} unidades!</span>
            : <span className="text-brand-muted">Stock disponible: {variant.stock} unidades</span>
          ) : error ? <span className="font-semibold text-brand-accent">{error}</span> : null}
        </p>

        {/* Agregar al carrito */}
        <div className="mt-3 flex gap-2">
          <select
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            disabled={!variant || variant.stock < 1}
            aria-label="Cantidad"
            className="h-14 w-20 border border-brand-line bg-white px-2 text-[16px] font-semibold disabled:opacity-50"
          >
            {Array.from({ length: Math.min(10, Math.max(1, variant?.stock ?? 1)) }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <motion.button
            type="button"
            onClick={onAdd}
            whileTap={{ scale: 0.97 }}
            disabled={!!variant && variant.stock < 1}
            className={cn(
              'relative flex h-14 flex-1 items-center justify-center gap-3 overflow-hidden font-display text-xl font-bold uppercase tracking-wide text-white transition disabled:bg-brand-muted',
              added ? 'bg-brand-secondary text-brand-ink' : 'bg-brand-primary hover:bg-brand-primary/85',
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              {added ? (
                <motion.span key="ok" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex items-center gap-2">
                  <Check size={22} /> Agregado
                </motion.span>
              ) : (
                <motion.span key="add" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex items-center gap-2">
                  <ShoppingBag size={20} /> Agregar al carrito
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        <ul className="mt-6 grid gap-2 text-sm text-brand-muted">
          <li className="flex items-center gap-2"><Store size={16} /> Retiro gratis en el local</li>
          <li className="flex items-center gap-2"><RotateCcw size={16} /> Cambios dentro de los 30 días</li>
          <li className="flex items-center gap-2"><ShieldCheck size={16} /> Compra protegida con Mercado Pago</li>
        </ul>

        <div className="mt-6"><ShippingCalculator price={price} /></div>

        {/* Pestañas */}
        <div id="tabs" className="mt-8 scroll-mt-24">
          <div role="tablist" className="scrollbar-none flex gap-5 overflow-x-auto border-b border-brand-line">
            {tabs.map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={t === tab}
                onClick={() => setTab(t)}
                className={cn('relative shrink-0 pb-3 text-sm font-semibold', t === tab ? 'text-brand-ink' : 'text-brand-muted')}
              >
                {t}
                {t === tab && <motion.span layoutId="pdp-tab" className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-ink" />}
              </button>
            ))}
          </div>
          <div role="tabpanel" className="py-5 text-sm leading-relaxed">
            {tab === 'Descripción' && <p className="whitespace-pre-line">{product.description}</p>}
            {tab === 'Especificaciones' && (
              <dl className="divide-y divide-brand-line">
                {product.specs.map((s) => (
                  <div key={s.label} className="flex justify-between gap-4 py-2.5">
                    <dt className="text-brand-muted">{s.label}</dt>
                    <dd className="text-right font-medium">{s.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {tab === 'Guía de talles' && product.sizeGuide && SIZE_GUIDES[product.sizeGuide] && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-brand-ink">
                      {SIZE_GUIDES[product.sizeGuide].head.map((h) => <th key={h} className="py-2 pr-4 font-semibold">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {SIZE_GUIDES[product.sizeGuide].rows.map((r) => (
                      <tr key={r[0]} className="border-b border-brand-line">
                        {r.map((c, i) => <td key={i} className="py-2 pr-4 tabular-nums">{c}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-3 text-xs text-brand-muted">{SIZE_GUIDES[product.sizeGuide].note}</p>
              </div>
            )}
            {tab === 'Envíos y cambios' && (
              <div className="space-y-2">
                <p>Envíos a todo el país. Gratis en compras desde {formatPrice(COMMERCE.freeShippingFrom)}. En Concepción del Uruguay te lo llevamos en el día.</p>
                <p>Podés retirar sin cargo en nuestro local. Tenés 30 días para cambiar talle o color, con la prenda sin uso y con etiqueta.</p>
                <p>Si te arrepentís de la compra, tenés 10 días corridos desde que la recibís para devolverla (botón de arrepentimiento al pie de la página).</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
