'use client'
import { Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/format'
import { useFavorites } from '../favorites'

export function FavoriteButton({ slug, className, size = 18 }: { slug: string; className?: string; size?: number }) {
  const { favorites, toggleFavorite } = useFavorites()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const active = mounted && favorites.includes(slug)
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.8 }}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleFavorite(slug)
      }}
      aria-pressed={active}
      aria-label={active ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      className={cn(
        'grid place-items-center rounded-full bg-white/90 p-2 text-brand-ink shadow-sm transition hover:bg-white',
        // Zona táctil invisible más grande (44px+) sin cambiar el tamaño visible. Si el botón ya va
        // posicionado (absolute, en las tarjetas) no se le agrega relative para no pisar su posición
        !className?.includes('absolute') && 'relative',
        "after:absolute after:-inset-[6px] after:rounded-full after:content-['']",
        className,
      )}
    >
      <Heart size={size} className={cn('transition', active && 'fill-brand-accent text-brand-accent')} />
    </motion.button>
  )
}
