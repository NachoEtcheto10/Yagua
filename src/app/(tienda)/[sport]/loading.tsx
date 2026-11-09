import { Container } from '@/components/ui/Container'

/** Esqueleto que aparece al instante al entrar a un deporte o categoría, mientras llegan los productos */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Cargando productos">
      <div className="relative min-h-[44vh] animate-pulse bg-brand-primary lg:min-h-[52vh]">
        <div className="absolute bottom-8 left-4 space-y-4 sm:left-6 lg:bottom-12 lg:left-10">
          <div className="h-14 w-64 bg-white/10 lg:h-20 lg:w-96" />
          <div className="h-4 w-72 bg-white/10" />
          <div className="flex gap-2 pt-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-9 w-24 bg-white/10" />
            ))}
          </div>
        </div>
      </div>
      <section className="py-12 lg:py-16">
        <Container>
          <div className="mb-8 h-9 w-56 animate-pulse bg-brand-mist" />
          <div className="grid gap-8 lg:grid-cols-[240px_1fr] xl:grid-cols-[260px_1fr]">
            <div className="hidden space-y-4 lg:block">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="h-10 animate-pulse bg-brand-mist" />
              ))}
            </div>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <li key={i} className="animate-pulse">
                  <div className="aspect-square bg-brand-mist" />
                  <div className="mt-3 h-4 w-3/4 bg-brand-mist" />
                  <div className="mt-2 h-4 w-1/3 bg-brand-mist" />
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>
    </div>
  )
}
