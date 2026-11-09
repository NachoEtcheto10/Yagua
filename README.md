# Yaguá — tienda online

E-commerce de Yaguá (indumentaria y equipamiento deportivo, Concepción del Uruguay) con la submarca **King Fishing**.
Desarrollado por Sodalis Software.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · Framer Motion · Prisma 7 + Neon Postgres · Auth.js · Mercado Pago · Zod · React Hook Form · Zustand.

## Puesta en marcha

```bash
npm install                  # también genera el cliente de Prisma
neon env pull                # o copiá .env.example a .env.local y completalo
npx prisma migrate deploy    # crea las tablas en Neon (usa DATABASE_URL_UNPOOLED)
npm run db:seed              # carga el catálogo de demo y el usuario admin
npm run dev                  # http://localhost:3000
```

Las fotos de `public/` ya están en el repo. Si se agregan fotos nuevas a la carpeta local `Imagenes/` (no se sube al repo),
se regeneran con `npm run images`.

## Estructura

```
src/
  app/(tienda)/      páginas públicas: home, /[deporte], /[deporte]/[categoria]/[producto], checkout, cuenta…
  app/api/           auth, búsqueda, webhook de Mercado Pago
  features/          código por funcionalidad: catalog, cart, checkout, payments, home, auth
  components/        layout (header, footer) y UI reutilizable
  lib/               db (Prisma + pg pool), auth, datos de la tienda (site.ts)
prisma/              schema, migraciones y seed
```

## Reglas importantes

- **Precios:** el servidor recalcula siempre precios, descuentos y envío (`features/checkout/actions.ts`). Nunca se usa el precio que manda el navegador.
- **Stock:** se reserva al crear el pedido y se devuelve si el pago de Mercado Pago se rechaza o cancela.
- **Mercado Pago:** con credenciales de prueba (`TEST-…`) funciona en sandbox. El webhook verifica la firma (`MP_WEBHOOK_SECRET`).
- **Datos de la tienda** (dirección, WhatsApp, montos de envío gratis, cuotas, descuento por transferencia): `src/lib/site.ts`.
- Lo pendiente de confirmar con el cliente está marcado con `TODO:` en el código.
