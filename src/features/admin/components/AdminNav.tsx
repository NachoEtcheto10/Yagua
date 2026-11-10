'use client'
import { BadgePercent, ExternalLink, LayoutDashboard, LogOut, Megaphone, Menu, Package, Shirt, ShoppingCart, Users, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { logoutAction } from '@/features/auth/actions'
import { cn } from '@/lib/format'

const LINKS = [
  { href: '/admin', label: 'Resumen', icon: LayoutDashboard },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { href: '/admin/productos', label: 'Productos', icon: Package },
  { href: '/admin/personalizados', label: 'Personalizados', icon: Shirt },
  { href: '/admin/cupones', label: 'Cupones', icon: BadgePercent },
  { href: '/admin/campanas', label: 'Campañas', icon: Megaphone },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
]

export function AdminNav({ userName }: { userName: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  useEffect(() => setOpen(false), [pathname])
  const active = (href: string) => (href === '/admin' ? pathname === href : pathname.startsWith(href))

  const content = (
    <>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition',
              active(href) ? 'bg-brand-secondary text-brand-primary' : 'text-white/75 hover:bg-white/10 hover:text-white',
            )}
          >
            <Icon size={18} /> {label}
          </Link>
        ))}
      </nav>
      <div className="space-y-1 border-t border-white/10 px-3 py-4 text-sm">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded px-3 py-2 text-white/75 hover:bg-white/10 hover:text-white">
          <ExternalLink size={18} /> Ver la tienda
        </Link>
        <form action={logoutAction}>
          <button type="submit" className="flex w-full items-center gap-3 rounded px-3 py-2 text-white/75 hover:bg-white/10 hover:text-white">
            <LogOut size={18} /> Salir
          </button>
        </form>
        <p className="truncate px-3 pt-2 text-xs text-white/40">{userName}</p>
      </div>
    </>
  )

  return (
    <>
      {/* Barra superior (celular) */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-brand-primary px-4 text-white lg:hidden">
        <button type="button" onClick={() => setOpen(true)} aria-label="Abrir menú" className="grid h-10 w-10 place-items-center">
          <Menu size={22} />
        </button>
        <span className="font-display text-lg font-bold uppercase tracking-wide">Panel Yaguá</span>
        <span className="w-10" />
      </header>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-brand-primary">
            <div className="flex h-14 items-center justify-between px-4">
              <Image src="/brand/yagua-logo-white.svg" alt="Yaguá" width={80} height={35} className="h-8 w-auto" />
              <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar menú" className="grid h-10 w-10 place-items-center text-white">
                <X size={22} />
              </button>
            </div>
            {content}
          </aside>
        </div>
      )}
      {/* Barra lateral (escritorio) */}
      <aside className="sticky top-0 hidden h-svh flex-col bg-brand-primary lg:flex">
        <div className="px-6 pb-2 pt-6">
          <Image src="/brand/yagua-logo-white.svg" alt="Yaguá" width={92} height={40} className="h-10 w-auto" />
          <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-white/40">Panel de gestión</p>
        </div>
        {content}
      </aside>
    </>
  )
}
