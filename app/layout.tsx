import type { Metadata, Viewport } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'

export const metadata: Metadata = {
  title: 'FitTracker',
  description: 'Il tuo tracker personale di allenamento e nutrizione',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FitTracker',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0f',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="pb-20">
        <main className="mx-auto max-w-lg min-h-screen">
          {children}
        </main>
        <Navigation />
      </body>
    </html>
  )
}
