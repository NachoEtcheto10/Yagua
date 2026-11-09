import 'server-only'
import { unstable_cache } from 'next/cache'
import { db } from '@/lib/db'

const opts = { revalidate: 120, tags: ['catalog'] }

/** Campaña vigente para mostrar en la home (la que empezó más recientemente) */
export const getActiveCampaign = unstable_cache(
  async () => {
    const now = new Date()
    return db.campaign.findFirst({
      where: { active: true, showOnHome: true, startsAt: { lte: now }, endsAt: { gte: now } },
      orderBy: { startsAt: 'desc' },
    })
  },
  ['home', 'campaign'],
  opts,
)

export const getCommunity = unstable_cache(async () => {
  const [ambassadors, players, sponsors, associations] = await Promise.all([
    db.ambassador.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { favorites: { select: { slug: true, name: true, sport: { select: { slug: true } }, category: { select: { slug: true } } } } },
    }),
    db.player.findMany({ orderBy: { sortOrder: 'asc' } }),
    db.sponsor.findMany({ orderBy: { sortOrder: 'asc' } }),
    db.association.findMany({ orderBy: { sortOrder: 'asc' } }),
  ])
  return { ambassadors, players, sponsors, associations }
}, ['home', 'community'], opts)
