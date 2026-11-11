'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cartCount, useCart } from '@/features/cart/store'
import { cn } from '@/lib/format'
import type { NavSport } from './nav-types'
import { SearchBox } from './SearchBox'

const EXTRA_LINKS = [
  { href: '/personalizados', label: 'Personalizados' },
  { href: '/ofertas', label: 'Ofertas' },
]

function CartButton() {
  const items = useCart((s) => s.items)
  const bump = useCart((s) => s.bump)
  const setOpen = useCart((s) => s.setOpen)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const count = mounted ? cartCount(items) : 0
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={`Abrir carrito (${count} ${count === 1 ? "producto" : "productos"})`}
      className="relative grid h-10 w-10 place-items-center"
    >
      {/* key={bump}: reinicia la animación de rebote cada vez que se agrega algo */}
      <span key={bump} className={cn('grid place-items-center', bump > 0 && 'animate-cart-bump')}>
        <ShoppingBag size={22} />
      </span>
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-accent px-1 text-[11px] font-bold text-white"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

export function Header({ sports, userName }: { sports: NavSport[]; userName: string | null }) {
  const pathname = usePathname()
  const [hover, setHover] = useState<string | null>(null)
  const [mobile, setMobile] = useState(false)
  const [mobileSport, setMobileSport] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    setHover(null)
    setMobile(false)
    setSearchOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = mobile ? 'hidden' : ''
  }, [mobile])

  const hovered = sports.find((s) => s.slug === hover)

  return (
    <header className="sticky top-0 z-40 border-b border-brand-line bg-white" onMouseLeave={() => setHover(null)}>
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 sm:px-6 lg:h-[72px] lg:px-10">
        <button type="button" onClick={() => setMobile(true)} className="-ml-2 grid h-10 w-10 place-items-center xl:hidden" aria-label="Abrir menú">
          <Menu size={24} />
        </button>

        <Link href="/" className="mx-auto shrink-0 xl:mx-0" aria-label="Yaguá, ir al inicio">
          <Image src="/brand/yagua-logo.svg" alt="Yaguá" width={104} height={45} priority className="h-10 w-auto lg:h-11" />
        </Link>

        {/* Navegación por deporte (escritorio) */}
        <nav className="hidden flex-1 justify-center xl:flex" aria-label="Deportes">
          <ul className="flex items-stretch">
            {sports.map((s) => (
              <li key={s.slug} onMouseEnter={() => setHover(s.slug)}>
                <Link
                  href={`/${s.slug}`}
                  onFocus={() => setHover(s.slug)}
                  className={cn(
                    'relative flex h-[72px] items-center whitespace-nowrap px-2 font-display text-[15px] font-bold uppercase tracking-wide 2xl:px-3',
                    "after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:origin-left after:scale-x-0 after:bg-brand-accent after:transition after:content-['']",
                    (hover === s.slug || pathname.startsWith(`/${s.slug}`)) && 'after:scale-x-100',
                    s.isSubBrand && 'text-kf-water',
                  )}
                >
                  {s.name}
                </Link>
              </li>
            ))}
            {EXTRA_LINKS.map((l) => (
              <li key={l.href} onMouseEnter={() => setHover(null)}>
                <Link
                  href={l.href}
                  className={cn(
                    'flex h-[72px] items-center whitespace-nowrap px-2 font-display text-[15px] font-bold uppercase tracking-wide 2xl:px-3',
                    l.href === '/ofertas' && 'text-brand-accent',
                  )}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1 lg:gap-2">
          <div className="hidden w-52 2xl:block">
            <SearchBox />
          </div>
          <button type="button" onClick={() => setSearchOpen((v) => !v)} className="grid h-10 w-10 place-items-center 2xl:hidden" aria-label="Buscar">
            <Search size={22} />
          </button>
          <Link href={userName ? '/cuenta' : '/ingresar'} className="hidden h-10 w-10 place-items-center sm:grid" aria-label={userName ? `Mi cuenta (${userName})` : 'Ingresar'}>
            <User size={22} />
          </Link>
          <Link href="/favoritos" className="hidden h-10 w-10 place-items-center sm:grid" aria-label="Favoritos">
            <Heart size={22} />
          </Link>
          <CartButton />
        </div>
      </div>

      {/* Buscador desplegable (celular y tablet) */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-brand-line 2xl:hidden">
            <div className="px-4 py-3 sm:px-6">
              <SearchBox autoFocus onNavigate={() => setSearchOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mega-menú (escritorio) */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            key="mega"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-x-0 top-full hidden border-b border-brand-line bg-white shadow-xl xl:block"
            onMouseEnter={() => setHover(hovered.slug)}
          >
            <div className="mx-auto grid max-w-[1440px] grid-cols-[1fr_1fr_1.3fr] gap-10 px-10 py-10">
              <div>
                <p className="font-display text-sm font-bold uppercase tracking-widest text-brand-muted">{hovered.name}</p>
                <ul className="mt-4 space-y-2.5">
                  {hovered.categories.map((c) => (
                    <li key={c.slug}>
                      <Link href={`/${hovered.slug}/${c.slug}`} className="text-[15px] hover:underline">
                        {c.name}
                      </Link>
                    </li>
                  ))}
                  <li className="pt-2">
                    <Link href={`/${hovered.slug}`} className="text-[15px] font-semibold underline underline-offset-4">
                      Ver todo {hovered.name}
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-display text-sm font-bold uppercase tracking-widest text-brand-muted">Destacados</p>
                <ul className="mt-4 space-y-2.5 text-[15px]">
                  <li><Link href={`/${hovered.slug}?orden=novedades`} className="hover:underline">Novedades</Link></li>
                  <li><Link href={`/${hovered.slug}?orden=mas-vendidos`} className="hover:underline">Lo más vendido</Link></li>
                  <li><Link href={`/${hovered.slug}?oferta=1`} className="hover:underline">Ofertas</Link></li>
                  <li><Link href="/personalizados" className="hover:underline">Personalizados para equipos</Link></li>
                </ul>
              </div>
              <Link href={`/${hovered.slug}`} className="group relative block aspect-[16/9] overflow-hidden bg-brand-mist">
                <Image src={hovered.cardImage} alt={hovered.name} fill sizes="35vw" className="object-cover transition duration-700 group-hover:scale-105" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <span className="absolute bottom-5 left-5 font-display text-3xl font-extrabold uppercase italic text-white">
                  {hovered.tagline ?? hovered.name}
                </span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menú lateral (celular) */}
      <AnimatePresence>
        {mobile && (
          <div className="fixed inset-0 z-50 xl:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobile(false)} className="absolute inset-0 bg-black/50" />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.28 }}
              className="absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col bg-white"
              aria-label="Menú"
            >
              <div className="flex h-16 items-center justify-between border-b border-brand-line px-4">
                <Image src="/brand/yagua-logo.svg" alt="Yaguá" width={92} height={40} className="h-9 w-auto" />
                <button type="button" onClick={() => setMobile(false)} className="grid h-10 w-10 place-items-center" aria-label="Cerrar menú">
                  <X size={24} />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto">
                {sports.map((s) => (
                  <div key={s.slug} className="border-b border-brand-line">
                    <button
                      type="button"
                      onClick={() => setMobileSport(mobileSport === s.slug ? null : s.slug)}
                      aria-expanded={mobileSport === s.slug}
                      className={cn('flex w-full items-center justify-between px-5 py-4 font-display text-xl font-bold uppercase', s.isSubBrand && 'text-kf-water')}
                    >
                      {s.name}
                      <ChevronRight size={20} className={cn('transition', mobileSport === s.slug && 'rotate-90')} />
                    </button>
                    {mobileSport === s.slug && (
                      <ul className="pb-3">
                        <li><Link href={`/${s.slug}`} className="block px-8 py-2 font-semibold">Ver todo</Link></li>
                        {s.categories.map((c) => (
                          <li key={c.slug}>
                            <Link href={`/${s.slug}/${c.slug}`} className="block px-8 py-2 text-brand-muted">{c.name}</Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
                {EXTRA_LINKS.map((l) => (
                  <Link key={l.href} href={l.href} className="block border-b border-brand-line px-5 py-4 font-display text-xl font-bold uppercase">
                    {l.label}
                  </Link>
                ))}
                <div className="space-y-1 p-5 text-sm">
                  <Link href={userName ? '/cuenta' : '/ingresar'} className="flex items-center gap-3 py-2"><User size={18} /> {userName ? 'Mi cuenta' : 'Ingresar / Registrarme'}</Link>
                  <Link href="/favoritos" className="flex items-center gap-3 py-2"><Heart size={18} /> Favoritos</Link>
                </div>
              </nav>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </header>
  )
}
