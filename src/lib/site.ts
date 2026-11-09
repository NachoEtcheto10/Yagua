// Datos de la tienda y reglas comerciales. Un solo lugar para cambiarlos.
// TODO: confirmar con el cliente dirección, teléfono, redes, CUIT y montos.

// En Vercel, si no se define NEXT_PUBLIC_SITE_URL, se usa el dominio de producción del proyecto
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null

/** Mientras sea demo, la tienda no aparece en Google. Para publicarla: SITE_INDEXABLE=true en Vercel. */
export const INDEXABLE = process.env.SITE_INDEXABLE === 'true'

export const SITE = {
  name: 'Yaguá',
  url: process.env.NEXT_PUBLIC_SITE_URL || vercelUrl || 'http://localhost:3000',
  description:
    'Indumentaria y equipamiento deportivo de Concepción del Uruguay: running, hockey, pádel, tenis, trekking, golf y King Fishing.',
  city: 'Concepción del Uruguay, Entre Ríos',
  address: 'TODO: dirección del local', // TODO
  mapsQuery: 'Concepción del Uruguay, Entre Ríos',
  hours: 'Lunes a viernes 9 a 13 y 17 a 21 · Sábados 9 a 13', // TODO
  whatsapp: '5493442000000', // TODO: número real
  email: 'hola@yagua.com.ar', // TODO
  instagram: 'https://instagram.com/', // TODO
  facebook: 'https://facebook.com/', // TODO
  legalName: 'TODO: razón social', // TODO
  cuit: 'TODO', // TODO
} as const

export const COMMERCE = {
  /** Envío gratis desde este monto (en pesos) */
  freeShippingFrom: 150_000,
  /** Descuento por pagar con transferencia (%) */
  transferDiscountPct: 10,
  /** Cuotas sin interés con tarjeta */
  interestFreeInstallments: [3, 6],
  /** Costos de envío estimados (TODO: integrar Andreani / Correo Argentino) */
  shipping: {
    local: 0, // Concepción del Uruguay: envío en el día sin cargo
    entreRios: 7_990,
    rest: 11_990,
  },
} as const

export const ANNOUNCEMENTS = [
  `Envío gratis desde $${COMMERCE.freeShippingFrom.toLocaleString('es-AR')}`,
  `${COMMERCE.interestFreeInstallments.join(' y ')} cuotas sin interés`,
  `${COMMERCE.transferDiscountPct}% OFF pagando con transferencia`,
  'Retiro gratis en el local de Concepción del Uruguay',
]
