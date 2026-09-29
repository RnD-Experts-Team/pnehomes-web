'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

/**
 * Fires a GA4 page_view event on every client-side route change.
 * Split out of GoogleAnalytics.tsx because useSearchParams() requires this
 * to be wrapped in <Suspense> — see the comment in that file for why.
 */
export default function GoogleAnalyticsPageview() {
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

  return null
}
