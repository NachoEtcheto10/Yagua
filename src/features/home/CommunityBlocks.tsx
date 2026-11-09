import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Container, SectionTitle } from '@/components/ui/Container'
import { Marquee } from '@/components/ui/Marquee'
import { Reveal } from '@/components/ui/Reveal'
import { InstagramIcon } from '@/components/ui/SocialIcons'
import type { getCommunity } from './queries'

type Community = Awaited<ReturnType<typeof getCommunity>>

export function Ambassadors({ ambassadors }: { ambassadors: Community['ambassadors'] }) {
  return (
    <section className="py-16 lg:py-24">
      <Container>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-display text-sm font-bold uppercase tracking-[0.3em] text-brand-accent">Comunidad</p>
            <SectionTitle className="mt-2">Embajadores</SectionTitle>
          </div>
          <Link href="/comunidad" className="hidden items-center gap-2 font-semibold underline-offset-4 hover:underline sm:flex">
            Conocelos <ArrowRight size={18} />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
          {ambassadors.map((a, i) => (
            <Reveal key={a.id} delay={i * 0.08}>
              <Link href={`/comunidad#${a.slug}`} className="group relative block aspect-[3/4] overflow-hidden bg-brand-mist">
                <Image src={a.photo} alt={a.name} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white lg:p-5">
                  <p className="font-display text-sm font-bold uppercase tracking-widest text-brand-secondary">{a.sport}</p>
                  <p className="font-display text-2xl font-extrabold uppercase italic leading-none lg:text-3xl">{a.name}</p>
                  <p className="mt-2 hidden text-sm text-white/80 sm:line-clamp-2">{a.bio}</p>
                </div>
                {a.instagram && (
                  <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-brand-ink">
                    <InstagramIcon size={16} />
                  </span>
                )}
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

export function Players({ players }: { players: Community['players'] }) {
  return (
    <section className="bg-brand-primary py-16 text-white lg:py-24">
      <Container>
        <SectionTitle light>Vistieron Yaguá</SectionTitle>
        <p className="mt-3 max-w-xl text-white/70">Jugadoras y jugadores que eligieron nuestra ropa para competir.</p>
        <div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {players.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.05}>
              <figure className="group relative aspect-[4/5] overflow-hidden">
                <Image src={p.photo} alt={`${p.name}, ${p.sport}`} fill sizes="(min-width: 1024px) 16vw, 45vw" className="object-cover grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0" />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-10">
                  <span className="block font-display text-lg font-bold uppercase leading-none">{p.name}</span>
                  <span className="block text-xs text-white/70">{p.club} · {p.sport}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

/** Wordmark tipográfico mientras no haya logos reales (TODO: logos de sponsors y asociaciones) */
function Wordmark({ name, sub }: { name: string; sub: string }) {
  return (
    <div className="flex h-24 w-56 shrink-0 flex-col items-center justify-center border border-brand-line px-4 text-center">
      <span className="font-display text-lg font-extrabold uppercase leading-tight">{name}</span>
      <span className="text-[11px] uppercase tracking-widest text-brand-muted">{sub}</span>
    </div>
  )
}

export function SponsorsAndAssociations({ sponsors, associations }: { sponsors: Community['sponsors']; associations: Community['associations'] }) {
  return (
    <section className="py-16 lg:py-20">
      <Container>
        <SectionTitle>Sponsors y asociaciones</SectionTitle>
        <p className="mt-3 max-w-xl text-brand-muted">Acompañamos a los clubes, eventos y entidades que hacen crecer el deporte en la región.</p>
      </Container>
      <div className="mt-10 space-y-4">
        <Marquee label="Sponsors">
          {sponsors.map((s) => <Wordmark key={s.id} name={s.name} sub={s.kind} />)}
        </Marquee>
        <Marquee label="Asociaciones">
          {associations.map((a) => <Wordmark key={a.id} name={a.name} sub="Asociación" />)}
        </Marquee>
      </div>
    </section>
  )
}
