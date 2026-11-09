import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { FavoritesList } from '@/features/catalog/components/FavoritesList'

export const metadata: Metadata = { title: 'Favoritos', robots: { index: false } }

export default function FavoritesPage() {
  return (
    <Container className="py-10 lg:py-14">
      <h1 className="mb-10 font-display text-5xl font-black uppercase italic lg:text-6xl">Favoritos</h1>
      <FavoritesList />
    </Container>
  )
}
