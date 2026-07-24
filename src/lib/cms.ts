/**
 * Centralized CMS configuration.
 *
 * Every feature repository should import from here instead of
 * hard-coding CMS URLs.
 *
 * Set NEXT_PUBLIC_CMS_BASE_URL in your .env / .env.local:
 *   NEXT_PUBLIC_CMS_BASE_URL=https://cms.pnehomes.com
 *
 * NEXT_PUBLIC_ prefix ensures it works in both server and client components.
 */

const CMS_BASE_URL = (
  process.env.NEXT_PUBLIC_CMS_BASE_URL ??
  process.env.CMS_BASE_URL ??
  ''
).replace(/\/+$/, '')

if (!CMS_BASE_URL) {
  console.warn(
    '[cms] Neither NEXT_PUBLIC_CMS_BASE_URL nor CMS_BASE_URL is set. API calls will fail.'
  )
}

/** Base URL without trailing slash, e.g. `https://cms.pnehomes.com` */
export const cmsBaseUrl = CMS_BASE_URL

/** Build a full CMS API URL: `cmsUrl('/api/gallery')` → `https://cms.pnehomes.com/api/gallery` */
export function cmsUrl(path: string): string {
  return `${CMS_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/** Default ISR revalidation window (seconds) for CMS-backed pages. */
export const CMS_REVALIDATE_SECONDS = 60

/** Default per-request timeout (ms) so a stalled CMS never hangs a render. */
export const CMS_TIMEOUT_MS = 8000

export type CmsFetchOptions = {
  /** ISR window in seconds. Pass 0 to opt out of caching for this call. */
  revalidate?: number
  /** Abort the request after this many ms. */
  timeoutMs?: number
  /** Extra fetch init (headers, method, etc.). */
  init?: RequestInit
}

/**
 * Cached, time-bounded CMS fetch.
 *
 * - Uses Next.js ISR (`next: { revalidate }`) instead of `no-store`, so pages
 *   are served from cache and refreshed in the background.
 * - Aborts after `timeoutMs` so a slow/stalled CMS surfaces an error boundary
 *   instead of freezing the navigation.
 *
 * Accepts either an absolute URL or a CMS-relative path (`/api/...`).
 */
export async function cmsFetch(
  pathOrUrl: string,
  { revalidate = CMS_REVALIDATE_SECONDS, timeoutMs = CMS_TIMEOUT_MS, init }: CmsFetchOptions = {}
): Promise<Response> {
  const url = pathOrUrl.startsWith('http') ? pathOrUrl : cmsUrl(pathOrUrl)
  return fetch(url, {
    ...init,
    next: { revalidate },
    signal: AbortSignal.timeout(timeoutMs),
  })
}

/** Convenience: `cmsFetch` + JSON parse with a clear error on non-2xx. */
export async function cmsFetchJson<T>(pathOrUrl: string, opts?: CmsFetchOptions): Promise<T> {
  const res = await cmsFetch(pathOrUrl, opts)
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`CMS ${res.status} for ${pathOrUrl}: ${body.slice(0, 300)}`)
  }
  return (await res.json()) as T
}
