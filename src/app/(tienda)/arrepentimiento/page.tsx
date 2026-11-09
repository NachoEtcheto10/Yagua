import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { SITE } from '@/lib/site'

export const metadata: Metadata = { title: 'Botón de arrepentimiento' }

// Res. 424/2020 de la Secretaría de Comercio Interior: revocación de compras online.
// TODO Fase 3: formulario que registre la solicitud en el admin y envíe un código de trámite por e-mail.
export default function RevocationPage() {
  const body = encodeURIComponent('Quiero revocar mi compra.\nNúmero de pedido: \nNombre y apellido: \nDNI: \nMotivo (opcional): ')
  return (
    <Container className="max-w-3xl py-14">
      <h1 className="font-display text-5xl font-black uppercase italic">Botón de arrepentimiento</h1>
      <div className="mt-6 space-y-4 text-brand-ink/90">
        <p>
          Tenés derecho a revocar tu compra dentro de los <strong>10 días corridos</strong> desde que recibiste el producto o firmaste el contrato, sin
          costo ni responsabilidad alguna (art. 34 de la Ley 24.240 de Defensa del Consumidor).
        </p>
        <p>El producto tiene que estar sin uso y con su etiqueta. Los costos de devolución corren por nuestra cuenta.</p>
        <p>Envianos la solicitud con tu número de pedido y en 24 horas hábiles te respondemos con el código de trámite.</p>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <a href={`mailto:${SITE.email}?subject=${encodeURIComponent('Solicitud de arrepentimiento')}&body=${body}`} className="bg-brand-primary px-6 py-3.5 font-display text-lg font-bold uppercase text-white">
          Solicitar por e-mail
        </a>
        <a href={`https://wa.me/${SITE.whatsapp}?text=${body}`} target="_blank" rel="noopener" className="border-2 border-brand-ink px-6 py-3 font-display text-lg font-bold uppercase">
          Solicitar por WhatsApp
        </a>
      </div>
    </Container>
  )
}
