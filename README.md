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

## Despliegue en Vercel

1. Importar el repo en Vercel (framework: Next.js, sin cambios en build).
2. Variables de entorno (Settings → Environment Variables), copiadas de `.env.local`:
   `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `AUTH_SECRET`.
   Para subir fotos desde el panel (almacenamiento de Neon, bucket `assets`), con los valores de las AWS_* de `.env.local`
   pero con estos nombres, porque Vercel reserva los AWS_*:
   `STORAGE_ACCESS_KEY_ID` (= AWS_ACCESS_KEY_ID), `STORAGE_SECRET_ACCESS_KEY` (= AWS_SECRET_ACCESS_KEY),
   `STORAGE_ENDPOINT_URL` (= AWS_ENDPOINT_URL_S3). La región queda fija en `us-east-1` (se cambia con `STORAGE_REGION`).
3. La región de las funciones queda en `iad1` (Washington) por `vercel.json`, al lado de la base de Neon (us-east-1).
4. Mientras sea demo no se indexa en Google. Para lanzarla: `SITE_INDEXABLE=true` y `NEXT_PUBLIC_SITE_URL` con el dominio real.

## Panel de administración

`/admin` (solo usuarios con rol ADMIN; el seed crea `SEED_ADMIN_EMAIL`). Resumen de ventas, pedidos con cambio de estado
(devuelve el stock al cancelar), productos con talles/colores/stock y fotos, cupones, campañas de la home,
pedidos de personalizados y clientes.

## Catálogo importado de Tiendanube

`scripts/tiendanube/`: baja los productos de la tienda actual, los ubica en deportes/categorías (`map.py`)
y optimiza las fotos (`images.mjs`). El resultado está en `prisma/data/tiendanube.json` y lo carga el seed.

## Estructura

```
src/
  app/(tienda)/      páginas públicas: home, /[deporte], /[deporte]/[categoria]/[producto], checkout, cuenta…
  app/admin/         panel de administración
  app/api/           auth, búsqueda, webhook de Mercado Pago
  features/          código por funcionalidad: catalog, cart, checkout, payments, home, auth, admin
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
