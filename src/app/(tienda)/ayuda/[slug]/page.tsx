import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { COMMERCE, SITE } from '@/lib/site'

// TODO: textos legales y políticas definitivas, a validar con el cliente.
const PAGES: Record<string, { title: string; body: string[] }> = {
  envios: {
    title: 'Envíos y retiros',
    body: [
      `Enviamos a todo el país. Las compras desde $${COMMERCE.freeShippingFrom.toLocaleString('es-AR')} tienen envío gratis.`,
      'En Concepción del Uruguay entregamos en el día. En el resto de Entre Ríos, de 2 a 4 días hábiles; en el resto del país, de 4 a 7.',
      `También podés retirar sin cargo en nuestro local (${SITE.address}). Te avisamos cuando el pedido esté listo.`,
    ],
  },
  cambios: {
    title: 'Cambios y devoluciones',
    body: [
      'Tenés 30 días desde que recibís tu compra para cambiar talle o color. La prenda tiene que estar sin uso y con su etiqueta.',
      'Los cambios se pueden hacer en el local o por envío (el primer cambio por envío es sin cargo).',
      'Para devoluciones por arrepentimiento, usá el botón de arrepentimiento al pie de la página.',
    ],
  },
  'guia-de-talles': {
    title: 'Guía de talles',
    body: ['En cada producto vas a encontrar la guía de talles con las medidas en centímetros. Si estás entre dos talles, te recomendamos el más grande.'],
  },
  'medios-de-pago': {
    title: 'Medios de pago',
    body: [
      `Tarjetas de crédito con ${COMMERCE.interestFreeInstallments.join(' y ')} cuotas sin interés, débito y dinero en cuenta a través de Mercado Pago.`,
      `Transferencia bancaria con ${COMMERCE.transferDiscountPct}% de descuento.`,
      'Efectivo al retirar en el local.',
    ],
  },
  terminos: {
    title: 'Términos y condiciones',
    body: ['TODO: términos y condiciones de uso del sitio y de compra. Todos los precios publicados incluyen IVA.'],
  },
  privacidad: {
    title: 'Política de privacidad',
    body: ['TODO: política de privacidad conforme a la Ley 25.326 de Protección de Datos Personales.'],
  },
}

export function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = PAGES[(await params).slug]
  return page ? { title: page.title } : {}
}

export default async function HelpPage({ params }: { params: Promise<{ slug: string }> }) {
  const page = PAGES[(await params).slug]
  if (!page) notFound()
  return (
    <Container className="max-w-3xl py-14">
      <h1 className="font-display text-5xl font-black uppercase italic">{page.title}</h1>
      <div className="mt-6 space-y-4 leading-relaxed">
        {page.body.map((p) => <p key={p}>{p}</p>)}
      </div>
    </Container>
  )
}
