import { Suspense } from 'react'
import Script from 'next/script'
import GoogleAnalyticsPageview from './GoogleAnalyticsPageview'

type Props = {
  gaMeasurementId: string
  googleAdsId?: string
}

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

/**
 * Loads gtag.js and configures GA4 + Google Ads, then renders the
 * (Suspense-requiring) page-view tracker alongside it.
 *
 * This is a plain Server Component — no hooks, no 'use client' — so these
 * `beforeInteractive` scripts are part of the main synchronous SSR flush and
 * actually land in the server-rendered <head> HTML. They previously lived in
 * a 'use client' component that also called useSearchParams(); Next.js
 * requires that to be wrapped in <Suspense>, and doing so caused this whole
 * subtree (script tags included) to be streamed in as a deferred chunk
 * instead of rendered synchronously — so the tags never appeared in the
 * initial HTML, which is why tag-verification crawlers reported every page
 * as "Not tagged". Splitting the searchParams-dependent tracking into its
 * own component lets the scripts render outside any Suspense boundary.
 */
export default function GoogleAnalytics({ gaMeasurementId, googleAdsId }: Props) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document -- this rule predates App Router; app/layout.tsx's root layout is the documented replacement for _document.js */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
        strategy="beforeInteractive"
      />
      {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document -- see above */}
      <Script id="gtag-init" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${gaMeasurementId}', { send_page_view: false, anonymize_ip: true });
          ${googleAdsId ? `gtag('config', '${googleAdsId}');` : ''}
        `}
      </Script>
      {/* Only this piece needs useSearchParams(), so only this piece needs
          Suspense — keeping it scoped here means it can't hold up the
          scripts above. */}
      <Suspense fallback={null}>
        <GoogleAnalyticsPageview />
      </Suspense>
    </>
  )
}
