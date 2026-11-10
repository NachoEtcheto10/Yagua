import Image from 'next/image'
import { CampaignForm, DeleteButton, Toggle } from '@/features/admin/components/MarketingForms'
import { Card, Empty, PageHeader } from '@/features/admin/components/ui'
import { db } from '@/lib/db'

export const metadata = { title: 'Campañas' }

const day = (d: Date) => new Date(d.getTime() - 3 * 3_600_000).toISOString().slice(0, 10)
const fmt = (d: Date) => d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', timeZone: 'America/Argentina/Buenos_Aires' })

export default async function CampaignsPage() {
  const campaigns = await db.campaign.findMany({ orderBy: { startsAt: 'desc' } })
  const now = new Date()
  return (
    <>
      <PageHeader title="Campañas" subtitle="Banners de temporada que aparecen en la página de inicio (Black Friday, Día del Padre, Moda + Pádel…)" />
      <details className="group mb-4 rounded-lg border border-brand-line bg-white">
        <summary className="cursor-pointer list-none px-5 py-3.5 font-display text-lg font-bold uppercase tracking-wide">+ Nueva campaña</summary>
        <div className="border-t border-brand-line"><CampaignForm /></div>
      </details>
      {campaigns.length === 0 ? <Card><Empty>No hay campañas.</Empty></Card> : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {campaigns.map((c) => {
            const live = c.active && c.startsAt <= now && c.endsAt >= now
            const state = !c.active ? 'Pausada' : live ? 'Al aire' : c.startsAt > now ? 'Programada' : 'Terminada'
            return (
              <li key={c.id} className="overflow-hidden rounded-lg border border-brand-line bg-white">
                <div className="relative aspect-[21/9] bg-brand-primary">
                  <Image src={c.image} alt="" fill sizes="(min-width:1024px) 40vw, 90vw" className="object-cover opacity-80" />
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                    <p className="font-display text-2xl font-extrabold uppercase italic">{c.title}</p>
                    {c.subtitle && <p className="text-sm text-white/85">{c.subtitle}</p>}
                  </div>
                  <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${live ? 'bg-emerald-500 text-white' : 'bg-white/90 text-brand-ink'}`}>{state}</span>
                </div>
                <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <span className="text-brand-muted">{fmt(c.startsAt)} → {fmt(c.endsAt)}{c.showOnHome ? ' · En inicio' : ''}</span>
                  <div className="flex items-center gap-2">
                    <Toggle kind="campaign" id={c.id} on={c.active} />
                    <DeleteButton kind="campaign" id={c.id} label={`la campaña ${c.title}`} />
                  </div>
                </div>
                <details className="border-t border-brand-line">
                  <summary className="cursor-pointer px-4 py-2.5 text-sm font-semibold">Editar</summary>
                  <CampaignForm
                    value={{ id: c.id, title: c.title, subtitle: c.subtitle ?? '', ctaLabel: c.ctaLabel ?? '', ctaHref: c.ctaHref ?? '', startsAt: day(c.startsAt), endsAt: day(c.endsAt), showOnHome: c.showOnHome }}
                  />
                </details>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
