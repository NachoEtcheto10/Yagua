import { Clock, MapPin, MessageCircle } from 'lucide-react'
import { FacebookIcon, InstagramIcon } from '@/components/ui/SocialIcons'
import Image from 'next/image'
import Link from 'next/link'
import { Newsletter } from '@/features/home/Newsletter'
import { SITE } from '@/lib/site'
import type { NavSport } from './nav-types'

const HELP = [
  { href: '/ayuda/envios', label: 'Envíos y retiros' },
  { href: '/ayuda/cambios', label: 'Cambios y devoluciones' },
  { href: '/ayuda/guia-de-talles', label: 'Guía de talles' },
  { href: '/ayuda/medios-de-pago', label: 'Medios de pago' },
  { href: '/ayuda/terminos', label: 'Términos y condiciones' },
  { href: '/ayuda/privacidad', label: 'Política de privacidad' },
]

const PAYMENTS = ['Mercado Pago', 'Visa', 'Mastercard', 'American Express', 'Naranja X', 'Transferencia', 'Efectivo']

export function Footer({ sports }: { sports: NavSport[] }) {
  return (
    <footer>
      <Newsletter />
      <div className="bg-brand-primary text-white">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.2fr_1fr_1fr_1.4fr] lg:px-10">
          <div>
            <Image src="/brand/yagua-logo-white.svg" alt="Yaguá" width={140} height={60} className="h-14 w-auto" />
            <p className="mt-5 max-w-xs text-sm text-white/70">{SITE.description}</p>
            <div className="mt-6 flex gap-3">
              <a href={SITE.instagram} target="_blank" rel="noopener" aria-label="Instagram" className="grid h-10 w-10 place-items-center border border-white/30 hover:bg-white hover:text-brand-ink"><InstagramIcon /></a>
              {SITE.facebook && <a href={SITE.facebook} target="_blank" rel="noopener" aria-label="Facebook" className="grid h-10 w-10 place-items-center border border-white/30 hover:bg-white hover:text-brand-ink"><FacebookIcon /></a>}
              <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener" aria-label="WhatsApp" className="grid h-10 w-10 place-items-center border border-white/30 hover:bg-white hover:text-brand-ink"><MessageCircle size={18} /></a>
            </div>
          </div>

          <nav aria-label="Deportes">
            <h3 className="font-display text-lg font-bold uppercase tracking-wide">Deportes</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/75">
              {sports.map((s) => (
                <li key={s.slug}><Link href={`/${s.slug}`} className="hover:text-white">{s.name}</Link></li>
              ))}
              <li><Link href="/personalizados" className="hover:text-white">Personalizados</Link></li>
              <li><Link href="/comunidad" className="hover:text-white">Comunidad</Link></li>
            </ul>
          </nav>

          <nav aria-label="Ayuda">
            <h3 className="font-display text-lg font-bold uppercase tracking-wide">Ayuda</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/75">
              {HELP.map((h) => (
                <li key={h.href}><Link href={h.href} className="hover:text-white">{h.label}</Link></li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="font-display text-lg font-bold uppercase tracking-wide">Visitanos</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/75">
              <li className="flex gap-2"><MapPin size={18} className="mt-0.5 shrink-0 text-brand-secondary" /> {SITE.address} · {SITE.city}</li>
              <li className="flex gap-2"><Clock size={18} className="mt-0.5 shrink-0 text-brand-secondary" /> {SITE.hours}</li>
              <li className="flex gap-2"><MessageCircle size={18} className="mt-0.5 shrink-0 text-brand-secondary" /> <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener" className="hover:text-white">{SITE.whatsappDisplay}</a></li>
            </ul>
            <div className="mt-4 aspect-[16/9] overflow-hidden bg-white/10">
              <iframe
                title="Mapa del local de Yaguá"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${encodeURIComponent(SITE.mapsQuery)}&z=14&output=embed`}
                className="h-full w-full border-0 grayscale"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-white/15">
          <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Medios de pago</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {PAYMENTS.map((p) => (
                <li key={p} className="border border-white/25 px-2.5 py-1 text-xs text-white/80">{p}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/15">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-6 text-xs text-white/60 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
            <p>
              © {new Date().getFullYear()} {SITE.legalName}{SITE.cuit && ` · CUIT ${SITE.cuit}`} · Todos los precios incluyen IVA.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a href="https://www.argentina.gob.ar/produccion/defensadelconsumidor/formulario" target="_blank" rel="noopener" className="underline hover:text-white">
                Defensa de las y los Consumidores
              </a>
              {/* Obligatorio (Res. 424/2020): botón de arrepentimiento visible */}
              <Link href="/arrepentimiento" className="border border-white px-3 py-1.5 font-semibold uppercase tracking-wide text-white hover:bg-white hover:text-brand-ink">
                Botón de arrepentimiento
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
