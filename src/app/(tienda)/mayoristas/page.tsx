import { ArrowRight, BadgePercent, Building2, ClipboardCheck, PackageCheck, Truck } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { buttonClass, Container, Rosettes, SectionTitle } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { getWholesaleAccess, getWholesaleSettings } from '@/features/wholesale/settings'
import { formatPrice } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Ventas mayoristas',
  description: 'Precios mayoristas de Yaguá para tiendas deportivas, clubes, colegios y empresas.',
}

export default async function WholesaleLanding() {
  const [settings, access] = await Promise.all([getWholesaleSettings(), getWholesaleAccess()])
  const approved = access.state === 'APPROVED'
  const pending = access.state === 'PENDING'
  const steps = [
    { icon: ClipboardCheck, title: 'Pedí tu cuenta', text: 'Completá los datos de tu empresa: razón social, CUIT, rubro y cuánto comprarías.' },
    { icon: Building2, title: 'La revisamos', text: 'Te respondemos en 24-48 h hábiles. Si está todo bien, tu cuenta queda aprobada.' },
    { icon: BadgePercent, title: 'Comprá por mayor', text: `Ves todos los productos a precio mayorista (${settings.discountPct}% menos) y armás tu pedido.` },
  ]
  return (
    <>
      <section className="relative overflow-hidden bg-brand-turquoise">
        <Rosettes tone="light" className="opacity-[0.07]" />
        <Container className="relative py-16 lg:py-24">
          <p className="font-display text-sm font-extrabold uppercase tracking-[0.2em]">Ventas mayoristas</p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-black uppercase leading-[0.95] sm:text-6xl lg:text-7xl">
            Vestí a tu tienda, club o empresa <span className="text-white">por mayor</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg font-medium text-brand-ink/80">
            Precios especiales para tiendas deportivas, clubes, colegios, gimnasios y empresas que necesitan uniformes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {approved ? (
              <Link href="/mayoristas/catalogo" className={buttonClass.primary}>Ir al catálogo mayorista <ArrowRight size={20} /></Link>
            ) : pending ? (
              <Link href="/mayoristas/catalogo" className={buttonClass.primary}>Ver el estado de mi solicitud <ArrowRight size={20} /></Link>
            ) : (
              <>
                <Link href="/mayoristas/registro" className={buttonClass.primary}>Pedir cuenta mayorista <ArrowRight size={20} /></Link>
                <Link href="/ingresar?tipo=empresa" className="group inline-flex items-center gap-3 border-2 border-brand-ink px-6 py-3 font-display text-lg font-bold uppercase transition hover:bg-white">
                  Ya tengo cuenta
                </Link>
              </>
            )}
          </div>
        </Container>
      </section>

      <section className="py-16 lg:py-24">
        <Container>
          <SectionTitle>Cómo funciona</SectionTitle>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 0.1} className="relative border-2 border-brand-ink p-6">
                <span className="absolute -top-5 left-6 grid h-10 w-10 place-items-center bg-brand-secondary font-display text-xl font-black">{i + 1}</span>
                <s.icon size={28} className="mt-4 text-brand-turquoise-deep" />
                <h2 className="mt-4 font-display text-2xl font-black uppercase">{s.title}</h2>
                <p className="mt-2 text-brand-muted">{s.text}</p>
              </Reveal>
            ))}
          </ol>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              { icon: BadgePercent, big: `${settings.discountPct}%`, small: 'menos que el precio de lista' },
              { icon: PackageCheck, big: formatPrice(settings.minPurchase), small: 'de compra mínima por pedido' },
              { icon: Truck, big: 'Todo el país', small: 'retiro en el local o envío coordinado' },
            ].map((x) => (
              <div key={x.small} className="flex items-center gap-4 bg-brand-mist p-5">
                <x.icon size={32} className="shrink-0 text-brand-accent" />
                <p><span className="block font-display text-3xl font-black">{x.big}</span><span className="text-sm text-brand-muted">{x.small}</span></p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  )
}
