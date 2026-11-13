'use client'
import { Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { buttonClass } from '@/components/ui/Container'
import { Price } from '@/components/ui/Price'
import type { ProductCardData } from '../queries'
import { useFavorites } from '../favorites'
import { FavoriteButton } from './FavoriteButton'

export function FavoritesList() {
  const favorites = useFavorites((s) => s.favorites)
  const [items, setItems] = useState<ProductCardData[] | null>(null)
  const key = favorites.join(',')

  useEffect(() => {
    if (!key) return setItems([])
    fetch(`/api/products?slugs=${key}`).then((r) => r.json()).then(setItems).catch(() => setItems([]))
  }, [key])

  if (items === null) return <div className="min-h-[30vh]" />
  if (!items.length) {
    return (
      <div className="bg-brand-mist p-12 text-center">
        <Heart size={40} className="mx-auto text-brand-muted" />
        <p className="mt-4 font-display text-2xl font-bold uppercase">Todavía no guardaste favoritos</p>
        <p className="mt-1 text-sm text-brand-muted">Tocá el corazón de cualquier producto para guardarlo acá.</p>
        <Link href="/" className={`${buttonClass.primary} mt-6`}>Explorar la tienda</Link>
      </div>
    )
  }
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
      {items.map((p) => (
        <li key={p.id} className="relative">
          <Link href={p.href} className="group block">
            <span className="relative block aspect-[4/5] overflow-hidden bg-white">
              {p.images[0] && <Image src={p.images[0].url} alt={p.images[0].alt} fill sizes="25vw" className="object-cover transition group-hover:scale-105" />}
            </span>
            <Price price={p.price} salePrice={p.salePrice} size="sm" className="mt-3" />
            <span className="text-sm">{p.name}</span>
          </Link>
          <FavoriteButton slug={p.slug} className="absolute right-2 top-2" />
        </li>
      ))}
    </ul>
  )
}
