import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Oswald, Inter } from 'next/font/google'
import './globals.css'

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-oswald',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Muscargo Repuestos SpA · Gestión de Inventario',
  description:
    'Sistema de gestión de inventario multi-marca por SKU con escáner QR / código de barras, entradas, salidas e importación/exportación Excel.',
  generator: 'v0.app',
  manifest: '/manifest.webmanifest',
  applicationName: 'Muscargo Repuestos',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Muscargo',
  },
  icons: {
    icon: '/icon-512.png',
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#0F172A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`bg-background ${oswald.variable} ${inter.variable}`}>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
