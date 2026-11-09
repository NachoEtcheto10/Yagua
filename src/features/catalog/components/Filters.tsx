'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition, type ReactNode } from 'react'
import { cn, formatPrice } from '@/lib/format'

export type FilterOptions = {
  sizes: string[]
  colors: { name: string; hex: string }[]
  brands: { slug: string; name: string }[]
  priceRange: readonly [number, number]
}

const GENDERS = [
  ['hombre', 'Hombre'],
  ['mujer', 'Mujer'],
  ['ninos', 'Niños'],
]

const SORTS = [
  ['relevancia', 'Relevancia'],
  ['novedades', 'Novedades'],
  ['mas-vendidos', 'Más vendidos'],
  ['precio-asc', 'Menor precio'],
  ['precio-desc', 'Mayor precio'],
]

function useFilterParams() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, start] = useTransition()
  const setMany = (values: Record<string, string | null>) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(values)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    next.delete('pagina')
    start(() => router.replace(`${pathname}?${next}`, { scroll: false }))
  }
  const set = (key: string, value: string | null) => setMany({ [key]: value })
  const toggleInList = (key: string, value: string) => {
    const cur = (params.get(key) ?? '').split(',').filter(Boolean)
    const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]
    set(key, next.join(',') || null)
  }
  const clear = () => {
    const next = new URLSearchParams()
    const q = params.get('q')
    if (q) next.set('q', q)
    start(() => router.replace(`${pathname}${next.size ? `?${next}` : ''}`, { scroll: false }))
  }
  return { params, set, setMany, toggleInList, clear, pending }
}

function Group({ title, children, defaultOpen = true }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-brand-line py-4">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center justify-between font-display text-lg font-bold uppercase">
        {title}
        <ChevronDown size={18} className={cn('transition', open && 'rotate-180')} />
      </button>
      {open && <div className="pt-3">{children}</div>}
    </div>
  )
}

function FilterPanel({ options, hideGender }: { options: FilterOptions; hideGender?: boolean }) {
  const { params, set, setMany, toggleInList, clear } = useFilterParams()
  const sizes = (params.get('talle') ?? '').split(',')
  const colors = (params.get('color') ?? '').split(',')
  const [min, setMin] = useState(params.get('min') ?? '')
  const [max, setMax] = useState(params.get('max') ?? '')
  const hasAny = ['talle', 'color', 'genero', 'marca', 'min', 'max', 'oferta'].some((k) => params.get(k))

  return (
    <div>
      {hasAny && (
        <button type="button" onClick={clear} className="mb-2 text-sm font-semibold underline underline-offset-4">
          Limpiar filtros
        </button>
      )}
      <Group title="Ofertas">
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input type="checkbox" checked={params.get('oferta') === '1'} onChange={(e) => set('oferta', e.target.checked ? '1' : null)} className="h-4 w-4 accent-brand-primary" />
          Solo productos en oferta
        </label>
      </Group>
      {!hideGender && (
        <Group title="Género">
          <div className="flex flex-wrap gap-2">
            {GENDERS.map(([v, l]) => (
              <button
                key={v}
                type="button"
                onClick={() => set('genero', params.get('genero') === v ? null : v)}
                aria-pressed={params.get('genero') === v}
                className={cn('border px-3 py-1.5 text-sm', params.get('genero') === v ? 'border-brand-ink bg-brand-ink text-white' : 'border-brand-line hover:border-brand-ink')}
              >
                {l}
              </button>
            ))}
          </div>
        </Group>
      )}
      {options.sizes.length > 1 && (
        <Group title="Talle">
          <div className="grid grid-cols-4 gap-2">
            {options.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleInList('talle', s)}
                aria-pressed={sizes.includes(s)}
                className={cn('border py-2 text-sm', sizes.includes(s) ? 'border-brand-ink bg-brand-ink text-white' : 'border-brand-line hover:border-brand-ink')}
              >
                {s}
              </button>
            ))}
          </div>
        </Group>
      )}
      {options.colors.length > 1 && (
        <Group title="Color">
          <div className="grid grid-cols-2 gap-2">
            {options.colors.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => toggleInList('color', c.name)}
                aria-pressed={colors.includes(c.name)}
                className={cn('flex items-center gap-2 border px-2 py-1.5 text-left text-sm', colors.includes(c.name) ? 'border-brand-ink' : 'border-transparent hover:border-brand-line')}
              >
                <span className="h-5 w-5 shrink-0 rounded-full border border-black/15" style={{ background: c.hex }} />
                {c.name}
              </button>
            ))}
          </div>
        </Group>
      )}
      <Group title="Precio">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setMany({ min: min || null, max: max || null })
          }}
          className="flex items-end gap-2"
        >
          <label className="flex-1 text-xs text-brand-muted">
            Desde
            <input inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ''))} placeholder={String(options.priceRange[0])} className="mt-1 h-10 w-full border border-brand-line px-2 text-[16px] text-brand-ink sm:text-sm" />
          </label>
          <label className="flex-1 text-xs text-brand-muted">
            Hasta
            <input inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ''))} placeholder={String(options.priceRange[1])} className="mt-1 h-10 w-full border border-brand-line px-2 text-[16px] text-brand-ink sm:text-sm" />
          </label>
          <button type="submit" className="h-10 bg-brand-ink px-3 text-sm font-semibold text-white">OK</button>
        </form>
        <p className="mt-2 text-xs text-brand-muted">De {formatPrice(options.priceRange[0])} a {formatPrice(options.priceRange[1])}</p>
      </Group>
      {options.brands.length > 1 && (
        <Group title="Marca">
          <div className="space-y-2">
            {options.brands.map((b) => (
              <label key={b.slug} className="flex cursor-pointer items-center gap-3 text-sm">
                <input type="radio" name="marca" checked={params.get('marca') === b.slug} onChange={() => set('marca', b.slug)} className="h-4 w-4 accent-brand-primary" />
                {b.name}
              </label>
            ))}
            {params.get('marca') && (
              <button type="button" onClick={() => set('marca', null)} className="text-xs underline">Todas las marcas</button>
            )}
          </div>
        </Group>
      )}
    </div>
  )
}

export function SortSelect() {
  const { params, set } = useFilterParams()
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden text-brand-muted sm:inline">Ordenar por</span>
      <select
        value={params.get('orden') ?? 'relevancia'}
        onChange={(e) => set('orden', e.target.value === 'relevancia' ? null : e.target.value)}
        className="h-10 border border-brand-line bg-white px-2 text-[16px] font-semibold sm:text-sm"
        aria-label="Ordenar productos"
      >
        {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  )
}

/** Barra lateral en escritorio, panel deslizante en celular */
export function Filters({ options, total, hideGender }: { options: FilterOptions; total: number; hideGender?: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <aside className="hidden lg:block" aria-label="Filtros">
        <FilterPanel options={options} hideGender={hideGender} />
      </aside>
      <button type="button" onClick={() => setOpen(true)} className="flex h-10 items-center gap-2 border border-brand-ink px-4 text-sm font-semibold lg:hidden">
        <SlidersHorizontal size={16} /> Filtrar
      </button>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="absolute inset-0 bg-black/50" />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'tween', duration: 0.28 }}
              className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col bg-white"
              role="dialog"
              aria-modal="true"
              aria-label="Filtros"
            >
              <div className="flex items-center justify-between border-b border-brand-line px-5 py-3">
                <span className="font-display text-2xl font-extrabold uppercase italic">Filtrar</span>
                <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar filtros" className="grid h-10 w-10 place-items-center"><X size={22} /></button>
              </div>
              <div className="flex-1 overflow-y-auto px-5">
                <FilterPanel options={options} hideGender={hideGender} />
              </div>
              <div className="border-t border-brand-line p-4">
                <button type="button" onClick={() => setOpen(false)} className="h-12 w-full bg-brand-ink font-display text-lg font-bold uppercase text-white">
                  Ver {total} productos
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
