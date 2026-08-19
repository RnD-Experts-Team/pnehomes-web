import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Header } from '@/features/home/components/homeLayout/Header'
import { Footer } from '@/features/home/components/homeLayout/Footer'
import { homeLayoutApi } from '@/features/home/api'
import { getAllServices } from '@/features/services/api'
import type { Service } from '@/features/services/model/types'
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

// ISR: pages are cached and revalidated in the background (see src/lib/cms.ts).
// Individual routes may override this with their own `revalidate`.
export const revalidate = 60

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
  // Pinterest domain verification (Pinterest Business account)
  other: {
    'p:domain_verify': 'd712782b7604a26ff6305ca5d5f2cc58',
  },
}

const GOOGLE_ADS_ID = 'AW-16793956604'
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-EWHZR0JMJQ'
const ENABLE_ANALYTICS = process.env.NODE_ENV === 'production' && Boolean(GA_MEASUREMENT_ID)

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Fetch layout config on the server (cached + deduped via cmsFetch) so the
  // header/footer render with real data in the initial HTML — no client fetch,
  // no skeleton flash on every navigation. Falls back to client fetch on error.
  let headerConfig = null
  let footerConfig = null
  let services: Service[] = []
  try {
    const [header, footer, servicesRes] = await Promise.all([
      homeLayoutApi.getHeader(),
      homeLayoutApi.getFooter(),
      getAllServices(),
    ])
    headerConfig = header
    footerConfig = footer
    services = servicesRes.success ? servicesRes.data : []
  } catch (e) {
    console.error('Failed to load layout config', e)
  }

  return (
    <html lang="en" className="scroll-smooth">
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col text-[color:var(--pne-text)] antialiased`}
        suppressHydrationWarning={true}
      >
        <ComparisonProvider>
          {/* Fixed, transparent header positioned above main content */}
          <Header initialConfig={headerConfig} initialServices={services} />
          <main className="relative flex-1">{children}</main>
          <div className="relative z-30">
            <Footer initialConfig={footerConfig} />
          </div>
          <ComparisonDrawer />
          <ComparisonFloatingButton />
        </ComparisonProvider>
        {ENABLE_ANALYTICS ? (
          <Suspense fallback={null}>
            <GoogleAnalytics gaMeasurementId={GA_MEASUREMENT_ID} googleAdsId={GOOGLE_ADS_ID} />
          </Suspense>
        ) : null}
      </body>
    </html>
  )
}
