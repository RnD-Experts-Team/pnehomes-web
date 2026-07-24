import BrandLoader from '@/components/BrandLoader'

/**
 * Route-level streaming fallback. Shown while a server component is fetching,
 * so navigation renders an instant branded loader instead of a blank/frozen
 * screen. The layout (Header/Footer) stays mounted — only the page body is
 * replaced.
 */
export default function Loading() {
  return <BrandLoader />
}
