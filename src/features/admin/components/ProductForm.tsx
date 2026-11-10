'use client'
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Plus, Trash2, Wand2 } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useMemo, useRef, useState, useTransition } from 'react'
import { cn, discountPct, formatPrice } from '@/lib/format'
import { sortSizes } from '@/lib/sizes'
import { deleteProduct, saveProduct, uploadProductImage } from '../product-actions'
import { GENDER_LABEL, GENDERS, slugify, TAG_LABEL, TAGS, type ProductInput } from '../product-schema'
import { btn, Card, input } from './ui'

type Variant = { id?: string; size: string; color: string; colorHex: string; stock: number | string; sku?: string }
type Img = { url: string; alt: string; color: string | null }
export type ProductFormValue = Omit<ProductInput, 'variants' | 'images' | 'price' | 'salePrice'> & {
  price: number | string
  salePrice: number | string | null
  variants: Variant[]
  images: Img[]
}
export type Options = {
  sports: { id: string; name: string; categories: { id: string; name: string }[] }[]
  brands: { id: string; name: string }[]
}

const COMMON_COLORS: Record<string, string> = {
  negro: '#1b181c', blanco: '#f7f7f5', gris: '#8a8a8f', azul: '#1f4fbf', celeste: '#8ec5ee', rojo: '#d93a35', rosa: '#f08bb4',
  fucsia: '#e0287d', verde: '#3fa34d', lima: '#bcd637', amarillo: '#f2cf3a', naranja: '#f47b20', violeta: '#7a5cc4', lila: '#b9a0e0',
  bordo: '#7a1f2b', marron: '#7b5233', beige: '#d9c7a7', caqui: '#a59a6c', aqua: '#4cc9c0', turquesa: '#25b5b0', coral: '#ff7f6b', marino: '#1d2b4f',
}
const hexFor = (name: string) => COMMON_COLORS[name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().split(' ')[0]] ?? '#8a8a8f'

const SIZE_PRESETS: { label: string; sizes: string[] }[] = [
  { label: 'Ropa XS–XXL', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  { label: 'Niños 4–16', sizes: ['4', '6', '8', '10', '12', '14', '16'] },
  { label: 'Calzado 35–45', sizes: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'] },
  { label: 'Talle único', sizes: ['Único'] },
]

/** Achica la foto en el navegador (máx. 1600 px, WebP) antes de subirla */
async function shrink(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/webp', 0.85))
  if (!blob) return file
  return new File([blob], file.name.replace(/\.\w+$/, '') + '.webp', { type: 'image/webp' })
}

function Field({ label, error, children, hint, className }: { label: string; error?: string; children: React.ReactNode; hint?: string; className?: string }) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-brand-muted">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-red-700">{error}</span>}
    </label>
  )
}

export function ProductForm({ initial, options, storageReady }: { initial: ProductFormValue; options: Options; storageReady: boolean }) {
  const router = useRouter()
  const [v, setV] = useState<ProductFormValue>(initial)
  const [slugTouched, setSlugTouched] = useState(!!initial.id)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [saving, startSave] = useTransition()
  const [uploading, setUploading] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  // generador de variantes
  const [genColors, setGenColors] = useState('')
  const [genSizes, setGenSizes] = useState('')
  const [genStock, setGenStock] = useState('5')

  const set = <K extends keyof ProductFormValue>(k: K, value: ProductFormValue[K]) => setV((s) => ({ ...s, [k]: value }))
  const sport = options.sports.find((s) => s.id === v.sportId)
  const colors = useMemo(() => [...new Set(v.variants.map((x) => x.color.trim()).filter(Boolean))], [v.variants])
  const totalStock = v.variants.reduce((n, x) => n + (Number(x.stock) || 0), 0)
  const off = discountPct(Number(v.price) || 0, Number(v.salePrice) || null)

  const updateVariant = (i: number, patch: Partial<Variant>) => set('variants', v.variants.map((x, j) => (j === i ? { ...x, ...patch } : x)))

  const generate = () => {
    const cs = genColors.split(',').map((s) => s.trim()).filter(Boolean)
    const ss = genSizes.split(',').map((s) => s.trim()).filter(Boolean)
    if (!cs.length || !ss.length) return
    const exists = new Set(v.variants.map((x) => `${x.color.toLowerCase()}|${x.size.toLowerCase()}`))
    const added: Variant[] = []
    for (const c of cs) for (const s of ss) if (!exists.has(`${c.toLowerCase()}|${s.toLowerCase()}`)) added.push({ color: c, colorHex: v.variants.find((x) => x.color === c)?.colorHex ?? hexFor(c), size: s, stock: Number(genStock) || 0 })
    set('variants', [...v.variants, ...added])
    setGenColors('')
  }

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setMessage(null)
    const list = [...files].slice(0, 20 - v.images.length)
    setUploading((n) => n + list.length)
    for (const f of list) {
      try {
        const fd = new FormData()
        fd.set('file', await shrink(f))
        const r = await uploadProductImage(fd)
        if (r.ok) setV((s) => ({ ...s, images: [...s.images, { url: r.url, alt: s.name, color: colors.length === 1 ? colors[0] : null }] }))
        else setMessage({ kind: 'error', text: r.error })
      } catch {
        setMessage({ kind: 'error', text: `No se pudo procesar ${f.name}` })
      } finally {
        setUploading((n) => n - 1)
      }
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  const moveImage = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= v.images.length) return
    const next = [...v.images]
    ;[next[i], next[j]] = [next[j], next[i]]
    set('images', next)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    startSave(async () => {
      const r = await saveProduct({ ...v, price: v.price as number, salePrice: v.salePrice as number | null, variants: v.variants as ProductInput['variants'] })
      if (!r.ok) {
        setErrors(r.fieldErrors ?? {})
        setMessage({ kind: 'error', text: r.error })
        return
      }
      setErrors({})
      setMessage({ kind: 'ok', text: 'Producto guardado' })
      if (!v.id) router.replace(`/admin/productos/${r.id}?nuevo=1`)
      else router.refresh()
    })
  }

  const remove = () => {
    if (!v.id || !confirm('¿Borrar este producto? Si ya tiene ventas, se despublica en lugar de borrarse.')) return
    startSave(async () => {
      const r = await deleteProduct(v.id!)
      if (!r.ok) return setMessage({ kind: 'error', text: r.error })
      if (r.archived) {
        set('active', false)
        setMessage({ kind: 'ok', text: 'Tiene ventas, así que se despublicó (no se ve en la tienda).' })
      } else router.replace('/admin/productos')
    })
  }

  return (
    <form onSubmit={submit} className="pb-24" noValidate>
      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <Card title="Datos">
            <div className="space-y-4 p-5">
              <Field label="Nombre" error={errors.name}>
                <input className={input} value={v.name} onChange={(e) => { set('name', e.target.value); if (!slugTouched) set('slug', slugify(e.target.value)) }} placeholder="Ej: Remera Dry Fit Mujer" />
              </Field>
              <Field label="Dirección en la tienda" error={errors.slug} hint={`yagua.com.ar/…/${v.slug || 'nombre-del-producto'}`}>
                <input className={input} value={v.slug} onChange={(e) => { setSlugTouched(true); set('slug', slugify(e.target.value)) }} />
              </Field>
              <Field label="Descripción" error={errors.description}>
                <textarea className={cn(input, 'min-h-36')} value={v.description} onChange={(e) => set('description', e.target.value)} placeholder="Contá para qué sirve, la tela, el calce…" />
              </Field>
            </div>
          </Card>

          <Card title="Fotos" action={<span className="text-xs text-brand-muted">La primera es la portada</span>}>
            <div className="p-5">
              {errors.images && <p className="mb-3 text-sm font-medium text-red-700">{errors.images}</p>}
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {v.images.map((img, i) => (
                  <li key={img.url + i} className="overflow-hidden rounded border border-brand-line bg-white">
                    <div className="relative aspect-square bg-brand-mist">
                      <Image src={img.url} alt={img.alt} fill sizes="200px" className="object-cover" />
                      {i === 0 && <span className="absolute left-1.5 top-1.5 rounded bg-brand-primary px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">Portada</span>}
                    </div>
                    <div className="space-y-1.5 p-2">
                      <select aria-label="Color de la foto" className={cn(input, 'py-1.5 text-xs')} value={img.color ?? ''} onChange={(e) => set('images', v.images.map((x, j) => (j === i ? { ...x, color: e.target.value || null } : x)))}>
                        <option value="">Todos los colores</option>
                        {colors.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <div className="flex justify-between">
                        <div className="flex gap-1">
                          <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} className="grid h-7 w-7 place-items-center rounded border border-brand-line disabled:opacity-30" aria-label="Mover antes"><ArrowUp size={14} className="-rotate-90" /></button>
                          <button type="button" onClick={() => moveImage(i, 1)} disabled={i === v.images.length - 1} className="grid h-7 w-7 place-items-center rounded border border-brand-line disabled:opacity-30" aria-label="Mover después"><ArrowDown size={14} className="-rotate-90" /></button>
                        </div>
                        <button type="button" onClick={() => set('images', v.images.filter((_, j) => j !== i))} className="grid h-7 w-7 place-items-center rounded border border-red-200 text-red-700" aria-label="Quitar foto"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </li>
                ))}
                {Array.from({ length: uploading }, (_, i) => (
                  <li key={`up-${i}`} className="grid aspect-square place-items-center rounded border border-dashed border-brand-line bg-white text-brand-muted"><Loader2 className="animate-spin" /></li>
                ))}
                <li>
                  <button
                    type="button"
                    disabled={!storageReady}
                    onClick={() => fileRef.current?.click()}
                    className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded border-2 border-dashed border-brand-line bg-white text-sm text-brand-muted transition hover:border-brand-ink hover:text-brand-ink disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ImagePlus size={26} /> Subir fotos
                  </button>
                </li>
              </ul>
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
              {!storageReady && <p className="mt-3 text-xs text-amber-700">Para subir fotos falta configurar el almacenamiento (variables AWS_* de Neon).</p>}
            </div>
          </Card>

          <Card title="Talles, colores y stock" action={<span className="text-sm text-brand-muted">Stock total: <strong className="text-brand-ink">{totalStock}</strong></span>}>
            <div className="space-y-4 p-5">
              {errors.variants && <p className="text-sm font-medium text-red-700">{errors.variants}</p>}
              <div className="rounded border border-dashed border-brand-line bg-brand-mist/50 p-4">
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold"><Wand2 size={16} /> Cargar varios de una vez</p>
                <div className="grid gap-3 sm:grid-cols-[1.2fr_1.2fr_0.6fr_auto] sm:items-end">
                  <Field label="Colores" hint="Separados por coma"><input className={input} value={genColors} onChange={(e) => setGenColors(e.target.value)} placeholder="Negro, Blanco, Rosa" /></Field>
                  <Field label="Talles" hint="Separados por coma"><input className={input} value={genSizes} onChange={(e) => setGenSizes(e.target.value)} placeholder="S, M, L" /></Field>
                  <Field label="Stock c/u"><input className={input} inputMode="numeric" value={genStock} onChange={(e) => setGenStock(e.target.value.replace(/\D/g, ''))} /></Field>
                  <button type="button" onClick={generate} className={cn(btn.primary, 'mb-[22px]')}>Agregar</button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {SIZE_PRESETS.map((p) => (
                    <button key={p.label} type="button" onClick={() => setGenSizes(p.sizes.join(', '))} className="rounded-full border border-brand-line bg-white px-2.5 py-1 text-xs hover:border-brand-ink">{p.label}</button>
                  ))}
                </div>
              </div>

              {v.variants.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-sm">
                    <thead><tr className="text-left text-xs uppercase tracking-wider text-brand-muted"><th className="pb-2 pr-2">Color</th><th className="pb-2 pr-2">Talle</th><th className="pb-2 pr-2">Stock</th><th className="pb-2 pr-2">SKU</th><th /></tr></thead>
                    <tbody>
                      {[...v.variants.entries()]
                        .sort(([, a], [, b]) => a.color.localeCompare(b.color) || sortSizes([a.size, b.size]).indexOf(a.size) - sortSizes([a.size, b.size]).indexOf(b.size))
                        .map(([i, x]) => (
                          <tr key={x.id ?? `n${i}`} className="border-t border-brand-line">
                            <td className="py-1.5 pr-2">
                              <div className="flex items-center gap-1.5">
                                <input type="color" aria-label={`Muestra de ${x.color}`} value={x.colorHex} onChange={(e) => set('variants', v.variants.map((y) => (y.color === x.color ? { ...y, colorHex: e.target.value } : y)))} className="h-9 w-9 shrink-0 cursor-pointer rounded border border-brand-line bg-white p-0.5" />
                                <input className={cn(input, 'py-1.5')} value={x.color} onChange={(e) => updateVariant(i, { color: e.target.value })} aria-label="Color" />
                              </div>
                            </td>
                            <td className="w-24 py-1.5 pr-2"><input className={cn(input, 'py-1.5', errors[`variants.${i}.size`] && 'border-red-400')} value={x.size} onChange={(e) => updateVariant(i, { size: e.target.value })} aria-label="Talle" title={errors[`variants.${i}.size`]} /></td>
                            <td className="w-24 py-1.5 pr-2"><input className={cn(input, 'py-1.5', Number(x.stock) === 0 && 'text-red-700')} inputMode="numeric" value={x.stock} onChange={(e) => updateVariant(i, { stock: e.target.value.replace(/\D/g, '') })} aria-label="Stock" /></td>
                            <td className="py-1.5 pr-2"><input className={cn(input, 'py-1.5 font-mono text-xs')} value={x.sku ?? ''} placeholder="Automático" onChange={(e) => updateVariant(i, { sku: e.target.value })} aria-label="SKU" /></td>
                            <td className="w-9 py-1.5"><button type="button" onClick={() => set('variants', v.variants.filter((_, j) => j !== i))} className="grid h-9 w-9 place-items-center rounded text-brand-muted hover:bg-red-50 hover:text-red-700" aria-label="Quitar"><Trash2 size={16} /></button></td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
              <button type="button" onClick={() => set('variants', [...v.variants, { color: colors[0] ?? '', colorHex: v.variants[0]?.colorHex ?? '#1b181c', size: '', stock: 0 }])} className={btn.secondary}>
                <Plus size={16} /> Agregar una fila
              </button>
            </div>
          </Card>

          <Card title="Especificaciones">
            <div className="space-y-2 p-5">
              {v.specs.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input className={cn(input, 'w-1/3')} value={s.label} placeholder="Material" onChange={(e) => set('specs', v.specs.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} aria-label="Característica" />
                  <input className={input} value={s.value} placeholder="100% poliéster" onChange={(e) => set('specs', v.specs.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} aria-label="Valor" />
                  <button type="button" onClick={() => set('specs', v.specs.filter((_, j) => j !== i))} className="grid h-10 w-10 shrink-0 place-items-center rounded text-brand-muted hover:bg-red-50 hover:text-red-700" aria-label="Quitar"><Trash2 size={16} /></button>
                </div>
              ))}
              <button type="button" onClick={() => set('specs', [...v.specs, { label: '', value: '' }])} className={btn.secondary}><Plus size={16} /> Agregar</button>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Publicación">
            <div className="space-y-3 p-5">
              <label className="flex cursor-pointer items-center justify-between gap-3">
                <span className="text-sm"><strong>{v.active ? 'Visible en la tienda' : 'Oculto'}</strong><span className="block text-xs text-brand-muted">{v.active ? 'Los clientes lo pueden ver y comprar' : 'Solo lo ves vos desde el panel'}</span></span>
                <input type="checkbox" checked={v.active} onChange={(e) => set('active', e.target.checked)} className="peer sr-only" />
                <span className="relative h-6 w-11 shrink-0 rounded-full bg-brand-line transition after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:bg-emerald-600 peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-ink" />
              </label>
            </div>
          </Card>

          <Card title="Precio">
            <div className="grid grid-cols-2 gap-3 p-5">
              <Field label="Precio de lista" error={errors.price}>
                <input className={input} inputMode="numeric" value={v.price} onChange={(e) => set('price', e.target.value.replace(/\D/g, ''))} placeholder="24990" />
              </Field>
              <Field label="Precio de oferta" error={errors.salePrice} hint={off ? `${off}% OFF` : 'Opcional'}>
                <input className={input} inputMode="numeric" value={v.salePrice ?? ''} onChange={(e) => set('salePrice', e.target.value.replace(/\D/g, ''))} placeholder="—" />
              </Field>
              {Number(v.price) > 0 && <p className="col-span-2 text-xs text-brand-muted">Se muestra como {formatPrice(Number(v.salePrice) || Number(v.price))} con IVA incluido.</p>}
            </div>
          </Card>

          <Card title="Organización">
            <div className="space-y-4 p-5">
              <Field label="Deporte" error={errors.sportId}>
                <select className={input} value={v.sportId} onChange={(e) => { set('sportId', e.target.value); set('categoryId', '') }}>
                  <option value="">Elegí…</option>
                  {options.sports.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </Field>
              <Field label="Categoría" error={errors.categoryId}>
                <select className={input} value={v.categoryId} onChange={(e) => set('categoryId', e.target.value)} disabled={!sport}>
                  <option value="">Elegí…</option>
                  {sport?.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Marca" error={errors.brandId}>
                  <select className={input} value={v.brandId} onChange={(e) => set('brandId', e.target.value)}>
                    <option value="">Elegí…</option>
                    {options.brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </Field>
                <Field label="Género">
                  <select className={input} value={v.gender} onChange={(e) => set('gender', e.target.value as ProductFormValue['gender'])}>
                    {GENDERS.map((g) => <option key={g} value={g}>{GENDER_LABEL[g]}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Guía de talles">
                <select className={input} value={v.sizeGuide} onChange={(e) => set('sizeGuide', e.target.value as ProductFormValue['sizeGuide'])}>
                  <option value="">Sin guía</option>
                  <option value="indumentaria">Indumentaria</option>
                  <option value="calzado">Calzado</option>
                  <option value="paletas">Paletas</option>
                </select>
              </Field>
              <fieldset>
                <legend className="mb-1.5 text-sm font-semibold">Etiquetas</legend>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map((t) => {
                    const on = v.tags.includes(t)
                    return (
                      <button key={t} type="button" aria-pressed={on} onClick={() => set('tags', on ? v.tags.filter((x) => x !== t) : [...v.tags, t])} className={cn('rounded-full border px-3 py-1.5 text-xs font-semibold', on ? 'border-brand-ink bg-brand-ink text-white' : 'border-brand-line bg-white hover:border-brand-ink')}>
                        {TAG_LABEL[t]}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            </div>
          </Card>
        </div>
      </div>

      {/* Barra de guardado fija */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-brand-line bg-white/95 backdrop-blur lg:left-[240px]">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
          <div className="min-w-0 text-sm" aria-live="polite">
            {message && <span className={message.kind === 'ok' ? 'font-medium text-emerald-700' : 'font-medium text-red-700'}>{message.text}</span>}
          </div>
          <div className="flex shrink-0 gap-2">
            {v.id && <button type="button" onClick={remove} disabled={saving} className={btn.danger}><Trash2 size={16} /> <span className="hidden sm:inline">Borrar</span></button>}
            <button type="submit" disabled={saving || uploading > 0} className={btn.primary}>
              {saving && <Loader2 size={16} className="animate-spin" />} {v.id ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
