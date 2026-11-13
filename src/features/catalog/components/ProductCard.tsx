import Image from 'next/image'
import Link from 'next/link'
import { Price } from '@/components/ui/Price'
import { cn, discountPct } from '@/lib/format'
import type { ProductCardData } from '../queries'
import { FavoriteButton } from './FavoriteButton'

const TAG_LABEL: Record<string, string> = { NUEVO: 'Nuevo', ULTIMAS_UNIDADES: 'Últimas unidades' }

export function ProductCard({ product, priority, className }: { product: ProductCardData; priority?: boolean; className?: string }) {
  const [main, hover] = product.images
  const off = discountPct(product.price, product.salePrice)
  const badge = off ? `-${off}%` : product.tags.map((t) => TAG_LABEL[t]).find(Boolean)
  return (
    <Link href={product.href} className={cn('group flex flex-col', className)}>
      {/* Foto: llena toda la tarjeta (4:5, la forma de las fotos de producto) sin bordes de color.
          Zoom + cambio a la segunda imagen al pasar el mouse */}
      <div className="relative aspect-[4/5] overflow-hidden bg-white">
        {main && (
          <Image
            src={main.url}
            alt={main.alt}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 48vw"
            className={cn(
              'object-cover transition duration-700 ease-out group-hover:scale-105',
              hover && 'group-hover:opacity-0',
              !product.inStock && 'opacity-50',
            )}
          />
        )}
        {hover && (
          <Image
            src={hover.url}
            alt=""
            fill
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 48vw"
            className="object-cover opacity-0 transition duration-700 ease-out group-hover:scale-105 group-hover:opacity-100"
          />
        )}
        {badge && (
          <span
            className={cn(
              'absolute left-0 top-3 px-2.5 py-1 font-display text-sm font-bold uppercase tracking-wide',
              off ? 'bg-brand-accent text-white' : 'bg-brand-secondary text-brand-ink',
            )}
          >
            {badge}
          </span>
        )}
        {!product.inStock && (
          <span className="absolute inset-x-0 bottom-0 bg-brand-ink/80 py-1.5 text-center text-xs font-semibold uppercase tracking-wider text-white">
            Sin stock
          </span>
        )}
        <FavoriteButton slug={product.slug} className="absolute right-2 top-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100" />
      </div>
      <div className="flex flex-1 flex-col gap-1 pt-3">
        <Price price={product.price} salePrice={product.salePrice} size="sm" />
        <h3 className="line-clamp-2 text-sm leading-snug text-brand-ink group-hover:underline">{product.name}</h3>
        <p className="text-xs text-brand-muted">{product.sportName}</p>
        {product.colors.length > 1 && (
          <div className="mt-1 flex items-center gap-1" aria-label={`${product.colors.length} colores`}>
            {product.colors.slice(0, 5).map((c) => (
              <span key={c.name} title={c.name} className="h-3 w-3 rounded-full border border-black/15" style={{ background: c.hex }} />
            ))}
            {product.colors.length > 5 && <span className="text-xs text-brand-muted">+{product.colors.length - 5}</span>}
          </div>
        )}
      </div>
    </Link>
  )
}
