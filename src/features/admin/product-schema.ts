import { z } from 'zod'

export const GENDERS = ['UNISEX', 'HOMBRE', 'MUJER', 'NINOS'] as const
export const TAGS = ['NUEVO', 'OFERTA', 'ULTIMAS_UNIDADES', 'DESTACADO'] as const
export const SIZE_GUIDES = ['', 'indumentaria', 'calzado', 'paletas'] as const

export const GENDER_LABEL: Record<(typeof GENDERS)[number], string> = { UNISEX: 'Unisex', HOMBRE: 'Hombre', MUJER: 'Mujer', NINOS: 'Niños' }
export const TAG_LABEL: Record<(typeof TAGS)[number], string> = { NUEVO: 'Nuevo', OFERTA: 'Oferta', ULTIMAS_UNIDADES: 'Últimas unidades', DESTACADO: 'Destacado' }

export function slugify(s: string) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

const money = z.coerce.number({ error: 'Ingresá un número' }).int('Sin centavos').min(0, 'No puede ser negativo').max(50_000_000)

export const productSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().trim().min(3, 'Ingresá el nombre').max(120),
    slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Solo minúsculas, números y guiones').max(80),
    description: z.string().trim().min(10, 'Escribí una descripción (mínimo 10 caracteres)').max(5000),
    sportId: z.string().min(1, 'Elegí un deporte'),
    categoryId: z.string().min(1, 'Elegí una categoría'),
    brandId: z.string().min(1, 'Elegí una marca'),
    gender: z.enum(GENDERS),
    price: money.refine((n) => n > 0, 'Ingresá el precio'),
    salePrice: z.union([z.literal(''), z.null(), money]).transform((v) => (v === '' || v === null || v === 0 ? null : v)),
    tags: z.array(z.enum(TAGS)),
    sizeGuide: z.enum(SIZE_GUIDES),
    active: z.boolean(),
    specs: z.array(z.object({ label: z.string().trim().max(60), value: z.string().trim().max(200) })).max(20),
    variants: z
      .array(
        z.object({
          id: z.string().optional(),
          size: z.string().trim().min(1, 'Falta el talle').max(20),
          color: z.string().trim().min(1, 'Falta el color').max(40),
          colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color inválido'),
          stock: z.coerce.number().int().min(0, 'Stock inválido').max(100_000),
          sku: z.string().trim().max(40).optional(),
        }),
      )
      .min(1, 'Agregá al menos un talle/color'),
    images: z
      .array(z.object({ url: z.string().min(1).max(500), alt: z.string().max(200), color: z.string().nullable() }))
      .min(1, 'Subí al menos una foto')
      .max(20),
  })
  .superRefine((d, ctx) => {
    if (d.salePrice !== null && d.salePrice >= d.price) ctx.addIssue({ code: 'custom', path: ['salePrice'], message: 'El precio de oferta tiene que ser menor al de lista' })
    const seen = new Set<string>()
    d.variants.forEach((v, i) => {
      const k = `${v.color.toLowerCase()}|${v.size.toLowerCase()}`
      if (seen.has(k)) ctx.addIssue({ code: 'custom', path: ['variants', i, 'size'], message: `Repetido: ${v.color} ${v.size}` })
      seen.add(k)
    })
  })

export type ProductInput = z.input<typeof productSchema>
