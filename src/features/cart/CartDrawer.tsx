'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus, Trash2, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, useTransition } from 'react'
import { buttonClass } from '@/components/ui/Container'
import { formatPrice } from '@/lib/format'
import { COMMERCE } from '@/lib/site'
import { checkCoupon } from '@/features/checkout/actions'
import { cartSubtotal, useCart } from './store'

export function CartDrawer() {
  const { items, open, setOpen, setQuantity, remove, couponCode, setCoupon } = useCart()
  const [mounted, setMounted] = useState(false)
  const [code, setCode] = useState('')
  const [coupon, setCouponInfo] = useState<{ label: string; discount: number } | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, setOpen])

  const lines = items.map((i) => ({ variantId: i.variantId, quantity: i.quantity }))
  const linesKey = JSON.stringify(lines)

  // Revalida el cupón guardado cuando cambia el carrito (el servidor calcula el descuento)
  useEffect(() => {
    if (!couponCode || !items.length) {
      setCouponInfo(null)
      return
    }
    let alive = true
    checkCoupon(couponCode, JSON.parse(linesKey)).then((r) => {
      if (!alive) return
      if (r.ok) {
        setCouponInfo({ label: r.label, discount: r.discount })
        setCouponError(null)
      } else {
        setCouponInfo(null)
        setCouponError(r.error)
      }
    })
    return () => {
      alive = false
    }
  }, [couponCode, linesKey, items.length])

  if (!mounted) return null
  const subtotal = cartSubtotal(items)
  const missing = Math.max(0, COMMERCE.freeShippingFrom - subtotal)
  const progress = Math.min(100, (subtotal / COMMERCE.freeShippingFrom) * 100)

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="absolute inset-0 bg-black/50" />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Carrito"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white"
          >
            <div className="flex items-center justify-between border-b border-brand-line px-5 py-4">
              <h2 className="font-display text-2xl font-extrabold uppercase italic">Tu carrito</h2>
              <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center" aria-label="Cerrar carrito">
                <X size={24} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
                <p className="font-display text-xl font-bold uppercase">Tu carrito está vacío</p>
                <p className="text-sm text-brand-muted">Sumá productos y aprovechá las cuotas sin interés.</p>
                <button type="button" onClick={() => setOpen(false)} className={buttonClass.primary}>Seguir comprando</button>
              </div>
            ) : (
              <>
                <div className="border-b border-brand-line px-5 py-3">
                  <p className="text-sm">
                    {missing > 0 ? (
                      <>Te faltan <strong>{formatPrice(missing)}</strong> para el <strong>envío gratis</strong></>
                    ) : (
                      <strong>¡Tenés envío gratis!</strong>
                    )}
                  </p>
                  <div className="mt-2 h-1.5 bg-brand-mist">
                    <motion.div className="h-full bg-brand-secondary" initial={false} animate={{ width: `${progress}%` }} />
                  </div>
                </div>

                <ul className="flex-1 divide-y divide-brand-line overflow-y-auto px-5">
                  <AnimatePresence initial={false}>
                    {items.map((i) => (
                      <motion.li key={i.variantId} layout exit={{ opacity: 0, x: 40 }} className="flex gap-4 py-4">
                        <Link href={i.href} onClick={() => setOpen(false)} className="relative h-24 w-24 shrink-0 bg-brand-mist">
                          <Image src={i.image} alt={i.name} fill sizes="96px" className="object-contain p-1.5" />
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex justify-between gap-2">
                            <Link href={i.href} onClick={() => setOpen(false)} className="text-sm font-medium leading-snug hover:underline">{i.name}</Link>
                            <button type="button" onClick={() => remove(i.variantId)} className="text-brand-muted hover:text-brand-accent" aria-label={`Quitar ${i.name}`}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <p className="text-xs text-brand-muted">{i.color} · Talle {i.size}</p>
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <div className="flex items-center border border-brand-line">
                              <button type="button" onClick={() => setQuantity(i.variantId, i.quantity - 1)} disabled={i.quantity <= 1} className="grid h-8 w-8 place-items-center disabled:opacity-30" aria-label="Restar uno">
                                <Minus size={14} />
                              </button>
                              <span className="w-8 text-center text-sm tabular-nums">{i.quantity}</span>
                              <button type="button" onClick={() => setQuantity(i.variantId, i.quantity + 1)} disabled={i.quantity >= i.maxStock} className="grid h-8 w-8 place-items-center disabled:opacity-30" aria-label="Sumar uno">
                                <Plus size={14} />
                              </button>
                            </div>
                            <span className="text-sm font-semibold tabular-nums">{formatPrice(i.unitPrice * i.quantity)}</span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                <div className="space-y-3 border-t border-brand-line px-5 py-4">
                  {couponCode && coupon ? (
                    <div className="flex items-center justify-between bg-brand-mist px-3 py-2 text-sm">
                      <span>Cupón <strong>{couponCode}</strong> ({coupon.label})</span>
                      <button type="button" onClick={() => setCoupon(null)} className="text-brand-muted underline">Quitar</button>
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        start(async () => {
                          const r = await checkCoupon(code, lines)
                          if (r.ok) {
                            setCoupon(r.code)
                            setCode('')
                          } else setCouponError(r.error)
                        })
                      }}
                      className="flex gap-2"
                    >
                      <input
                        value={code}
                        onChange={(e) => {
                          setCode(e.target.value.toUpperCase())
                          setCouponError(null)
                        }}
                        placeholder="Código de descuento"
                        aria-label="Código de descuento"
                        className="h-10 min-w-0 flex-1 border border-brand-line px-3 text-[16px] uppercase outline-none focus:border-brand-ink sm:text-sm"
                      />
                      <button type="submit" disabled={!code || pending} className="h-10 border border-brand-ink px-4 text-sm font-semibold disabled:opacity-40">
                        {pending ? '…' : 'Aplicar'}
                      </button>
                    </form>
                  )}
                  {couponError && <p className="text-xs text-brand-accent">{couponError}</p>}

                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between"><dt>Subtotal</dt><dd className="tabular-nums">{formatPrice(subtotal)}</dd></div>
                    {coupon && (
                      <div className="flex justify-between text-brand-accent"><dt>Descuento</dt><dd className="tabular-nums">-{formatPrice(coupon.discount)}</dd></div>
                    )}
                    <div className="flex justify-between text-brand-muted"><dt>Envío</dt><dd>Se calcula en el checkout</dd></div>
                    <div className="flex justify-between pt-1 text-base font-bold">
                      <dt>Total</dt><dd className="tabular-nums">{formatPrice(subtotal - (coupon?.discount ?? 0))}</dd>
                    </div>
                  </dl>
                  <p className="text-xs text-brand-muted">
                    {COMMERCE.interestFreeInstallments.join(' y ')} cuotas sin interés · {COMMERCE.transferDiscountPct}% OFF con transferencia
                  </p>
                  <Link href="/checkout" onClick={() => setOpen(false)} className={`${buttonClass.primary} w-full`}>
                    Iniciar compra
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
