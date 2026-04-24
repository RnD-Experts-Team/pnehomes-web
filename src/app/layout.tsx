import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Header } from '@/features/home/components/homeLayout/Header'
import { Footer } from '@/features/home/components/homeLayout/Footer'
import { ComparisonProvider } from '@/contexts/ComparisonContext'
import ComparisonDrawer from '@/components/ComparisonDrawer'
import ComparisonFloatingButton from '@/components/ComparisonFloatingButton'
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'PNE Homes - Quality Home Builders',
  description: 'Building quality homes with exceptional craftsmanship and attention to detail.',
  // Use all available favicon assets from public/favicon
  icons: {
    icon: [
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [{ url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  // Reference PWA manifest that includes Android Chrome icons (192x192, 512x512)
  manifest: '/favicon/site.webmanifest',
}

const GOOGLE_ADS_ID = 'AW-16793956604'
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-EWHZR0JMJQ'
const ENABLE_ANALYTICS = process.env.NODE_ENV === 'production' && Boolean(GA_MEASUREMENT_ID)

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col text-[color:var(--pne-text)] antialiased`}
        suppressHydrationWarning={true}
      >
        <ComparisonProvider>
          {/* Fixed, transparent header positioned above main content */}
          <Header />
          <main className="relative flex-1">{children}</main>
          <div className="relative z-30">
            <Footer />
          </div>
          <ComparisonDrawer />
          <ComparisonFloatingButton />
        </ComparisonProvider>
        {ENABLE_ANALYTICS ? (
          <GoogleAnalytics gaMeasurementId={GA_MEASUREMENT_ID} googleAdsId={GOOGLE_ADS_ID} />
        ) : null}
      </body>
    </html>
  )
}
