import { Clock, LogIn, XCircle } from 'lucide-react'
import Link from 'next/link'
import { buttonClass } from '@/components/ui/Container'
import { SITE } from '@/lib/site'
import type { WholesaleAccess } from './settings'

/** Lo que ve quien entra al área mayorista sin una cuenta aprobada */
export function WholesaleStatus({ access, next }: { access: WholesaleAccess; next: string }) {
  const box = 'mx-auto max-w-xl border-2 border-brand-ink p-8 text-center'
  if (access.state === 'guest') {
    return (
      <div className={box}>
        <LogIn size={40} className="mx-auto text-brand-turquoise-deep" />
        <h1 className="mt-4 font-display text-3xl font-black uppercase">Área mayorista</h1>
        <p className="mt-2 text-brand-muted">Ingresá con la cuenta de tu empresa para ver los precios mayoristas.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href={`/ingresar?tipo=empresa&volver=${encodeURIComponent(next)}`} className={buttonClass.primary}>Ingresar como empresa</Link>
          <Link href="/mayoristas/registro" className={buttonClass.outline}>Pedir cuenta</Link>
        </div>
      </div>
    )
  }
  if (access.state === 'no-account') {
    return (
      <div className={box}>
        <h1 className="font-display text-3xl font-black uppercase">Tu cuenta no es mayorista</h1>
        <p className="mt-2 text-brand-muted">Completá los datos de tu empresa y la revisamos.</p>
        <Link href="/mayoristas/registro" className={`${buttonClass.primary} mt-6`}>Pedir cuenta mayorista</Link>
      </div>
    )
  }
  if (access.state === 'PENDING') {
    return (
      <div className={box}>
        <Clock size={40} className="mx-auto text-brand-turquoise-deep" />
        <h1 className="mt-4 font-display text-3xl font-black uppercase">Estamos revisando tu solicitud</h1>
        <p className="mt-2 text-brand-muted">
          Recibimos los datos de <strong className="text-brand-ink">{access.account.companyName}</strong>. Te respondemos en 24-48 h hábiles; cuando la aprobemos vas a ver acá el catálogo con precios mayoristas.
        </p>
        <a href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(`¡Hola! Pedí una cuenta mayorista para ${access.account.companyName}.`)}`} target="_blank" rel="noopener" className={`${buttonClass.outline} mt-6`}>Escribinos por WhatsApp</a>
      </div>
    )
  }
  return (
    <div className={box}>
      <XCircle size={40} className="mx-auto text-brand-accent" />
      <h1 className="mt-4 font-display text-3xl font-black uppercase">No pudimos aprobar la cuenta</h1>
      {access.state === 'REJECTED' && access.account.adminNote && <p className="mt-2 text-brand-ink">{access.account.adminNote}</p>}
      <p className="mt-2 text-brand-muted">Si creés que es un error, escribinos y lo vemos.</p>
      <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener" className={`${buttonClass.primary} mt-6`}>Escribinos por WhatsApp</a>
    </div>
  )
}
