import { NextResponse } from 'next/server'
import * as Property from '@/features/property/api'
import { communitiesAPI } from '@/features/communities/api'
import { ServicesAPI } from '@/features/services/api'
import { getAllGalleryAlbums } from '@/features/gallery/api'
import { getArticles } from '@/features/buildingOptions/api'
import {
  getBaseUrl,
  generateSitemapXml,
  getCurrentDate,
  sanitizeUrl,
  createFallbackSitemap,
  STATIC_ROUTES,
  DYNAMIC_ROUTE_PRIORITIES,
  type SitemapUrl,
} from '@/lib/sitemap'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Force refresh trigger
export async function GET() {
  try {
    // Force recompilation - get base URL from environment or default
    const baseUrl = getBaseUrl()

    // Fetch all dynamic content in parallel for better performance
    const [properties, communities, servicesResponse, galleryAlbums, articles] = await Promise.all([
      Property.allSlugs().catch(() => []),
      communitiesAPI.getAllCommunities().catch(() => []),
      ServicesAPI.getAllServices().catch(() => ({ data: [], success: false })),
      getAllGalleryAlbums().catch(() => []),
      getArticles().catch(() => []),
    ])

    // Extract services data from response
    const services = servicesResponse.success ? servicesResponse.data : []

    const currentDate = getCurrentDate()
    const urls: SitemapUrl[] = []

    // Add static routes
    STATIC_ROUTES.forEach(route => {
      urls.push({
        url: sanitizeUrl(baseUrl, route.url),
        lastmod: currentDate,
        changefreq: route.changefreq,
        priority: route.priority,
      })
    })

    // Add dynamic property routes
    properties.forEach(slug => {
      if (slug) {
        urls.push({
          url: sanitizeUrl(baseUrl, `/property/${slug}`),
          lastmod: currentDate,
          changefreq: DYNAMIC_ROUTE_PRIORITIES.properties.changefreq,
          priority: DYNAMIC_ROUTE_PRIORITIES.properties.priority,
        })
      }
    })

    // Add dynamic community routes
    communities.forEach(community => {
      if (community.slug) {
        urls.push({
          url: sanitizeUrl(baseUrl, `/communities/${community.slug}`),
          lastmod: currentDate,
          changefreq: DYNAMIC_ROUTE_PRIORITIES.communities.changefreq,
          priority: DYNAMIC_ROUTE_PRIORITIES.communities.priority,
        })
      }
    })

    // Add dynamic service routes
    services.forEach(service => {
      if (service.slug) {
        urls.push({
          url: sanitizeUrl(baseUrl, `/services/${service.slug}`),
          lastmod: currentDate,
          changefreq: DYNAMIC_ROUTE_PRIORITIES.services.changefreq,
          priority: DYNAMIC_ROUTE_PRIORITIES.services.priority,
        })
      }
    })

    // Add dynamic gallery routes
    galleryAlbums.forEach(album => {
      if (album.slug) {
        // Main gallery album
        urls.push({
          url: sanitizeUrl(baseUrl, `/gallery/${album.slug}`),
          lastmod: currentDate,
          changefreq: DYNAMIC_ROUTE_PRIORITIES.gallery.changefreq,
          priority: DYNAMIC_ROUTE_PRIORITIES.gallery.priority,
        })

        // Sub-albums if they exist
        if (album.sub_albums && Array.isArray(album.sub_albums)) {
          album.sub_albums.forEach(subAlbum => {
            if (subAlbum.slug) {
              urls.push({
                url: sanitizeUrl(baseUrl, `/gallery/${album.slug}/${subAlbum.slug}`),
                lastmod: currentDate,
                changefreq: DYNAMIC_ROUTE_PRIORITIES.subGallery.changefreq,
                priority: DYNAMIC_ROUTE_PRIORITIES.subGallery.priority,
              })
            }
          })
        }
      }
    })

    // Add dynamic article routes
    articles.forEach(article => {
      if (article.slug) {
        urls.push({
          url: sanitizeUrl(baseUrl, `/articles/${article.slug}`),
          lastmod: currentDate,
          changefreq: DYNAMIC_ROUTE_PRIORITIES.articles.changefreq,
          priority: DYNAMIC_ROUTE_PRIORITIES.articles.priority,
        })
      }
    })

    // Generate the XML sitemap
    const sitemapXml = generateSitemapXml(urls)

    return new NextResponse(sitemapXml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    
    // Return a fallback sitemap with just the homepage
    const fallbackSitemap = createFallbackSitemap(getBaseUrl())
    
    return new NextResponse(fallbackSitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=300, s-maxage=300', // Cache for 5 minutes on error
      },
    })
  }
}