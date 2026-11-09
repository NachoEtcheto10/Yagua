'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import { Banknote, Check, CreditCard, Landmark, Lock, Store, Truck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState, useTransition } from 'react'
import { useForm, type FieldPath } from 'react-hook-form'
import { buttonClass } from '@/components/ui/Container'
import { cartSubtotal, useCart } from '@/features/cart/store'
import { cn, formatPrice } from '@/lib/format'
import { COMMERCE } from '@/lib/site'
import { checkCoupon, placeOrder } from './actions'
import { installmentAmount, shippingCost, transferDiscount, zoneForPostalCode } from './pricing'
import { checkoutSchema, type CheckoutData, type CheckoutInput } from './schema'

const STEPS = ['Datos', 'Envío', 'Pago'] as const
const STEP_FIELDS: FieldPath<CheckoutInput>[][] = [
  ['email', 'firstName', 'lastName', 'phone', 'dni'],
  ['shippingMethod', 'address.street', 'address.number', 'address.city', 'address.province', 'address.postalCode'],
  ['paymentMethod'],
]

const input = 'mt-1 h-12 w-full border border-brand-line bg-white px-3 text-[16px] outline-none transition focus:border-brand-ink sm:text-sm'

function Field({ label, error, children, className }: { label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn('block text-sm', className)}>
      <span className="font-semibold">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs font-semibold text-brand-accent">{error}</span>}
    </label>
  )
}

export function CheckoutForm({ mpEnabled, defaults }: { mpEnabled: boolean; defaults: Partial<CheckoutInput> }) {
  const { items, couponCode, clear } = useCart()
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState(0)
  const [serverError, setServerError] = useState<string | null>(null)
  const [coupon, setCoupon] = useState<{ discount: number; label: string } | null>(null)
  const [pending, start] = useTransition()

  const form = useForm<CheckoutInput, unknown, CheckoutData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingMethod: 'HOME_DELIVERY',
      paymentMethod: mpEnabled ? 'MERCADOPAGO' : 'BANK_TRANSFER',
      address: { street: '', number: '', apartment: '', city: '', province: 'Entre Ríos', postalCode: '' },
      ...defaults,
    },
    shouldUnregister: false,
  })
  const { register, watch, trigger, setValue, formState: { errors } } = form

  useEffect(() => setMounted(true), [])
  const lines = useMemo(() => items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })), [items])

  useEffect(() => {
    if (!couponCode || !lines.length) return setCoupon(null)
    checkCoupon(couponCode, lines).then((r) => setCoupon(r.ok ? { discount: r.discount, label: r.label } : null))
  }, [couponCode, lines])

  const addrErrors = errors.address
  const shippingMethod = watch('shippingMethod')
  const paymentMethod = watch('paymentMethod')
  const postalCode = watch('address.postalCode') ?? ''

  // Si cambia a envío a domicilio, el efectivo deja de estar disponible
  useEffect(() => {
    if (shippingMethod === 'HOME_DELIVERY' && paymentMethod === 'CASH') setValue('paymentMethod', mpEnabled ? 'MERCADOPAGO' : 'BANK_TRANSFER')
  }, [shippingMethod, paymentMethod, setValue, mpEnabled])

  if (!mounted) return <div className="min-h-[50vh]" />
  if (!items.length) {
    return (
      <div className="py-20 text-center">
        <p className="font-display text-3xl font-extrabold uppercase italic">Tu carrito está vacío</p>
        <Link href="/" className={`${buttonClass.primary} mt-6`}>Ir a la tienda</Link>
      </div>
    )
  }

  // Resumen (estimado en el navegador; el servidor recalcula todo al confirmar)
  const subtotal = cartSubtotal(items)
  const discount = coupon?.discount ?? 0
  const zone = shippingMethod === 'HOME_DELIVERY' && postalCode ? zoneForPostalCode(postalCode) : null
  const shipping = shippingMethod === 'STORE_PICKUP' ? 0 : zone ? shippingCost(subtotal, zone) : null
  const transferOff = paymentMethod === 'BANK_TRANSFER' ? transferDiscount(subtotal - discount) : 0
  const total = subtotal - discount - transferOff + (shipping ?? 0)

  const next = async () => {
    const ok = await trigger(STEP_FIELDS[step].filter((f) => shippingMethod === 'HOME_DELIVERY' || !f.startsWith('address')))
    if (ok) setStep((s) => Math.min(2, s + 1))
  }

  const submit = form.handleSubmit(
    (data) => {
    setServerError(null)
    const payload: CheckoutInput = { ...data, couponCode: couponCode ?? '' }
    start(async () => {
      const r = await placeOrder(payload, lines)
      if (!r.ok) return setServerError(r.error)
      clear()
      window.location.href = r.redirectUrl
    })
    },
    (errs) => {
      // Lleva al paso donde está el error y lo avisa
      const keys = Object.keys(errs)
      const target = STEP_FIELDS.findIndex((fields) => fields.some((f) => keys.includes(f.split('.')[0])))
      if (target >= 0) setStep(target)
      setServerError('Revisá los datos marcados en rojo.')
    },
  )

  const option = (active: boolean) =>
    cn('flex cursor-pointer items-start gap-3 border-2 p-4 transition', active ? 'border-brand-ink bg-brand-mist' : 'border-brand-line hover:border-brand-ink/40')

  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
      <form onSubmit={submit} noValidate>
        {/* Pasos */}
        <ol className="mb-8 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <li key={s} className="flex flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className={cn('flex items-center gap-2 font-display text-lg font-bold uppercase', i <= step ? 'text-brand-ink' : 'text-brand-muted')}
                aria-current={i === step ? 'step' : undefined}
              >
                <span className={cn('grid h-8 w-8 place-items-center rounded-full text-sm', i < step ? 'bg-brand-secondary text-brand-ink' : i === step ? 'bg-brand-ink text-white' : 'border border-brand-line')}>
                  {i < step ? <Check size={16} /> : i + 1}
                </span>
                {s}
              </button>
              {i < STEPS.length - 1 && <span className="h-px flex-1 bg-brand-line" />}
            </li>
          ))}
        </ol>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
            {step === 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="E-mail" error={errors.email?.message} className="sm:col-span-2">
                  <input type="email" autoComplete="email" {...register('email')} className={input} />
                </Field>
                <Field label="Nombre" error={errors.firstName?.message}>
                  <input autoComplete="given-name" {...register('firstName')} className={input} />
                </Field>
                <Field label="Apellido" error={errors.lastName?.message}>
                  <input autoComplete="family-name" {...register('lastName')} className={input} />
                </Field>
                <Field label="Teléfono" error={errors.phone?.message}>
                  <input type="tel" autoComplete="tel" {...register('phone')} className={input} />
                </Field>
                <Field label="DNI" error={errors.dni?.message}>
                  <input inputMode="numeric" {...register('dni')} className={input} />
                </Field>
                <p className="text-xs text-brand-muted sm:col-span-2">
                  Comprás como invitado. <Link href="/ingresar?volver=/checkout" className="underline">Ingresá</Link> para guardar tus datos y seguir tus pedidos.
                </p>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <label className={option(shippingMethod === 'HOME_DELIVERY')}>
                  <input type="radio" value="HOME_DELIVERY" {...register('shippingMethod')} className="mt-1 accent-brand-primary" />
                  <Truck size={22} className="shrink-0" />
                  <span>
                    <span className="block font-semibold">Envío a domicilio</span>
                    <span className="text-sm text-brand-muted">Gratis desde {formatPrice(COMMERCE.freeShippingFrom)}. En Concepción del Uruguay, en el día.</span>
                  </span>
                </label>
                <label className={option(shippingMethod === 'STORE_PICKUP')}>
                  <input type="radio" value="STORE_PICKUP" {...register('shippingMethod')} className="mt-1 accent-brand-primary" />
                  <Store size={22} className="shrink-0" />
                  <span>
                    <span className="block font-semibold">Retiro en el local · Gratis</span>
                    <span className="text-sm text-brand-muted">Concepción del Uruguay. Te avisamos cuando esté listo.</span>
                  </span>
                </label>
                {shippingMethod === 'HOME_DELIVERY' && (
                  <div className="grid gap-4 pt-2 sm:grid-cols-6">
                    <Field label="Calle" error={addrErrors?.street?.message} className="sm:col-span-4">
                      <input autoComplete="address-line1" {...register('address.street')} className={input} />
                    </Field>
                    <Field label="Altura" error={addrErrors?.number?.message} className="sm:col-span-2">
                      <input {...register('address.number')} className={input} />
                    </Field>
                    <Field label="Piso / depto (opcional)" className="sm:col-span-2">
                      <input {...register('address.apartment')} className={input} />
                    </Field>
                    <Field label="Ciudad" error={addrErrors?.city?.message} className="sm:col-span-4">
                      <input autoComplete="address-level2" {...register('address.city')} className={input} />
                    </Field>
                    <Field label="Provincia" error={addrErrors?.province?.message} className="sm:col-span-3">
                      <input autoComplete="address-level1" {...register('address.province')} className={input} />
                    </Field>
                    <Field label="Código postal" error={addrErrors?.postalCode?.message} className="sm:col-span-3">
                      <input inputMode="numeric" autoComplete="postal-code" {...register('address.postalCode')} className={input} />
                    </Field>
                    <p className="text-xs text-brand-muted sm:col-span-6">
                      {/* TODO: integración con Andreani / Correo Argentino para tarifas y seguimiento reales */}
                      {zone ? `Costo de envío: ${shipping === 0 ? 'gratis' : formatPrice(shipping!)}` : 'Ingresá tu código postal para calcular el envío.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <label className={cn(option(paymentMethod === 'MERCADOPAGO'), !mpEnabled && 'cursor-not-allowed opacity-50')}>
                  <input type="radio" value="MERCADOPAGO" disabled={!mpEnabled} {...register('paymentMethod')} className="mt-1 accent-brand-primary" />
                  <CreditCard size={22} className="shrink-0" />
                  <span>
                    <span className="block font-semibold">Mercado Pago</span>
                    <span className="text-sm text-brand-muted">
                      Tarjeta de crédito ({COMMERCE.interestFreeInstallments.join(' y ')} cuotas sin interés), débito o dinero en cuenta.
                      {!mpEnabled && ' (Disponible próximamente)'}
                    </span>
                  </span>
                </label>
                <label className={option(paymentMethod === 'BANK_TRANSFER')}>
                  <input type="radio" value="BANK_TRANSFER" {...register('paymentMethod')} className="mt-1 accent-brand-primary" />
                  <Landmark size={22} className="shrink-0" />
                  <span>
                    <span className="block font-semibold">Transferencia bancaria · {COMMERCE.transferDiscountPct}% OFF</span>
                    <span className="text-sm text-brand-muted">Te pasamos los datos al confirmar. El pedido se prepara cuando se acredita.</span>
                  </span>
                </label>
                <label className={cn(option(paymentMethod === 'CASH'), shippingMethod !== 'STORE_PICKUP' && 'cursor-not-allowed opacity-50')}>
                  <input type="radio" value="CASH" disabled={shippingMethod !== 'STORE_PICKUP'} {...register('paymentMethod')} className="mt-1 accent-brand-primary" />
                  <Banknote size={22} className="shrink-0" />
                  <span>
                    <span className="block font-semibold">Efectivo en el local</span>
                    <span className="text-sm text-brand-muted">Solo retirando en el local.</span>
                  </span>
                </label>
                {errors.paymentMethod && <p className="text-sm font-semibold text-brand-accent">{errors.paymentMethod.message}</p>}
                <Field label="Notas para el pedido (opcional)">
                  <textarea rows={3} {...register('notes')} className="mt-1 w-full border border-brand-line p-3 text-[16px] outline-none focus:border-brand-ink sm:text-sm" />
                </Field>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {serverError && <p role="alert" className="mt-6 border-l-4 border-brand-accent bg-brand-accent/10 p-3 text-sm font-semibold">{serverError}</p>}

        <div className="mt-8 flex items-center justify-between gap-3">
          {step > 0 ? (
            <button type="button" onClick={() => setStep(step - 1)} className="text-sm font-semibold underline underline-offset-4">Volver</button>
          ) : <span />}
          {step < 2 ? (
            <button type="button" onClick={next} className={buttonClass.primary}>Continuar</button>
          ) : (
            <button type="submit" disabled={pending} className={cn(buttonClass.primary, 'disabled:opacity-60')}>
              <Lock size={18} /> {pending ? 'Procesando…' : paymentMethod === 'MERCADOPAGO' ? 'Pagar con Mercado Pago' : 'Confirmar pedido'}
            </button>
          )}
        </div>
      </form>

      {/* Resumen */}
      <aside className="h-fit bg-brand-mist p-6 lg:sticky lg:top-24" aria-label="Resumen del pedido">
        <h2 className="font-display text-2xl font-extrabold uppercase italic">Resumen</h2>
        <ul className="mt-4 divide-y divide-brand-line">
          {items.map((i) => (
            <li key={i.variantId} className="flex gap-3 py-3">
              <span className="relative h-16 w-16 shrink-0 bg-white">
                <Image src={i.image} alt="" fill sizes="64px" className="object-contain p-1" />
                <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-brand-ink text-[11px] font-bold text-white">{i.quantity}</span>
              </span>
              <span className="min-w-0 flex-1 text-sm">
                <span className="block truncate">{i.name}</span>
                <span className="text-xs text-brand-muted">{i.color} · {i.size}</span>
              </span>
              <span className="text-sm tabular-nums">{formatPrice(i.unitPrice * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1.5 border-t border-brand-line pt-4 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd className="tabular-nums">{formatPrice(subtotal)}</dd></div>
          {coupon && <div className="flex justify-between text-brand-accent"><dt>Cupón {couponCode} ({coupon.label})</dt><dd className="tabular-nums">-{formatPrice(coupon.discount)}</dd></div>}
          {transferOff > 0 && <div className="flex justify-between text-brand-accent"><dt>Transferencia ({COMMERCE.transferDiscountPct}% OFF)</dt><dd className="tabular-nums">-{formatPrice(transferOff)}</dd></div>}
          <div className="flex justify-between"><dt>Envío</dt><dd>{shipping == null ? 'A calcular' : shipping === 0 ? 'Gratis' : formatPrice(shipping)}</dd></div>
          <div className="flex justify-between border-t border-brand-line pt-3 text-lg font-bold"><dt>Total</dt><dd className="tabular-nums">{formatPrice(total)}</dd></div>
          {paymentMethod === 'MERCADOPAGO' && (
            <p className="text-xs text-brand-muted">o {COMMERCE.interestFreeInstallments.at(-1)} cuotas sin interés de {formatPrice(installmentAmount(total, COMMERCE.interestFreeInstallments.at(-1)!))}</p>
          )}
        </dl>
        <p className="mt-4 flex items-center gap-2 text-xs text-brand-muted"><Lock size={14} /> Precios con IVA incluido. El total final lo confirma nuestro sistema.</p>
      </aside>
    </div>
  )
}
