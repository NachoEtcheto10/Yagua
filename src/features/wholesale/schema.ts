import { z } from 'zod'

export const BUSINESS_TYPES = ['Tienda deportiva', 'Club o asociación', 'Escuela o colegio', 'Empresa (uniformes)', 'Gimnasio o academia', 'Revendedor', 'Otro'] as const
export const VOLUMES = ['Hasta $500.000', '$500.000 a $1.500.000', '$1.500.000 a $5.000.000', 'Más de $5.000.000'] as const

/** CUIT válido: 11 dígitos con dígito verificador (acepta con o sin guiones) */
export function isValidCuit(raw: string) {
  const c = raw.replace(/\D/g, '')
  if (c.length !== 11) return false
  const w = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
  const sum = w.reduce((n, k, i) => n + k * Number(c[i]), 0)
  let dv = 11 - (sum % 11)
  if (dv === 11) dv = 0
  if (dv === 10) dv = 9
  return dv === Number(c[10])
}

export const wholesaleRegisterSchema = z.object({
  name: z.string().trim().min(2, 'Ingresá tu nombre'),
  email: z.string().trim().toLowerCase().email('E-mail inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  companyName: z.string().trim().min(2, 'Ingresá la razón social'),
  cuit: z.string().trim().refine(isValidCuit, 'CUIT inválido (11 números, ej. 30-71234567-8)'),
  businessType: z.enum(BUSINESS_TYPES, { error: 'Elegí el tipo de negocio' }),
  monthlyVolume: z.enum(VOLUMES, { error: 'Elegí un volumen estimado' }),
  phone: z.string().trim().min(8, 'Ingresá un teléfono'),
  city: z.string().trim().min(2, 'Ingresá la ciudad'),
  website: z.string().trim().max(200).optional().or(z.literal('')),
  instagram: z.string().trim().max(100).optional().or(z.literal('')),
  message: z.string().trim().max(1000).optional().or(z.literal('')),
})

export const wholesaleOrderSchema = z.object({
  lines: z.array(z.object({ variantId: z.string().min(1), quantity: z.number().int().min(1).max(5000) })).min(1).max(300),
  delivery: z.enum(['STORE_PICKUP', 'HOME_DELIVERY']),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
})
