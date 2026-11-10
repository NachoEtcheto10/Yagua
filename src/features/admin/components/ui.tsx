import type { ReactNode } from 'react'
import { cn } from '@/lib/format'
import type { OrderStatus } from '@/generated/prisma/enums'

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-extrabold uppercase italic tracking-tight lg:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-brand-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Card({ children, className, title, action }: { children: ReactNode; className?: string; title?: string; action?: ReactNode }) {
  return (
    <section className={cn('rounded-lg border border-brand-line bg-white', className)}>
      {title && (
        <div className="flex items-center justify-between border-b border-brand-line px-5 py-3.5">
          <h2 className="font-display text-lg font-bold uppercase tracking-wide">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export const btn = {
  primary: 'inline-flex items-center justify-center gap-2 rounded bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-50',
  secondary: 'inline-flex items-center justify-center gap-2 rounded border border-brand-line bg-white px-4 py-2.5 text-sm font-semibold transition hover:border-brand-ink disabled:opacity-50',
  danger: 'inline-flex items-center justify-center gap-2 rounded border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50',
}

export const input =
  'w-full rounded border border-brand-line bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-ink focus:ring-2 focus:ring-brand-ink/10'

export const th = 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-muted'
export const td = 'px-4 py-3 align-middle'

export const ORDER_STATUS: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pendiente de pago', className: 'bg-amber-100 text-amber-800' },
  PAID: { label: 'Pagado', className: 'bg-emerald-100 text-emerald-800' },
  PREPARING: { label: 'En preparación', className: 'bg-sky-100 text-sky-800' },
  SHIPPED: { label: 'Enviado', className: 'bg-indigo-100 text-indigo-800' },
  READY_FOR_PICKUP: { label: 'Listo para retirar', className: 'bg-violet-100 text-violet-800' },
  DELIVERED: { label: 'Entregado', className: 'bg-neutral-200 text-neutral-800' },
  CANCELLED: { label: 'Cancelado', className: 'bg-red-100 text-red-800' },
  REFUNDED: { label: 'Reintegrado', className: 'bg-red-100 text-red-800' },
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  const s = ORDER_STATUS[status]
  return <span className={cn('inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold', s.className)}>{s.label}</span>
}

export const PAYMENT_LABEL = { MERCADOPAGO: 'Mercado Pago', BANK_TRANSFER: 'Transferencia', CASH: 'Efectivo' } as const
export const SHIPPING_LABEL = { HOME_DELIVERY: 'Envío a domicilio', STORE_PICKUP: 'Retiro en el local' } as const

export function Empty({ children }: { children: ReactNode }) {
  return <p className="px-5 py-10 text-center text-sm text-brand-muted">{children}</p>
}

export function dateTime(d: Date) {
  return d.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires' })
}
