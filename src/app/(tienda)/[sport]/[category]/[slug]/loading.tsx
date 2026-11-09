import { Container } from '@/components/ui/Container'

/** Esqueleto de la ficha de producto */
export default function Loading() {
  return (
    <Container className="py-6 lg:py-10">
      <div aria-busy="true" aria-label="Cargando producto" className="animate-pulse">
        <div className="mb-5 h-4 w-64 bg-brand-mist" />
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
          <div>
            <div className="aspect-square bg-brand-mist" />
            <div className="mt-3 grid grid-cols-5 gap-2">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="aspect-square bg-brand-mist" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-4 w-32 bg-brand-mist" />
            <div className="h-12 w-4/5 bg-brand-mist" />
            <div className="h-7 w-40 bg-brand-mist" />
            <div className="flex gap-2 pt-4">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="h-12 w-12 rounded-full bg-brand-mist" />
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2 pt-4">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="h-12 bg-brand-mist" />
              ))}
            </div>
            <div className="h-14 bg-brand-mist" />
          </div>
        </div>
      </div>
    </Container>
  )
}
