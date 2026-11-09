import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { CheckoutForm } from '@/features/checkout/CheckoutForm'
import { mercadoPagoEnabled } from '@/features/payments/mercadopago'
import { auth } from '@/lib/auth'

export const metadata: Metadata = { title: 'Checkout', robots: { index: false } }

export default async function CheckoutPage() {
  const session = await auth()
  const [firstName, ...rest] = (session?.user?.name ?? '').split(' ')
  return (
    <Container className="py-10 lg:py-14">
      <h1 className="mb-8 font-display text-5xl font-black uppercase italic">Finalizar compra</h1>
      <CheckoutForm
        mpEnabled={mercadoPagoEnabled()}
        defaults={{ email: session?.user?.email ?? '', firstName: firstName ?? '', lastName: rest.join(' ') }}
      />
    </Container>
  )
}
