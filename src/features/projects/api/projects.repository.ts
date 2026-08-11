import type {
  GalleryData,
  GalleryAlbum,
  GalleryImage,
  SubAlbum,
  GallerySearchResult,
  ContactInfo,
} from '@/features/gallery/model/types'
import { httpGetJson } from '@/features/gallery/data/http'
import { cmsUrl } from '@/lib/cms'
import projectsMock from '../mock/projects.json'

/**
 * "Our Projects" repository.
 *
 * Uses the SAME data shape as the gallery (`GalleryData`) but semantically
 * inverted: each top-level album is a LOT (house), and its `sub_albums` are
 * ROOMS (Exterior, Kitchen, Bathroom, ...).
 *
 * Backend note: the CMS endpoint `/api/projects` does not exist yet. Until the
 * backend team ships it, this repository falls back to `mock/projects.json`
 * (the 9 lots). Once the endpoint is live and returns lots, real data wins and
 * the mock fallback can be removed.
 */
const CMS_PROJECTS_URL = cmsUrl('/api/projects')

type ApiEnvelope<T> = {
  success: boolean
  data: T
}

// --- Raw CMS shapes (all fields optional/unknown) ---
type RawImage = {
  virtual_img?: unknown
  virtual_img_type?: unknown
  real_img?: unknown
  real_img_type?: unknown
}

type RawSubAlbum = {
  slug?: unknown
  title?: unknown
  cover_img?: unknown
  cover_img_type?: unknown
  gallery?: unknown
}

type RawAlbum = {
  id?: unknown
  slug?: unknown
  title?: unknown
  cover_img?: unknown
  cover_img_type?: unknown
  sub_albums?: unknown
  gallery?: unknown
}

type RawProjectsData = {
  title?: unknown
  cover?: unknown
  cover_type?: unknown
  contact?: unknown
  gallery?: unknown
}

/** Normalize a raw CMS/mock payload into our strict GalleryData shape. */
function normalize(raw: RawProjectsData): GalleryData {
  return {
    title: String(raw.title ?? ''),
    cover: String(raw.cover ?? ''),
    cover_type: (raw.cover_type as GalleryData['cover_type']) ?? null,
    contact: (raw.contact as ContactInfo) ?? { title: '', message: '' },
    gallery: Array.isArray(raw.gallery)
      ? (raw.gallery as RawAlbum[]).map((album: RawAlbum) => ({
          id: Number(album.id),
          slug: String(album.slug ?? ''),
          title: String(album.title ?? ''),
          cover_img: String(album.cover_img ?? ''),
          cover_img_type: (album.cover_img_type as GalleryAlbum['cover_img_type']) ?? null,
          sub_albums: Array.isArray(album.sub_albums)
            ? (album.sub_albums as RawSubAlbum[]).map((sub: RawSubAlbum) => ({
                slug: String(sub.slug ?? ''),
                title: String(sub.title ?? ''),
                cover_img: String(sub.cover_img ?? ''),
                cover_img_type: (sub.cover_img_type as SubAlbum['cover_img_type']) ?? null,
                gallery: Array.isArray(sub.gallery)
                  ? (sub.gallery as RawImage[]).map((g: RawImage) => ({
                      virtual_img: String(g.virtual_img ?? ''),
                      virtual_img_type:
                        (g.virtual_img_type as GalleryImage['virtual_img_type']) ?? null,
                      real_img: String(g.real_img ?? ''),
                      real_img_type: (g.real_img_type as GalleryImage['real_img_type']) ?? null,
                    }))
                  : [],
              }))
            : [],
          gallery: Array.isArray(album.gallery)
            ? (album.gallery as RawImage[]).map((g: RawImage) => ({
                virtual_img: String(g.virtual_img ?? ''),
                virtual_img_type: (g.virtual_img_type as GalleryImage['virtual_img_type']) ?? null,
                real_img: String(g.real_img ?? ''),
                real_img_type: (g.real_img_type as GalleryImage['real_img_type']) ?? null,
              }))
            : [],
        }))
      : [],
  }
}

/** Load the bundled mock and normalize it. Used when the CMS is unavailable. */
function loadMock(): GalleryData {
  const envelope = projectsMock as unknown as ApiEnvelope<RawProjectsData>
  return normalize(envelope.data)
}

async function fetchProjectsData(): Promise<GalleryData> {
  try {
    const res = await httpGetJson<ApiEnvelope<RawProjectsData>>(CMS_PROJECTS_URL)

    if (!res?.success || !res?.data) {
      throw new Error('Invalid projects response: missing success or data')
    }

    const normalized = normalize(res.data)

    // Endpoint reachable but empty (e.g. stub) → prefer the mock so the page
    // still shows the lots. Remove this once the CMS is fully populated.
    if (normalized.gallery.length === 0) {
      console.warn('[projects] CMS returned 0 lots, using mock')
      return loadMock()
    }

    return normalized
  } catch (error) {
    // Endpoint not built yet / network error → fall back to the local mock.
    console.warn('[projects] CMS unavailable, using mock:', (error as Error)?.message)
    return loadMock()
  }
}

/**
 * Projects API Repository. Mirrors the gallery repository surface.
 */
export class ProjectsApiRepository {
  private cache: GalleryData | null = null
  private cacheAtMs = 0
  private readonly ttlMs = 0

  private async ensureData(): Promise<GalleryData> {
    const now = Date.now()
    if (this.cache && now - this.cacheAtMs < this.ttlMs) {
      return this.cache
    }
    this.cache = await fetchProjectsData()
    this.cacheAtMs = now
    return this.cache
  }

  async getProjectsData(): Promise<GalleryData> {
    return this.ensureData()
  }

  async getCoverImage(): Promise<string> {
    const data = await this.ensureData()
    return data.cover
  }

  async getTitle(): Promise<string> {
    const data = await this.ensureData()
    return data.title
  }

  async getContactInfo(): Promise<ContactInfo> {
    const data = await this.ensureData()
    return data.contact
  }

  async getAllProjects(): Promise<GalleryAlbum[]> {
    const data = await this.ensureData()
    return data.gallery
  }

  async getProjectBySlug(slug: string): Promise<GalleryAlbum | null> {
    const data = await this.ensureData()
    return data.gallery.find(a => a.slug === slug) ?? null
  }

  async getRoom(projectSlug: string, roomSlug: string): Promise<GallerySearchResult> {
    const album = await this.getProjectBySlug(projectSlug)
    if (!album || !album.sub_albums || album.sub_albums.length === 0) {
      return { found: false }
    }
    const subAlbum = album.sub_albums.find(s => s.slug === roomSlug)
    if (!subAlbum) return { found: false, album }
    return { found: true, album, subAlbum }
  }

  invalidateCache(): void {
    this.cache = null
    this.cacheAtMs = 0
  }
}
