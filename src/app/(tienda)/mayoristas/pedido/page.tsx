import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { getWholesaleAccess, getWholesaleSettings } from '@/features/wholesale/settings'
import { WholesaleStatus } from '@/features/wholesale/StatusPanel'
import { WholesaleOrder } from '@/features/wholesale/WholesaleOrder'

export const metadata: Metadata = { title: 'Pedido mayorista', robots: { index: false } }

export default async function WholesaleOrderPage() {
  const access = await getWholesaleAccess()
  if (access.state !== 'APPROVED') {
    return <Container className="py-16"><WholesaleStatus access={access} next="/mayoristas/pedido" /></Container>
  }
  const settings = await getWholesaleSettings()
  return (
    <Container className="py-10 lg:py-14">
      <Link href="/mayoristas/catalogo" className="mb-3 inline-flex items-center gap-1 text-sm text-brand-muted hover:text-brand-ink"><ArrowLeft size={16} /> Seguir eligiendo</Link>
      <h1 className="mb-8 font-display text-4xl font-black uppercase sm:text-5xl">Tu pedido mayorista</h1>
      <WholesaleOrder minPurchase={settings.minPurchase} companyName={access.account.companyName} />
    </Container>
  )
}
