import { EventsData, EventsResponse, RawEventsResponse } from '../model/types'

/**
 * HTTP repository class for managing events data from the CMS API
 * Replaces the previous FileRepository.
 */
export class HttpRepository {
  private readonly endpoint: string
  private cache: { data: EventsResponse; at: number } | null = null
  private readonly cacheMs: number

  constructor(opts?: { endpoint?: string; cacheMs?: number }) {
    // Allow overriding via env or opts; default to the provided CMS URL
    const envEndpoint =
      process.env.NEXT_PUBLIC_EVENTS_API_URL ||
      process.env.EVENTS_API_URL

    this.endpoint = opts?.endpoint || envEndpoint || 'https://cms.pnehomes.com/api/events'
    this.cacheMs = typeof opts?.cacheMs === 'number' ? opts!.cacheMs : 60_000 // 1 minute default
  }

  /**
   * Internal: fetch JSON with timeout and helpful errors
   */
  private async fetchJson<T>(url: string, init?: RequestInit, timeoutMs = 10_000): Promise<T> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
        ...init,
      })

      if (!res.ok) {
        const bodyText = await res.text().catch(() => '')
        throw new Error(`HTTP ${res.status} ${res.statusText}${bodyText ? ` — ${bodyText}` : ''}`)
      }

      return (await res.json()) as T
    } finally {
      clearTimeout(timeout)
    }
  }

  /**
   * Map raw API payload into the internal EventsData shape
   */
  private mapToEventsData(raw: RawEventsResponse): EventsData {
    if (!raw?.success || !raw.data) {
      throw new Error(raw?.error || 'Invalid API response')
    }

    const { cover, slogan, title, events, contact } = raw.data

    return {
      cover,
      cover_type: (raw.data.cover_type as EventsData['cover_type']) ?? null,
      slogan,
      title,
      contact,
      events: (events || []).map(e => ({
        id: e.id,
        title: e.title,
        description: e.description,
        gallery: Array.isArray(e.gallery) ? e.gallery : [],
        cover: e.cover,
      })),
    }
  }

  /**
   * Read events data from the API (with simple in-memory caching)
   * @returns Promise<EventsResponse>
   */
  async getEventsData(forceRefresh = false): Promise<EventsResponse> {
    try {
      if (!forceRefresh && this.cache && Date.now() - this.cache.at < this.cacheMs) {
        return this.cache.data
      }

      const raw = await this.fetchJson<RawEventsResponse>(this.endpoint)
      const data = this.mapToEventsData(raw)

      const response: EventsResponse = { success: true, data }
      this.cache = { data: response, at: Date.now() }
      return response
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred'
      const resp: EventsResponse = { success: false, error: message }
      // Do not blow away a good cache on transient failure
      if (!this.cache) this.cache = { data: resp, at: Date.now() }
      return resp
    }
  }

  /**
   * Get all events
   */
  async getAllEvents() {
    const response = await this.getEventsData()
    if (response.success && response.data) {
      return response.data.events
    }
    return []
  }

  /**
   * Get event by title (case-insensitive)
   */
  async getEventByTitle(title: string) {
    const events = await this.getAllEvents()
    return events.find(event => event.title.toLowerCase() === title.toLowerCase()) || null
  }

  /**
   * Get contact information
   */
  async getContactInfo() {
    const response = await this.getEventsData()
    if (response.success && response.data && response.data.contact) {
      return response.data.contact
    }
    return null
  }

  /**
   * Get events slogan
   */
  async getSlogan() {
    const response = await this.getEventsData()
    if (response.success && response.data) {
      return response.data.slogan
    }
    return ''
  }

  /**
   * Get events title
   */
  async getTitle() {
    const response = await this.getEventsData()
    if (response.success && response.data) {
      return response.data.title
    }
    return ''
  }

  /**
   * Get cover image path
   */
  async getCover() {
    const response = await this.getEventsData()
    if (response.success && response.data) {
      return response.data.cover
    }
    return ''
  }
}

// Export a singleton instance
export const httpRepository = new HttpRepository()
