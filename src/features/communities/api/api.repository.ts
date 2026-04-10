// src/repository/api.repository.ts
import { Community, CommunitiesPageData, MediaType } from '../model/types'
import { cmsUrl } from '@/lib/cms'

const API_URL = cmsUrl('/api/communities')

type CmsEnvelope<T> = {
  success: boolean
  data: T
}

type CmsCommunitiesPayload = {
  title: string | null
  cover: string | null
  cover_type?: string | null
  communities: Community[]
  zillow: string | null
  contact: {
    title?: string | null
    message?: string | null
  } | null
}

export class ApiRepository {
  private cache: CmsCommunitiesPayload | null = null
  private lastFetchedAt: number | null = null
  private ttlMs = 60_000 // 1 minute cache; adjust as needed

  private async load(): Promise<CmsCommunitiesPayload> {
    const now = Date.now()
    if (this.cache && this.lastFetchedAt && now - this.lastFetchedAt < this.ttlMs) {
      return this.cache
    }

    const res = await fetch(API_URL, { cache: 'no-store' })
    if (!res.ok) {
      throw new Error(`Failed to fetch communities: ${res.status} ${res.statusText}`)
    }

    const json = (await res.json()) as CmsEnvelope<CmsCommunitiesPayload>
    if (!json?.success || !json?.data) {
      throw new Error('Invalid CMS response format')
    }

    // Minimal normalization to ensure optional fields exist
    const data = json.data
    data.communities = (data.communities || []).map((c) => ({
      ...c,
      card_image_type: c.card_image_type ?? null,
      gallery: c.gallery || [],
      video: c.video ?? null,
      video_type: c.video_type ?? null,
      'community-features': c['community-features'] ?? null,
      'floor-plans': (c['floor-plans'] ?? []).map((fp) => ({
        ...fp,
        cover_type: fp.cover_type ?? null,
        status: fp.status ?? null,
      })),
      // ensure starting-price is a string (CMS returns string already, but just in case)
      'starting-price': `${c['starting-price'] ?? ''}`,
    }))

    this.cache = data
    this.lastFetchedAt = now
    return data
  }

  /**
   * Get all communities
   */
  async getAllCommunities(): Promise<Community[]> {
    const data = await this.load()
    return data.communities
  }

  /**
   * Get community by slug
   */
  async getCommunityBySlug(slug: string): Promise<Community | null> {
    const data = await this.load()
    return data.communities.find((c) => c.slug === slug) || null
  }

  /**
   * Get community by ID
   */
  async getCommunityById(id: number): Promise<Community | null> {
    const data = await this.load()
    return data.communities.find((c) => c.id === id) || null
  }

  /**
   * Get communities by city
   */
  async getCommunitiesByCity(city: string): Promise<Community[]> {
    const data = await this.load()
    return data.communities.filter((c) => c.city?.toLowerCase().includes(city.toLowerCase()))
  }

  /**
   * Search communities by name
   */
  async searchCommunitiesByName(name: string): Promise<Community[]> {
    const data = await this.load()
    return data.communities.filter((c) => c.title?.toLowerCase().includes(name.toLowerCase()))
  }

  /**
   * Get all unique cities
   */
  async getAllCities(): Promise<string[]> {
    const data = await this.load()
    return [...new Set(data.communities.map((c) => c.city).filter(Boolean))]
  }

  /**
   * Get Zillow URL (may be null in CMS)
   */
  async getZillowUrl(): Promise<string> {
    const data = await this.load()
    return data.zillow || ''
  }

  /**
   * Get contact message template (fallback to your original template)
   */
  async getContactMessage(): Promise<string> {
    const data = await this.load()
    return data.contact?.message || "I'm contacting you to ask about the community of {title}"
  }

  /**
   * Get cover image (fallback to your previous default)
   */
  async getCoverImage(): Promise<string> {
    const data = await this.load()
    return data.cover || '/img/communities.jpg'
  }

  /**
   * Get communities page data (title, cover, zillow link, contact)
   */
  async getCommunitiesPageData(): Promise<CommunitiesPageData> {
    const data = await this.load()
    return {
      title: data.title || 'Communities',
      cover: data.cover || '/img/communities.jpg',
      cover_type: (data.cover_type as MediaType) ?? null,
      zillowLink: data.zillow || '',
      contact: {
        title: data.contact?.title || undefined,
        message: data.contact?.message || undefined,
      },
    }
  }
}

export default ApiRepository
