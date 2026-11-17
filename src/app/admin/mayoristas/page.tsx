import { ExternalLink, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { ReviewButtons, WholesaleSettingsForm } from '@/features/admin/components/WholesaleAdmin'
import { Card, dateTime, Empty, PageHeader } from '@/features/admin/components/ui'
import { getWholesaleSettings } from '@/features/wholesale/settings'
import { db } from '@/lib/db'
import { cn } from '@/lib/format'

export const metadata = { title: 'Mayoristas' }

const STATUS = {
  PENDING: { label: 'Para revisar', className: 'bg-amber-100 text-amber-800' },
  APPROVED: { label: 'Aprobada', className: 'bg-emerald-100 text-emerald-800' },
  REJECTED: { label: 'Rechazada', className: 'bg-red-100 text-red-800' },
} as const

type SP = Promise<{ estado?: string }>

export default async function WholesaleAdminPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const status = sp.estado && sp.estado in STATUS ? (sp.estado as keyof typeof STATUS) : undefined
  const [settings, accounts, counts, orders] = await Promise.all([
    getWholesaleSettings(),
    db.wholesaleAccount.findMany({
      where: status ? { status } : undefined,
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      include: { user: { select: { email: true, name: true } } },
    }),
    db.wholesaleAccount.groupBy({ by: ['status'], _count: true }),
    db.order.groupBy({ by: ['userId'], where: { channel: 'WHOLESALE' }, _count: true, _sum: { total: true } }),
  ])
  const countOf = (s: keyof typeof STATUS) => counts.find((c) => c.status === s)?._count ?? 0
  const ordersOf = (userId: string) => orders.find((o) => o.userId === userId)
  const chip = (active: boolean) => cn('rounded-full border px-3.5 py-1.5 text-sm font-medium', active ? 'border-brand-ink bg-brand-ink text-white' : 'border-brand-line bg-white hover:border-brand-ink')

  return (
    <>
      <PageHeader title="Mayoristas" subtitle="Empresas que piden comprar por mayor: revisá sus datos y aprobalas o rechazalas" actions={<Link href="/mayoristas" target="_blank" className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"><ExternalLink size={16} /> Ver la página de mayoristas</Link>} />

      <Card title="Precio mayorista" className="mb-4">
        <WholesaleSettingsForm discountPct={settings.discountPct} minPurchase={settings.minPurchase} />
      </Card>

      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/admin/mayoristas" className={chip(!status)}>Todas</Link>
        {(Object.keys(STATUS) as (keyof typeof STATUS)[]).map((s) => (
          <Link key={s} href={`/admin/mayoristas?estado=${s}`} className={chip(status === s)}>{STATUS[s].label} <span className="opacity-60">{countOf(s)}</span></Link>
        ))}
      </div>

      {accounts.length === 0 ? <Card><Empty>No hay solicitudes{status ? ' en este estado' : ''}.</Empty></Card> : (
        <ul className="space-y-4">
          {accounts.map((a) => {
            const o = ordersOf(a.userId)
            const phone = a.phone.replace(/\D/g, '')
            return (
              <li key={a.id}>
                <Card>
                  <div className="grid gap-5 p-5 lg:grid-cols-[1.4fr_1fr]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-display text-xl font-black uppercase">{a.companyName}</p>
                        <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', STATUS[a.status].className)}>{STATUS[a.status].label}</span>
                      </div>
                      <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
                        <div><dt className="inline text-brand-muted">CUIT: </dt><dd className="inline font-mono">{a.cuit}</dd></div>
                        <div><dt className="inline text-brand-muted">Rubro: </dt><dd className="inline">{a.businessType}</dd></div>
                        <div><dt className="inline text-brand-muted">Compraría por mes: </dt><dd className="inline">{a.monthlyVolume}</dd></div>
                        <div><dt className="inline text-brand-muted">Ciudad: </dt><dd className="inline">{a.city}</dd></div>
                        <div><dt className="inline text-brand-muted">Contacto: </dt><dd className="inline">{a.user.name} · {a.user.email}</dd></div>
                        <div><dt className="inline text-brand-muted">Teléfono: </dt><dd className="inline">{a.phone}</dd></div>
                        {a.instagram && <div><dt className="inline text-brand-muted">Instagram: </dt><dd className="inline">{a.instagram}</dd></div>}
                        {a.website && <div><dt className="inline text-brand-muted">Web: </dt><dd className="inline">{a.website}</dd></div>}
                      </dl>
                      {a.message && <p className="mt-3 border-l-4 border-brand-turquoise bg-brand-mist p-3 text-sm">{a.message}</p>}
                      {a.adminNote && <p className="mt-2 text-sm text-brand-muted">Nota: {a.adminNote}</p>}
                    </div>
                    <div className="space-y-3 text-sm lg:text-right">
                      <p className="text-brand-muted">Pidió la cuenta el {dateTime(a.createdAt)}</p>
                      {o && <p><Link href={`/admin/pedidos?q=${encodeURIComponent(a.user.email)}`} className="font-semibold hover:underline">{o._count} pedidos mayoristas</Link></p>}
                      <a href={`https://wa.me/${phone.startsWith('54') ? phone : `54${phone}`}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 font-semibold text-[#128c7e] hover:underline"><MessageCircle size={16} /> WhatsApp</a>
                      <div className="lg:flex lg:justify-end"><ReviewButtons id={a.id} status={a.status} /></div>
                    </div>
                  </div>
                </Card>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
