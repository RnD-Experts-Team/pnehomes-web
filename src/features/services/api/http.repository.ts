import {
  Service,
  Services,
  ServiceRepository,
  ServicesData,
  RemoteServicesEnvelope,
  type MediaType,
} from '../model/types'

import { cmsUrl } from '@/lib/cms'

const SERVICES_ENDPOINT = cmsUrl('/api/services')

/**
 * Minimal fetch wrapper with timeout & JSON guard
 */
async function httpGetJSON<T>(url: string, timeoutMs = 10000): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Request failed (${res.status}): ${text || res.statusText}`)
    }
    const json = (await res.json()) as T
    return json
  } catch (err: unknown) {
    const isAbort =
      (err instanceof Error && err.name === 'AbortError') ||
      (typeof DOMException !== 'undefined' && err instanceof DOMException && err.name === 'AbortError')

    if (isAbort) {
      throw new Error('Request timed out')
    }

    throw err
  } finally {
    clearTimeout(timer)
  }
}


/**
 * Very small in-memory cache to avoid re-fetching the same blob repeatedly.
 * If you’d rather not cache, set CACHE_TTL_MS = 0.
 */
const CACHE_TTL_MS = 60_000 // 1 minute
type CacheEntry = { data: ServicesData; expiresAt: number }
let servicesCache: CacheEntry | null = null

async function getServicesDataFresh(): Promise<ServicesData> {
  // Serve from cache if valid
  if (servicesCache && servicesCache.expiresAt > Date.now()) {
    return servicesCache.data
  }

  const envelope = await httpGetJSON<RemoteServicesEnvelope>(SERVICES_ENDPOINT)
  if (!envelope?.success || !envelope?.data) {
    throw new Error('Malformed CMS response')
  }

  // Normalize just in case (defensive)
  const data: ServicesData = {
    cover: envelope.data.cover,
    cover_type: envelope.data.cover_type ?? null,
    services: Array.isArray(envelope.data.services) ? envelope.data.services : [],
  }

  servicesCache = { data, expiresAt: Date.now() + CACHE_TTL_MS }
  return data
}

/**
 * HTTP-based repository implementation for services data
 */
export class HttpServiceRepository implements ServiceRepository {
  /**
   * Get all services
   */
  async getAll(): Promise<Services> {
    const data = await getServicesDataFresh()
    return data.services
  }

  /**
   * Get service by ID
   * (CMS returns full collection; we filter client-side.)
   */
  async getById(id: number): Promise<Service | null> {
    const data = await getServicesDataFresh()
    return data.services.find(s => s.id === id) ?? null
  }

  /**
   * Get service by slug
   */
  async getBySlug(slug: string): Promise<Service | null> {
    const data = await getServicesDataFresh()
    return data.services.find(s => s.slug === slug) ?? null
  }

  /**
   * Get cover image
   */
  async getCover(): Promise<string> {
    const data = await getServicesDataFresh()
    return data.cover
  }

  async getCoverType(): Promise<MediaType> {
    const data = await getServicesDataFresh()
    return data.cover_type
  }

  /**
   * Search services by title (case-insensitive; client-side)
   */
  async searchByTitle(query: string): Promise<Services> {
    const data = await getServicesDataFresh()
    const q = query.trim().toLowerCase()
    if (!q) return data.services
    return data.services.filter(s => s.title.toLowerCase().includes(q))
  }

  /**
   * Get services with pagination (client-side)
   */
  async getPaginated(page = 1, limit = 10): Promise<{
    services: Services
    total: number
    page: number
    totalPages: number
  }> {
    const data = await getServicesDataFresh()
    const total = data.services.length
    const startIndex = Math.max(0, (page - 1) * limit)
    const endIndex = Math.max(startIndex, startIndex + limit)
    const services = data.services.slice(startIndex, endIndex)
    const totalPages = Math.ceil(total / limit) || 1

    return { services, total, page, totalPages }
  }

  /**
   * Check if service exists by slug
   */
  async existsBySlug(slug: string): Promise<boolean> {
    const data = await getServicesDataFresh()
    return data.services.some(s => s.slug === slug)
  }
}

// Export singleton instance
export const serviceRepository = new HttpServiceRepository()
