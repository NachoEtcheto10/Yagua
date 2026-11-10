'use server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { db } from '@/lib/db'
import { storageEnabled, uploadImage } from '@/lib/storage'
import { Prisma } from '@/generated/prisma/client'
import { requireAdmin } from './guard'
import { productSchema, type ProductInput } from './product-schema'

export type SaveResult = { ok: true; id: string } | { ok: false; error: string; fieldErrors?: Record<string, string> }

function skuFor(slug: string, color: string, size: string) {
  const clean = (s: string, n: number) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, n)
  return `${clean(slug, 10)}-${clean(color, 4) || 'U'}-${clean(size, 4) || 'U'}`
}

function refresh(id?: string) {
  revalidateTag('catalog')
  revalidatePath('/admin/productos')
  if (id) revalidatePath(`/admin/productos/${id}`)
}

export async function saveProduct(input: ProductInput): Promise<SaveResult> {
  await requireAdmin()
  const parsed = productSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const i of parsed.error.issues) fieldErrors[i.path.join('.')] ??= i.message
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Revisá los datos', fieldErrors }
  }
  const d = parsed.data

  const category = await db.category.findUnique({ where: { id: d.categoryId }, select: { sportId: true } })
  if (!category || category.sportId !== d.sportId) return { ok: false, error: 'La categoría no corresponde al deporte elegido', fieldErrors: { categoryId: 'Elegí una categoría de este deporte' } }

  const data = {
    name: d.name,
    slug: d.slug,
    description: d.description,
    sportId: d.sportId,
    categoryId: d.categoryId,
    brandId: d.brandId,
    gender: d.gender,
    price: d.price,
    salePrice: d.salePrice,
    tags: d.tags,
    sizeGuide: d.sizeGuide || null,
    active: d.active,
    specs: d.specs.filter((s) => s.label && s.value),
  }

  try {
    const id = await db.$transaction(async (tx) => {
      const product = d.id ? await tx.product.update({ where: { id: d.id }, data, select: { id: true } }) : await tx.product.create({ data, select: { id: true } })

      // Variantes: actualiza las existentes, crea las nuevas y borra las que se quitaron
      const existing = await tx.productVariant.findMany({ where: { productId: product.id }, select: { id: true, _count: { select: { orderItems: true } } } })
      const keep = new Set(d.variants.map((v) => v.id).filter(Boolean))
      const removed = existing.filter((v) => !keep.has(v.id))
      if (removed.some((v) => v._count.orderItems > 0)) {
        throw new Error('Hay talles/colores que ya se vendieron y no se pueden borrar. Dejalos con stock 0.')
      }
      if (removed.length) await tx.productVariant.deleteMany({ where: { id: { in: removed.map((v) => v.id) } } })
      for (const v of d.variants) {
        const sku = v.sku || skuFor(d.slug, v.color, v.size)
        const fields = { size: v.size, color: v.color, colorHex: v.colorHex, stock: v.stock, sku }
        if (v.id && existing.some((e) => e.id === v.id)) await tx.productVariant.update({ where: { id: v.id }, data: fields })
        else await tx.productVariant.create({ data: { ...fields, productId: product.id } })
      }

      // Fotos: se guardan en el orden elegido
      await tx.productImage.deleteMany({ where: { productId: product.id } })
      await tx.productImage.createMany({
        data: d.images.map((img, i) => ({ productId: product.id, url: img.url, alt: img.alt || d.name, color: img.color, sortOrder: i })),
      })
      return product.id
    })
    refresh(id)
    return { ok: true, id }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      const target = String(e.meta?.target ?? '')
      if (target.includes('slug')) return { ok: false, error: 'Ya existe otro producto con esa URL', fieldErrors: { slug: 'Ya está en uso' } }
      if (target.includes('sku')) return { ok: false, error: 'Hay un SKU repetido con otro producto. Dejá el SKU vacío para generarlo solo.' }
      if (target.includes('size')) return { ok: false, error: 'Hay talles/colores repetidos' }
    }
    console.error('saveProduct', e)
    return { ok: false, error: e instanceof Error ? e.message : 'No se pudo guardar' }
  }
}

/** Una foto por llamada: el navegador ya la achicó, así entra en el límite de Vercel */
export async function uploadProductImage(form: FormData): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  await requireAdmin()
  const file = form.get('file')
  if (!(file instanceof File)) return { ok: false, error: 'No llegó ninguna foto' }
  try {
    return { ok: true, url: await uploadImage(file, 'products') }
  } catch (e) {
    console.error('uploadProductImage', e)
    return { ok: false, error: e instanceof Error ? e.message : 'No se pudo subir la foto' }
  }
}

export async function isStorageReady() {
  await requireAdmin()
  return storageEnabled
}

/** Si ya tiene ventas no se borra: se despublica, para no perder el historial de pedidos */
export async function deleteProduct(id: string): Promise<{ ok: true; archived: boolean } | { ok: false; error: string }> {
  await requireAdmin()
  const used = await db.orderItem.count({ where: { productId: id } })
  if (used > 0) {
    await db.product.update({ where: { id }, data: { active: false } })
    refresh(id)
    return { ok: true, archived: true }
  }
  await db.$transaction([db.favorite.deleteMany({ where: { productId: id } }), db.product.delete({ where: { id } })])
  refresh()
  return { ok: true, archived: false }
}

export async function toggleProductActive(id: string, active: boolean) {
  await requireAdmin()
  await db.product.update({ where: { id }, data: { active } })
  refresh(id)
}

/** Ajuste rápido de stock desde el listado */
export async function setVariantStock(variantId: string, stock: number) {
  await requireAdmin()
  if (!Number.isInteger(stock) || stock < 0 || stock > 100_000) return { ok: false as const, error: 'Stock inválido' }
  await db.productVariant.update({ where: { id: variantId }, data: { stock } })
  refresh()
  return { ok: true as const }
}
