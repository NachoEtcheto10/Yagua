import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { COMMERCE, SITE } from '@/lib/site'

// TODO: textos legales estándar para la demo; validar con el cliente (y su contador/abogado) antes de publicar.
const PAGES: Record<string, { title: string; body: string[] }> = {
  envios: {
    title: 'Envíos y retiros',
    body: [
      `Enviamos a todo el país. Las compras desde $${COMMERCE.freeShippingFrom.toLocaleString('es-AR')} tienen envío gratis.`,
      'En Concepción del Uruguay entregamos en el día. En el resto de Entre Ríos, de 2 a 4 días hábiles; en el resto del país, de 4 a 7.',
      `También podés retirar sin cargo en nuestro local (${SITE.address}, ${SITE.city}). Te avisamos cuando el pedido esté listo.`,
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
    body: [
      `Este sitio es la tienda online de ${SITE.legalName}, con local en ${SITE.address}, ${SITE.city}. Al comprar aceptás estas condiciones.`,
      'Los precios están expresados en pesos argentinos, con IVA incluido, y pueden cambiar sin aviso previo. El precio que vale es el que figura al confirmar el pedido.',
      'Los pedidos quedan sujetos a disponibilidad de stock y a la acreditación del pago. Si un producto se agota después de la compra, te avisamos y te devolvemos el dinero o te ofrecemos un cambio.',
      'Las fotos son ilustrativas: los colores pueden variar levemente según la pantalla.',
      'Podés arrepentirte de la compra dentro de los 10 días corridos desde que recibís el producto, sin dar motivos (Ley 24.240 de Defensa del Consumidor). Usá el botón de arrepentimiento al pie de la página.',
      `Ante cualquier consulta, escribinos por WhatsApp al ${SITE.whatsappDisplay} o acercate al local.`,
    ],
  },
  privacidad: {
    title: 'Política de privacidad',
    body: [
      'Usamos tus datos (nombre, e-mail, teléfono, DNI y dirección) solo para procesar tus pedidos, enviarlos y contactarte por tu compra.',
      'Si te suscribís al newsletter, te mandamos novedades y promociones. Te podés dar de baja cuando quieras.',
      'No vendemos ni compartimos tus datos con terceros, salvo con quienes hacen posible la compra: Mercado Pago para el cobro y la empresa de correo para el envío.',
      'Los pagos con tarjeta los procesa Mercado Pago: nosotros nunca vemos ni guardamos los datos de tu tarjeta.',
      'Podés pedir acceder, corregir o borrar tus datos escribiéndonos por WhatsApp (Ley 25.326 de Protección de Datos Personales). La Agencia de Acceso a la Información Pública es el órgano de control de esta ley.',
    ],
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
