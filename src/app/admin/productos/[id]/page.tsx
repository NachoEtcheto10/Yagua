import { ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { btn, PageHeader } from '@/features/admin/components/ui'
import { ProductForm } from '@/features/admin/components/ProductForm'
import { getProductForm, getProductOptions } from '@/features/admin/product-data'
import { productHref } from '@/features/catalog/queries'
import { db } from '@/lib/db'
import { storageEnabled } from '@/lib/storage'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const p = await db.product.findUnique({ where: { id: (await params).id }, select: { name: true } })
  return { title: p?.name ?? 'Producto' }
}

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [initial, options, links] = await Promise.all([
    getProductForm(id),
    getProductOptions(),
    db.product.findUnique({ where: { id }, select: { slug: true, sport: { select: { slug: true } }, category: { select: { slug: true } } } }),
  ])
  if (!initial || !links) notFound()
  return (
    <>
      <Link href="/admin/productos" className="mb-3 inline-flex items-center gap-1 text-sm text-brand-muted hover:text-brand-ink"><ArrowLeft size={16} /> Productos</Link>
      <PageHeader
        title={initial.name}
        actions={<Link href={productHref(links)} target="_blank" className={btn.secondary}><ExternalLink size={16} /> Ver en la tienda</Link>}
      />
      {/* key: si se guarda y cambia algo en la base, el formulario se rearma con los datos nuevos */}
      <ProductForm key={JSON.stringify(initial.variants.map((v) => v.id))} initial={initial} options={options} storageReady={storageEnabled} />
    </>
  )
}
