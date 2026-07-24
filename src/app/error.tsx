'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

/**
 * Route error boundary. If a server fetch fails or times out (see cmsFetch's
 * 8s AbortSignal), this renders instead of hanging the page — with a retry.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-[color:var(--pne-brand)]">
          Something went wrong
        </h1>
        <p className="max-w-md text-sm text-gray-500">
          We couldn&apos;t load this page. This is usually temporary — please try again.
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" onClick={() => (window.location.href = '/')}>
          Go home
        </Button>
      </div>
    </div>
  )
}
