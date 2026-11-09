import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Container, SectionTitle } from '@/components/ui/Container'
import { InstagramIcon } from '@/components/ui/SocialIcons'
import { Players, SponsorsAndAssociations } from '@/features/home/CommunityBlocks'
import { getCommunity } from '@/features/home/queries'

export const metadata: Metadata = { title: 'Comunidad', description: 'Embajadores, jugadores, sponsors y asociaciones de Yaguá.' }

export default async function CommunityPage() {
  const { ambassadors, players, sponsors, associations } = await getCommunity()
  return (
    <>
      <Container className="py-14 lg:py-20">
        <p className="font-display text-sm font-bold uppercase tracking-[0.3em] text-brand-accent">Comunidad</p>
        <h1 className="mt-2 font-display text-6xl font-black uppercase italic leading-[0.85] lg:text-8xl">La manada Yaguá</h1>
        <SectionTitle className="mt-16">Embajadores</SectionTitle>
        <div className="mt-8 space-y-6">
          {ambassadors.map((a) => (
            <article key={a.id} id={a.slug} className="grid scroll-mt-24 gap-6 bg-brand-mist sm:grid-cols-[260px_1fr]">
              <div className="relative aspect-[3/4] sm:aspect-auto sm:min-h-[320px]">
                <Image src={a.photo} alt={a.name} fill sizes="260px" className="object-cover" />
              </div>
              <div className="p-6 sm:py-8 sm:pr-8">
                <p className="font-display text-sm font-bold uppercase tracking-widest text-brand-accent">{a.sport}</p>
                <h2 className="font-display text-4xl font-extrabold uppercase italic">{a.name}</h2>
                <p className="mt-3 max-w-xl text-brand-muted">{a.bio}</p>
                {a.instagram && (
                  <a href={a.instagram} target="_blank" rel="noopener" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold underline">
                    <InstagramIcon size={16} /> Ver en Instagram
                  </a>
                )}
                {a.favorites.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm font-semibold uppercase tracking-wide">Sus productos favoritos</p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {a.favorites.map((f) => (
                        <li key={f.slug}>
                          <Link href={`/${f.sport.slug}/${f.category.slug}/${f.slug}`} className="inline-block border border-brand-ink bg-white px-3 py-1.5 text-sm hover:bg-brand-ink hover:text-white">
                            {f.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </Container>
      <Players players={players} />
      <SponsorsAndAssociations sponsors={sponsors} associations={associations} />
    </>
  )
}
