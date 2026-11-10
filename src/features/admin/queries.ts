import 'server-only'
import { db } from '@/lib/db'
import type { OrderStatus } from '@/generated/prisma/enums'

/** Estados que cuentan como venta concretada */
export const SOLD: OrderStatus[] = ['PAID', 'PREPARING', 'SHIPPED', 'READY_FOR_PICKUP', 'DELIVERED']

const TZ_OFFSET_MS = 3 * 60 * 60 * 1000 // Argentina, UTC-3 (sin horario de verano)

/** Día calendario argentino (YYYY-MM-DD) de una fecha */
export function arDay(d: Date) {
  return new Date(d.getTime() - TZ_OFFSET_MS).toISOString().slice(0, 10)
}

export async function getDashboard() {
  const now = new Date()
  const today = arDay(now)
  const monthStart = new Date(`${today.slice(0, 7)}-01T03:00:00.000Z`)
  const chartStart = new Date(new Date(`${today}T03:00:00.000Z`).getTime() - 13 * 86_400_000)

  const [month, toPrepare, pendingPayment, recent, lowStock, chartOrders, customNew, topItems] = await Promise.all([
    db.order.aggregate({ where: { status: { in: SOLD }, createdAt: { gte: monthStart } }, _sum: { total: true }, _count: true }),
    db.order.count({ where: { status: { in: ['PAID', 'PREPARING'] } } }),
    db.order.count({ where: { status: 'PENDING' } }),
    db.order.findMany({ orderBy: { createdAt: 'desc' }, take: 8, select: { id: true, number: true, customerName: true, total: true, status: true, createdAt: true } }),
    db.productVariant.findMany({
      where: { stock: { lte: 2 }, product: { active: true } },
      select: { size: true, color: true, stock: true, product: { select: { id: true, name: true } } },
    }),
    db.order.findMany({ where: { status: { in: SOLD }, createdAt: { gte: chartStart } }, select: { total: true, createdAt: true } }),
    db.customOrder.count({ where: { status: 'NEW' } }),
    db.orderItem.groupBy({
      by: ['productId', 'productName'],
      where: { order: { status: { in: SOLD }, createdAt: { gte: new Date(now.getTime() - 30 * 86_400_000) } } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
  ])

  const days = Array.from({ length: 14 }, (_, i) => arDay(new Date(chartStart.getTime() + i * 86_400_000 + 12 * 3_600_000)))
  const byDay = new Map(days.map((d) => [d, 0]))
  for (const o of chartOrders) {
    const k = arDay(o.createdAt)
    if (byDay.has(k)) byDay.set(k, byDay.get(k)! + o.total)
  }

  // Poco stock agrupado por producto (si no, un producto con muchos talles agotados llena la lista)
  const low = new Map<string, { id: string; name: string; out: string[]; few: string[] }>()
  for (const v of lowStock) {
    const e = low.get(v.product.id) ?? { id: v.product.id, name: v.product.name, out: [], few: [] }
    const label = v.color === 'Único' ? v.size : v.size === 'Único' ? v.color : `${v.color} ${v.size}`
    ;(v.stock === 0 ? e.out : e.few).push(label)
    low.set(v.product.id, e)
  }
  const lowByProduct = [...low.values()].sort((a, b) => b.out.length - a.out.length || b.few.length - a.few.length).slice(0, 8)

  const revenue = month._sum.total ?? 0
  return {
    revenue,
    orders: month._count,
    avgTicket: month._count ? Math.round(revenue / month._count) : 0,
    toPrepare,
    pendingPayment,
    customNew,
    recent,
    lowStock: lowByProduct,
    topItems: topItems.map((t) => ({ productId: t.productId, name: t.productName, units: t._sum.quantity ?? 0 })),
    chart: days.map((d) => ({ day: d, total: byDay.get(d)! })),
  }
}
