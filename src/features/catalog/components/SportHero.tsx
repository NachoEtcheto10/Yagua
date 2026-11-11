import { Fish } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/format'

type Props = {
  sport: { slug: string; name: string; tagline: string | null; description: string | null; heroImage: string; isSubBrand: boolean }
  categories: { slug: string; name: string }[]
  activeCategory?: string
  title?: string
}

// Punto de la foto que tiene que quedar a la vista cuando se recorta (por defecto, el centro)
const FOCUS: Record<string, string> = {
  ninos: 'object-[60%_6%]', // las caras de los chicos están arriba
}

/** Portada de cada deporte. King Fishing tiene su propia estética (azul río + dorado). */
export function SportHero({ sport, categories, activeCategory, title }: Props) {
  const kf = sport.isSubBrand
  return (
    <section className={cn('relative overflow-hidden', kf ? 'bg-kf-deep' : 'bg-brand-primary')}>
      <Image src={sport.heroImage} alt="" fill priority sizes="100vw" className={cn('object-cover opacity-70', FOCUS[sport.slug])} />
      <div className={cn('absolute inset-0', kf ? 'bg-gradient-to-t from-kf-deep via-kf-deep/50 to-transparent' : 'bg-gradient-to-t from-black/85 via-black/30 to-black/5')} />
      <div className="relative mx-auto flex min-h-[60vh] max-w-[1440px] flex-col justify-end px-4 pb-8 pt-24 sm:min-h-[44vh] sm:px-6 lg:min-h-[52vh] lg:px-10 lg:pb-12">
        <nav aria-label="Ubicación" className="text-sm text-white/70">
          <Link href="/" className="hover:text-white">Inicio</Link>
          <span className="mx-2">/</span>
          {activeCategory ? <Link href={`/${sport.slug}`} className="hover:text-white">{sport.name}</Link> : <span className="text-white">{sport.name}</span>}
          {activeCategory && (
            <>
              <span className="mx-2">/</span>
              <span className="text-white">{title}</span>
            </>
          )}
        </nav>
        {kf && (
          <p className="mt-4 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.3em] text-kf-gold">
            <Fish size={18} /> Pesca y náutica by Yaguá
          </p>
        )}
        <h1 className="mt-2 font-display text-6xl font-black uppercase italic leading-[0.85] text-white sm:text-7xl lg:text-9xl">{title ?? sport.name}</h1>
        {!activeCategory && sport.description && <p className="mt-4 max-w-xl text-lg text-white/85">{sport.description}</p>}
        <div className="scrollbar-none -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          <Link
            href={`/${sport.slug}`}
            className={cn('shrink-0 border px-4 py-2 font-display font-bold uppercase tracking-wide', !activeCategory ? (kf ? 'border-kf-gold bg-kf-gold text-kf-deep' : 'border-white bg-white text-brand-ink') : 'border-white/50 text-white hover:border-white')}
          >
            Todo
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/${sport.slug}/${c.slug}`}
              className={cn(
                'shrink-0 border px-4 py-2 font-display font-bold uppercase tracking-wide transition',
                activeCategory === c.slug ? (kf ? 'border-kf-gold bg-kf-gold text-kf-deep' : 'border-white bg-white text-brand-ink') : 'border-white/50 text-white hover:border-white',
              )}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
