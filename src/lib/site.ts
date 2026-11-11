// Datos de la tienda y reglas comerciales. Un solo lugar para cambiarlos.
// TODO: confirmar con el cliente e-mail, Facebook, razón social, CUIT y montos de envío.

// En Vercel, si no se define NEXT_PUBLIC_SITE_URL, se usa el dominio de producción del proyecto
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null

/** Mientras sea demo, la tienda no aparece en Google. Para publicarla: SITE_INDEXABLE=true en Vercel. */
export const INDEXABLE = process.env.SITE_INDEXABLE === 'true'

export const SITE = {
  name: 'Yaguá',
  url: process.env.NEXT_PUBLIC_SITE_URL || vercelUrl || 'http://localhost:3000',
  description:
    'Indumentaria y equipamiento deportivo de Concepción del Uruguay: running, hockey, pádel, outdoor, niños y King Fishing.',
  city: 'Concepción del Uruguay (3260), Entre Ríos',
  address: '9 de Julio 865',
  mapsQuery: '9 de Julio 865, Concepción del Uruguay, Entre Ríos',
  hours: 'Lunes a viernes de 8 a 20 · Sábados de 8 a 13',
  whatsapp: '5493442488220',
  whatsappDisplay: '+54 9 3442 48-8220',
  email: 'hola@yagua.com.ar', // TODO
  instagram: 'https://www.instagram.com/yagua_sport/',
  facebook: '', // TODO: página de Facebook (el ícono aparece cuando esté cargada)
  legalName: 'Yaguá Sports', // TODO: razón social exacta
  cuit: '', // TODO: CUIT (se muestra en el pie cuando esté cargado)
  /** Datos para transferencias. Mientras estén vacíos, se ofrece pedirlos por WhatsApp. TODO: CBU y alias reales */
  bank: { holder: '', cbu: '', alias: '' },
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
