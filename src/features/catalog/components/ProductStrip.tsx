'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Price } from '@/components/ui/Price'
import { SectionTitle } from '@/components/ui/Container'
import type { ProductCardData } from '../queries'
import { useFavorites } from '../favorites'

/** "Vistos recientemente": lista guardada en el navegador */
export function RecentlyViewed({ exclude }: { exclude?: string }) {
  const recent = useFavorites((s) => s.recent)
  const [items, setItems] = useState<ProductCardData[]>([])
  const slugs = recent.filter((s) => s !== exclude).slice(0, 8).join(',')
  useEffect(() => {
    if (!slugs) return
    fetch(`/api/products?slugs=${slugs}`).then((r) => r.json()).then(setItems).catch(() => {})
  }, [slugs])
  if (!items.length) return null
  return (
    <section className="mt-20">
      <SectionTitle className="!text-3xl">Vistos recientemente</SectionTitle>
      <ul className="scrollbar-none mt-6 flex gap-3 overflow-x-auto">
        {items.map((p) => (
          <li key={p.id} className="w-36 shrink-0">
            <Link href={p.href} className="group block">
              <span className="relative block aspect-[4/5] overflow-hidden bg-white">
                {p.images[0] && <Image src={p.images[0].url} alt={p.images[0].alt} fill sizes="144px" className="object-cover transition group-hover:scale-105" />}
              </span>
              <span className="mt-2 block truncate text-xs">{p.name}</span>
              <Price price={p.price} salePrice={p.salePrice} size="sm" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
