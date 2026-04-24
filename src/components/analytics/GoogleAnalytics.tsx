'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'

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

export default function GoogleAnalytics({ gaMeasurementId, googleAdsId }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!window.gtag || !pathname) {
      return
    }

    const query = searchParams?.toString()
    const pagePath = query ? `${pathname}?${query}` : pathname

    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
    })
  }, [pathname, searchParams])

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${gaMeasurementId}', { send_page_view: false, anonymize_ip: true });
          ${googleAdsId ? `gtag('config', '${googleAdsId}');` : ''}
        `}
      </Script>
    </>
  )
}
