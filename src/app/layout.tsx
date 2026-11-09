import type { Metadata, Viewport } from 'next'
import { Barlow_Condensed, Inter } from 'next/font/google'
import { SITE } from '@/lib/site'
import './globals.css'

const barlow = Barlow_Condensed({ subsets: ['latin'], weight: ['600', '700', '800', '900'], style: ['normal', 'italic'], variable: '--font-barlow', display: 'swap' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: 'Yaguá | Indumentaria y equipamiento deportivo', template: '%s | Yaguá' },
  description: SITE.description,
  openGraph: { type: 'website', locale: 'es_AR', siteName: 'Yaguá', images: ['/sports/padel-2.webp'] },
  icons: { icon: '/brand/yagua-logo.svg' },
}

export const viewport: Viewport = { themeColor: '#1b181c' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${barlow.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}
