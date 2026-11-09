import { NextResponse, type NextRequest } from 'next/server'
import { syncPayment, verifyWebhookSignature } from '@/features/payments/mercadopago'

// Notificaciones de Mercado Pago (webhook). Configurar la URL y copiar la "clave secreta" en MP_WEBHOOK_SECRET.
export async function POST(req: NextRequest) {
  const url = new URL(req.url)
  let body: { type?: string; data?: { id?: string | number } } = {}
  try {
    body = await req.json()
  } catch {
    /* algunas notificaciones llegan solo por query string */
  }
  const type = body.type ?? url.searchParams.get('type')
  const dataId = String(body.data?.id ?? url.searchParams.get('data.id') ?? '')
  if (type !== 'payment' || !dataId) return NextResponse.json({ ignored: true })

  const valid = verifyWebhookSignature({
    signature: req.headers.get('x-signature'),
    requestId: req.headers.get('x-request-id'),
    dataId: url.searchParams.get('data.id') ?? dataId,
  })
  if (!valid) return NextResponse.json({ error: 'Firma inválida' }, { status: 401 })

  try {
    await syncPayment(dataId)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('webhook mercadopago', e)
    // 500 => Mercado Pago reintenta más tarde
    return NextResponse.json({ error: 'No se pudo procesar' }, { status: 500 })
  }
}
