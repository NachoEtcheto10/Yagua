import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/features/admin/components/ui'
import { ProductForm } from '@/features/admin/components/ProductForm'
import { getProductOptions } from '@/features/admin/product-data'
import { storageEnabled } from '@/lib/storage'

export const metadata = { title: 'Nuevo producto' }

export default async function NewProduct() {
  const options = await getProductOptions()
  const yagua = options.brands.find((b) => b.name.toLowerCase().startsWith('yagu'))
  return (
    <>
      <Link href="/admin/productos" className="mb-3 inline-flex items-center gap-1 text-sm text-brand-muted hover:text-brand-ink"><ArrowLeft size={16} /> Productos</Link>
      <PageHeader title="Nuevo producto" />
      <ProductForm
        options={options}
        storageReady={storageEnabled}
        initial={{
          name: '', slug: '', description: '', sportId: '', categoryId: '', brandId: yagua?.id ?? '', gender: 'UNISEX',
          price: '', salePrice: null, tags: ['NUEVO'], sizeGuide: 'indumentaria', active: true, specs: [], variants: [], images: [],
        }}
      />
    </>
  )
}
