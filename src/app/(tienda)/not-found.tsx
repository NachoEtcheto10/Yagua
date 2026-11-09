import Link from 'next/link'
import { Container, buttonClass } from '@/components/ui/Container'

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <p className="font-display text-9xl font-black italic text-brand-secondary">404</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold uppercase italic">Te fuiste del camino</h1>
      <p className="mt-2 text-brand-muted">La página que buscás no existe o se movió.</p>
      <Link href="/" className={`${buttonClass.primary} mt-8`}>Volver al inicio</Link>
    </Container>
  )
}
