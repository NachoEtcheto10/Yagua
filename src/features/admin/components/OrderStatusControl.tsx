'use client'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { setOrderNotes, setOrderStatus } from '../order-actions'
import { btn, input, ORDER_STATUS } from './ui'
import type { OrderStatus } from '@/generated/prisma/enums'

/** Próximos pasos sugeridos según el estado y la forma de entrega */
function nextSteps(status: OrderStatus, pickup: boolean): OrderStatus[] {
  switch (status) {
    case 'PENDING':
      return ['PAID', 'CANCELLED']
    case 'PAID':
      return ['PREPARING', 'CANCELLED']
    case 'PREPARING':
      return [pickup ? 'READY_FOR_PICKUP' : 'SHIPPED', 'CANCELLED']
    case 'SHIPPED':
    case 'READY_FOR_PICKUP':
      return ['DELIVERED']
    case 'DELIVERED':
      return ['REFUNDED']
    default:
      return []
  }
}

const ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  PAID: 'Confirmar pago',
  PREPARING: 'Empezar a preparar',
  SHIPPED: 'Marcar como enviado',
  READY_FOR_PICKUP: 'Listo para retirar',
  DELIVERED: 'Marcar entregado',
  CANCELLED: 'Cancelar pedido',
  REFUNDED: 'Reintegrar',
}

export function OrderStatusControl({ orderId, status, pickup }: { orderId: string; status: OrderStatus; pickup: boolean }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const steps = nextSteps(status, pickup)

  const go = (to: OrderStatus) => {
    if ((to === 'CANCELLED' || to === 'REFUNDED') && !confirm(`¿Seguro? ${to === 'CANCELLED' ? 'Se cancela el pedido' : 'Se marca como reintegrado'} y el stock vuelve a estar disponible.`)) return
    setError(null)
    start(async () => {
      const r = await setOrderStatus(orderId, to)
      if (!r.ok) setError(r.error)
      else router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      {steps.length === 0 ? (
        <p className="text-sm text-brand-muted">Este pedido está cerrado.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {steps.map((s) => (
            <button key={s} type="button" disabled={pending} onClick={() => go(s)} className={s === 'CANCELLED' || s === 'REFUNDED' ? btn.danger : btn.primary}>
              {ACTION_LABEL[s] ?? ORDER_STATUS[s].label}
            </button>
          ))}
        </div>
      )}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </div>
  )
}

export function OrderNotes({ orderId, notes }: { orderId: string; notes: string }) {
  const [value, setValue] = useState(notes)
  const [saved, setSaved] = useState(false)
  const [pending, start] = useTransition()
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        start(async () => {
          const r = await setOrderNotes(orderId, value)
          setSaved(r.ok)
        })
      }}
      className="space-y-2"
    >
      <textarea value={value} onChange={(e) => { setValue(e.target.value); setSaved(false) }} rows={3} maxLength={1000} className={input} placeholder="Notas internas o del cliente" />
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={btn.secondary}>Guardar nota</button>
        {saved && <span className="text-sm text-emerald-700">Guardado</span>}
      </div>
    </form>
  )
}
