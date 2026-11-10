'use client'
import { useTransition } from 'react'
import { setCustomOrderStatus } from '../marketing-actions'
import { input } from './ui'

const LABEL = { NEW: 'Nuevo', QUOTED: 'Presupuestado', ACCEPTED: 'Aceptado', IN_PRODUCTION: 'En producción', DELIVERED: 'Entregado', CANCELLED: 'Cancelado' } as const

export function CustomOrderStatusSelect({ id, status }: { id: string; status: keyof typeof LABEL }) {
  const [pending, start] = useTransition()
  return (
    <select
      aria-label="Estado del pedido"
      defaultValue={status}
      disabled={pending}
      onChange={(e) => start(() => setCustomOrderStatus(id, e.target.value))}
      className={`${input} w-auto py-1.5`}
    >
      {Object.entries(LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
    </select>
  )
}
