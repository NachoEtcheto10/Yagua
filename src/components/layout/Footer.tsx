import { Clock, MapPin, MessageCircle } from 'lucide-react'
import { Rosettes } from '@/components/ui/Container'
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
      <div className="relative border-t border-brand-line bg-brand-mist text-brand-ink">
        <Rosettes tone="light" className="opacity-[0.05]" />
        {/* En el celular: Deportes y Ayuda lado a lado y sin el mapa embebido, para que el pie sea corto */}
        <div className="relative mx-auto grid max-w-[1440px] grid-cols-2 gap-x-6 gap-y-10 px-4 py-12 sm:gap-10 sm:px-6 sm:py-14 lg:grid-cols-[1.2fr_1fr_1fr_1.4fr] lg:px-10">
          <div className="col-span-2 sm:col-span-1">
            {/* Logo original: ojos con contorno negro, sobre el fondo claro */}
            <Image src="/brand/yagua-logo.svg" alt="Yaguá" width={130} height={56} className="h-12 w-auto" />
            <p className="mt-5 max-w-xs text-sm text-brand-muted">{SITE.description}</p>
            <div className="mt-6 flex gap-3">
              <a href={SITE.instagram} target="_blank" rel="noopener" aria-label="Instagram" className="grid h-10 w-10 place-items-center border border-brand-ink/20 transition hover:bg-brand-ink hover:text-brand-accent"><InstagramIcon /></a>
              {SITE.facebook && <a href={SITE.facebook} target="_blank" rel="noopener" aria-label="Facebook" className="grid h-10 w-10 place-items-center border border-brand-ink/20 transition hover:bg-brand-ink hover:text-brand-accent"><FacebookIcon /></a>}
              <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener" aria-label="WhatsApp" className="grid h-10 w-10 place-items-center border border-brand-ink/20 transition hover:bg-brand-ink hover:text-brand-accent"><MessageCircle size={18} /></a>
            </div>
          </div>

          <nav aria-label="Deportes">
            <h3 className="font-display text-lg font-bold uppercase tracking-wide">Deportes</h3>
            <ul className="mt-4 space-y-2 text-sm text-brand-ink/75">
              {sports.map((s) => (
                <li key={s.slug}><Link href={`/${s.slug}`} className="hover:text-brand-accent">{s.name}</Link></li>
              ))}
              <li><Link href="/personalizados" className="hover:text-brand-accent">Personalizados</Link></li>
              <li><Link href="/comunidad" className="hover:text-brand-accent">Comunidad</Link></li>
              <li><Link href="/mayoristas" className="hover:text-brand-accent">Ventas mayoristas</Link></li>
            </ul>
          </nav>

          <nav aria-label="Ayuda">
            <h3 className="font-display text-lg font-bold uppercase tracking-wide">Ayuda</h3>
            <ul className="mt-4 space-y-2 text-sm text-brand-ink/75">
              {HELP.map((h) => (
                <li key={h.href}><Link href={h.href} className="hover:text-brand-accent">{h.label}</Link></li>
              ))}
            </ul>
          </nav>

          <div className="col-span-2 sm:col-span-1">
            <h3 className="font-display text-lg font-bold uppercase tracking-wide">Visitanos</h3>
            <ul className="mt-4 space-y-3 text-sm text-brand-ink/75">
              <li className="flex gap-2"><MapPin size={18} className="mt-0.5 shrink-0 text-brand-ink" /> {SITE.address} · {SITE.city}</li>
              <li className="flex gap-2"><Clock size={18} className="mt-0.5 shrink-0 text-brand-ink" /> {SITE.hours}</li>
              <li className="flex gap-2"><MessageCircle size={18} className="mt-0.5 shrink-0 text-brand-ink" /> <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener" className="hover:text-brand-accent">{SITE.whatsappDisplay}</a></li>
            </ul>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.mapsQuery)}`}
              target="_blank"
              rel="noopener"
              className="mt-4 inline-flex items-center gap-2 border border-brand-ink px-4 py-2 text-sm font-semibold uppercase tracking-wide transition hover:bg-brand-ink hover:text-white sm:hidden"
            >
              <MapPin size={16} /> Cómo llegar
            </a>
            <div className="mt-4 hidden aspect-[16/9] overflow-hidden bg-brand-line sm:block">
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

        <div className="relative border-t border-brand-line">
          <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">Medios de pago</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {PAYMENTS.map((p) => (
                <li key={p} className="border border-brand-ink/15 bg-white px-2.5 py-1 text-xs text-brand-ink/80">{p}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative border-t border-brand-line">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-6 text-xs text-brand-muted sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
            <p>
              © {new Date().getFullYear()} {SITE.legalName}{SITE.cuit && ` · CUIT ${SITE.cuit}`} · Todos los precios incluyen IVA.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a href="https://www.argentina.gob.ar/produccion/defensadelconsumidor/formulario" target="_blank" rel="noopener" className="underline hover:text-brand-accent">
                Defensa de las y los Consumidores
              </a>
              {/* Obligatorio (Res. 424/2020): botón de arrepentimiento visible */}
              <Link href="/arrepentimiento" className="border border-brand-ink px-3 py-1.5 font-semibold uppercase tracking-wide text-brand-ink transition hover:bg-brand-ink hover:text-white">
                Botón de arrepentimiento
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
