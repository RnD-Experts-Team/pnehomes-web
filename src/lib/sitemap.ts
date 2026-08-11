/**
 * Sitemap utility functions and types for SEO optimization
 */

export interface SitemapUrl {
  url: string
  lastmod?: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: string
}

export interface StaticRoute {
  url: string
  priority: string
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
}

/**
 * Get the base URL for the application
 */
export function getBaseUrl(): string {
  // Production URL
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL
  }
  
  // Vercel deployment
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  // Development fallback - check for actual port
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || '3000'
    return `http://localhost:${port}`
  }
  
  // Default production URL
  return 'https://pnehomes.com'
}

/**
 * Generate XML sitemap from URLs array
 */
export function generateSitemapXml(urls: SitemapUrl[]): string {
  const urlEntries = urls
    .map(({ url, lastmod, changefreq, priority }) => {
      let entry = `  <url>\n    <loc>${url}</loc>`
      
      if (lastmod) {
        entry += `\n    <lastmod>${lastmod}</lastmod>`
      }
      
      if (changefreq) {
        entry += `\n    <changefreq>${changefreq}</changefreq>`
      }
      
      if (priority) {
        entry += `\n    <priority>${priority}</priority>`
      }
      
      entry += '\n  </url>'
      return entry
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`
}

/**
 * Get current date in YYYY-MM-DD format for lastmod
 */
export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Static routes configuration with SEO priorities
 */
export const STATIC_ROUTES: StaticRoute[] = [
  { url: '', priority: '1.0', changefreq: 'daily' }, // Homepage
  { url: '/about-us', priority: '0.8', changefreq: 'monthly' },
  { url: '/building-options', priority: '0.9', changefreq: 'weekly' },
  { url: '/communities', priority: '0.9', changefreq: 'weekly' },
  { url: '/compare', priority: '0.7', changefreq: 'monthly' },
  { url: '/contact', priority: '0.8', changefreq: 'monthly' },
  { url: '/contact/own_land', priority: '0.7', changefreq: 'monthly' },
  { url: '/events', priority: '0.8', changefreq: 'weekly' },
  { url: '/floor-plans', priority: '0.9', changefreq: 'daily' },
  { url: '/gallery', priority: '0.8', changefreq: 'weekly' },
  { url: '/our-projects', priority: '0.8', changefreq: 'weekly' },
  { url: '/our-team', priority: '0.7', changefreq: 'monthly' },
  { url: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
  { url: '/services', priority: '0.8', changefreq: 'weekly' },
]

/**
 * Dynamic route priorities for different content types
 */
export const DYNAMIC_ROUTE_PRIORITIES = {
  properties: { priority: '0.8', changefreq: 'weekly' as const },
  communities: { priority: '0.8', changefreq: 'weekly' as const },
  services: { priority: '0.7', changefreq: 'monthly' as const },
  articles: { priority: '0.7', changefreq: 'monthly' as const },
  gallery: { priority: '0.6', changefreq: 'monthly' as const },
  subGallery: { priority: '0.5', changefreq: 'monthly' as const },
} as const

/**
 * Validate and sanitize URL for sitemap
 */
export function sanitizeUrl(baseUrl: string, path: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  
  // Ensure baseUrl doesn't end with slash
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  
  return cleanPath ? `${cleanBaseUrl}/${cleanPath}` : cleanBaseUrl
}

/**
 * Error handling for sitemap generation
 */
export function createFallbackSitemap(baseUrl: string): string {
  const fallbackUrls: SitemapUrl[] = [
    {
      url: sanitizeUrl(baseUrl, ''),
      lastmod: getCurrentDate(),
      changefreq: 'daily',
      priority: '1.0',
    },
  ]
  
  return generateSitemapXml(fallbackUrls)
}