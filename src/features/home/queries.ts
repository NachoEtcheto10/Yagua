import 'server-only'
import { unstable_cache } from 'next/cache'
import { db } from '@/lib/db'

const opts = { revalidate: 120, tags: ['catalog'] }
// En desarrollo no se cachea (siempre muestra lo que hay en la base)
const homeCache: typeof unstable_cache = process.env.NODE_ENV === 'development' ? ((fn) => fn) : unstable_cache

/** Campaña vigente para mostrar en la home (la que empezó más recientemente) */
export const getActiveCampaign = homeCache(
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

export const getCommunity = homeCache(async () => {
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
