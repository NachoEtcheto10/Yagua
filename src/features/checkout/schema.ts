import { z } from 'zod'

export const addressSchema = z.object({
  street: z.string().trim().min(2, 'Ingresá la calle'),
  number: z.string().trim().min(1, 'Ingresá la altura'),
  apartment: z.string().trim().max(40).optional().or(z.literal('')),
  city: z.string().trim().min(2, 'Ingresá la ciudad'),
  province: z.string().trim().min(2, 'Ingresá la provincia'),
  postalCode: z.string().trim().regex(/^[A-Za-z]?\d{4}[A-Za-z]{0,3}$/, 'Código postal inválido'),
})

export const checkoutSchema = z
  .object({
    email: z.string().trim().email('E-mail inválido'),
    firstName: z.string().trim().min(2, 'Ingresá tu nombre'),
    lastName: z.string().trim().min(2, 'Ingresá tu apellido'),
    phone: z.string().trim().min(8, 'Ingresá un teléfono válido'),
    dni: z.string().trim().regex(/^\d{7,8}$/, 'DNI inválido (solo números)'),
    shippingMethod: z.enum(['HOME_DELIVERY', 'STORE_PICKUP']),
    // La dirección se acepta "suelta" y solo se valida con envío a domicilio (ver superRefine)
    address: z
      .object({
        street: z.string().optional(),
        number: z.string().optional(),
        apartment: z.string().optional(),
        city: z.string().optional(),
        province: z.string().optional(),
        postalCode: z.string().optional(),
      })
      .optional(),
    paymentMethod: z.enum(['MERCADOPAGO', 'BANK_TRANSFER', 'CASH']),
    couponCode: z.string().trim().max(40).optional().or(z.literal('')),
    notes: z.string().trim().max(500).optional().or(z.literal('')),
  })
  .superRefine((d, ctx) => {
    if (d.shippingMethod !== 'HOME_DELIVERY') return
    const r = addressSchema.safeParse(d.address)
    if (!r.success) for (const issue of r.error.issues) ctx.addIssue({ code: 'custom', message: issue.message, path: ['address', ...issue.path] })
  })
  .transform((d) => ({
    ...d,
    address: d.shippingMethod === 'HOME_DELIVERY' ? addressSchema.parse(d.address) : undefined,
  }))
  .refine((d) => d.paymentMethod !== 'CASH' || d.shippingMethod === 'STORE_PICKUP', {
    message: 'El pago en efectivo es solo retirando en el local',
    path: ['paymentMethod'],
  })

export type CheckoutInput = z.input<typeof checkoutSchema>
export type CheckoutData = z.output<typeof checkoutSchema>
export type AddressInput = z.infer<typeof addressSchema>
