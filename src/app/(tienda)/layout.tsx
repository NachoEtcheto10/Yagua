import { AnnouncementBar } from '@/components/layout/AnnouncementBar'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import type { NavSport } from '@/components/layout/nav-types'
import { CartDrawer } from '@/features/cart/CartDrawer'
import { getSports } from '@/features/catalog/queries'
import { auth } from '@/lib/auth'

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [sports, session] = await Promise.all([getSports(), auth()])
  const nav: NavSport[] = sports.map((s) => ({
    slug: s.slug,
    name: s.name,
    tagline: s.tagline,
    cardImage: s.cardImage,
    isSubBrand: s.isSubBrand,
    categories: s.categories.map((c) => ({ slug: c.slug, name: c.name })),
  }))
  return (
    <>
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[100] focus:bg-white focus:px-4 focus:py-2">
        Saltar al contenido
      </a>
      <AnnouncementBar />
      <Header sports={nav} userName={session?.user?.name ?? session?.user?.email ?? null} />
      <main id="contenido" className="min-h-[60vh]">{children}</main>
      <Footer sports={nav} />
      <CartDrawer />
    </>
  )
}
