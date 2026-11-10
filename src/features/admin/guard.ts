import 'server-only'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

/**
 * Solo administradores. Se llama en el layout del panel Y en cada server action:
 * las acciones se pueden invocar directamente, así que el layout solo no alcanza.
 */
export async function requireAdmin() {
  const session = await auth()
  if (!session?.user) redirect('/ingresar?volver=/admin')
  if (session.user.role !== 'ADMIN') redirect('/')
  return session.user
}
