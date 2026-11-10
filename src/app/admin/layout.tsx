import type { Metadata } from 'next'
import { AdminNav } from '@/features/admin/components/AdminNav'
import { requireAdmin } from '@/features/admin/guard'

export const metadata: Metadata = { title: { default: 'Panel', template: '%s | Panel Yaguá' }, robots: { index: false, follow: false } }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin()
  return (
    <div className="min-h-svh bg-[#f5f5f3] lg:grid lg:grid-cols-[240px_1fr]">
      <AdminNav userName={user.name ?? user.email ?? 'Admin'} />
      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
    </div>
  )
}
