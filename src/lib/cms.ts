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
