// src/repositories/api.repository.ts
import type { BuildingOptionsData, BuildingOption, Article, ArticlesSection } from '../model/types'
import { cmsUrl } from '@/lib/cms'

/**
 * Raw API response shapes
 */
type ApiArticle = {
  id: number
  slug: string
  title: string
  description?: string | null
  image: string
  image_type?: string | null
  content?: string | null
}

type ApiSection = {
  id: number
  title: string
  description?: string | null
  section_image: string
  section_image_type?: string | null
}

type ApiEnvelope<T> = {
  success: boolean
  data: T
}

type ApiBuildingOptionsPayload = {
  cover: string
  cover_type?: string | null
  slogan: string
  title: string
  sections: ApiSection[]
  articles_cover?: string | null
  articles_cover_type?: string | null
  articles?: ApiArticle[]
}

/**
 * Repository that fetches data from the CMS API and adapts it to the app's domain types.
 * It also keeps a simple in-memory cache to support the "Sync" getters.
 */
export class BuildingOptionsApiRepository {
  private readonly endpoint: string
  private cache: BuildingOptionsData | null = null
  private fetchedAt: number | null = null
  private readonly ttlMs: number

  constructor(
    baseUrl = cmsUrl('/api'),
    path = '/building-options',
    // optional TTL to refresh cache periodically if desired (default: 10 minutes)
    ttlMs = 10 * 60 * 1000
  ) {
    this.endpoint = `${baseUrl.replace(/\/$/, '')}${path}`
    this.ttlMs = ttlMs
  }

  /**
   * Fetch + adapt API data to domain.
   */
  async getBuildingOptions(): Promise<BuildingOptionsData> {
    // Serve from cache if fresh
    if (this.cache && this.fetchedAt && Date.now() - this.fetchedAt < this.ttlMs) {
      return this.cache
    }

    const res = await fetch(this.endpoint, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Failed to fetch building options (${res.status}): ${text}`)
    }

    const json = (await res.json()) as ApiEnvelope<ApiBuildingOptionsPayload>

    if (!json?.success || !json?.data) {
      throw new Error('Unexpected API response: missing data or success=false')
    }

    const domain = adaptToDomain(json.data)
    this.cache = domain
    this.fetchedAt = Date.now()
    return domain
  }

  /**
   * Return cached domain data synchronously.
   * Throws if not available yet (call async first) or if cache expired.
   */
  getBuildingOptionsSync(): BuildingOptionsData {
    if (!this.cache) {
      throw new Error('Building options not loaded yet. Call getBuildingOptions() first.')
    }
    // Optionally, enforce TTL even on sync reads:
    if (this.fetchedAt && Date.now() - this.fetchedAt > this.ttlMs) {
      throw new Error('Cached building options expired. Refresh with getBuildingOptions().')
    }
    return this.cache
  }

  /**
   * Convenience: return just articles.
   */
  async getArticles(): Promise<Article[]> {
    const data = await this.getBuildingOptions()
    return data.articles.articles
  }

  getArticlesSync(): Article[] {
    return this.getBuildingOptionsSync().articles.articles
  }

  /**
   * Find article by slug
   */
  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    const articles = await this.getArticles()
    return articles.find(a => a.slug === slug)
  }

  getArticleBySlugSync(slug: string): Article | undefined {
    const articles = this.getArticlesSync()
    return articles.find(a => a.slug === slug)
  }
}

/**
 * Adapter: API -> Domain
 * Maps:
 *  - data.cover              -> cover
 *  - data.slogan             -> slogan
 *  - data.title              -> title
 *  - data.sections[]         -> options[] (section_image -> section_img)
 *  - data.articles_cover     -> articles.cover
 *  - data.articles[]         -> articles.articles[] (image -> img, content default '')
 */
function adaptToDomain(payload: ApiBuildingOptionsPayload): BuildingOptionsData {
  const options: BuildingOption[] = (payload.sections ?? []).map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description ?? null,
    section_img: s.section_image,
    section_img_type: (s.section_image_type as BuildingOption['section_img_type']) ?? null,
  }))

  const mappedArticles: Article[] = (payload.articles ?? []).map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    description: a.description ?? null,
    img: a.image,
    img_type: (a.image_type as Article['img_type']) ?? null,
    // API does not provide article body; keep empty string to satisfy the domain type
    content: a.content ?? '',
  }))

  const articlesSection: ArticlesSection = {
    cover: payload.articles_cover ?? null,
    cover_type: (payload.articles_cover_type as ArticlesSection['cover_type']) ?? null,
    articles: mappedArticles,
  }

  const domain: BuildingOptionsData = {
    cover: payload.cover,
    cover_type: (payload.cover_type as BuildingOptionsData['cover_type']) ?? null,
    slogan: payload.slogan,
    title: payload.title,
    options,
    articles: articlesSection,
  }

  return domain
}
