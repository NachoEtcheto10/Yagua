'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** Favoritos y vistos recientemente (en el navegador). TODO Fase 2: sincronizar con la cuenta del usuario. */
type State = {
  favorites: string[]
  recent: string[]
  toggleFavorite(slug: string): void
  addRecent(slug: string): void
}

export const useFavorites = create<State>()(
  persist(
    (set) => ({
      favorites: [],
      recent: [],
      toggleFavorite: (slug) =>
        set((s) => ({ favorites: s.favorites.includes(slug) ? s.favorites.filter((x) => x !== slug) : [slug, ...s.favorites] })),
      addRecent: (slug) => set((s) => ({ recent: [slug, ...s.recent.filter((x) => x !== slug)].slice(0, 12) })),
    }),
    { name: 'yagua-favs' },
  ),
)
