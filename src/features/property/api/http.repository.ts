/**
 * Property HTTP Repository
 *
 * Calls your REST API (`GET https://cms.pnehomes.com/api/properties`) and normalizes the response
 * into your internal types. It preserves the same function signatures as the
 * previous file-based repository so the rest of your app doesn't need to change.
 */

import { z } from 'zod'
import type { Property, Contact } from '../model/types'
import type { ListParams } from '../model/selectors'

/* -------------------------------------------------------
 * Helpers
 * ----------------------------------------------------- */

/** Build query string from ListParams using the API's accepted parameters. */
function buildQuery(params: ListParams = {}): string {
  const qp = new URLSearchParams()

  if (params.community) qp.set('community', params.community)
  if (params.price != null) qp.set('price', String(params.price))
  if (params.beds != null) qp.set('beds', String(params.beds))
  if (params.baths != null) qp.set('baths', String(params.baths))
  if (params.garages != null) qp.set('garages', String(params.garages))
  if (params.min != null) qp.set('min', String(params.min))
  if (params.max != null) qp.set('max', String(params.max))

  // if (params.sortBy) qp.set('sortBy', params.sortBy)
  // if (params.sortOrder) qp.set('sortOrder', params.sortOrder)

  qp.set('page', String(params.page ?? 1))
  qp.set('limit', String(params.limit ?? 9))

  return qp.toString()
}

/** Simple safe fetch wrapper (no-store so filters/sorting reflect latest). */
async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status} for ${url}: ${body}`)
  }
  return (await res.json()) as T
}

/* -------------------------------------------------------
 * Zod schemas for the API response (loose/forgiving)
 * We accept both `floor_plans` and `Floor_plans`, and both
 * `Description` and `description`, then normalize later.
 * ----------------------------------------------------- */

const ApiWhatsSpecial = z
  .object({
    badges: z.array(z.string()),
    description: z.string(),
  })
  .partial()
  .nullable()
  .optional()

const ApiFactsFeature = z.object({
  title: z.string(),
  list: z.array(z.string()),
})

const ApiFloorPlanLoose = z.object({
  title: z.string(),
  img: z.union([z.string(), z.null()]).optional(), // allow null/missing
  img_type: z.string().nullable().optional(),
  Description: z.string().optional(),
  description: z.string().optional(),
})


const ApiProperty = z.object({
  id: z.number(),
  slug: z.string(),
  title: z.string(),
  community: z.string(),
  price: z.union([z.string(), z.number()]),
  beds: z.union([z.string(), z.number()]),
  baths: z.union([z.string(), z.number()]),
  garages: z.union([z.string(), z.number()]),
  sqft: z.union([z.string(), z.number()]),
  gallery: z.array(z.string()).default([]),
  zillow_link: z.string().nullable().optional(),
  Whats_special: ApiWhatsSpecial,
  Facts_features: z.array(ApiFactsFeature).optional().default([]),

  // Accept either key; normalize later
  floor_plans: z.array(ApiFloorPlanLoose).optional(),
  Floor_plans: z.array(ApiFloorPlanLoose).optional(),
})

const ApiPagination = z.object({
  current_page: z.number(),
  per_page: z.number(),
  total: z.number(),
  last_page: z.number(),
})

const ApiDataEnvelope = z.object({
  success: z.boolean(),
  data: z.object({
    title: z.string().optional().default('Floor Plans'),
    cover: z.string().nullable().optional(), // allow null/missing
    cover_type: z.string().nullable().optional(),
    properties: z.array(ApiProperty),
    pagination: ApiPagination.optional(),
    filters: z
      .object({
        communities: z.array(z.string()),
      })
      .partial()
      .optional(),
    // Some backends may include contact; make it optional
    contact: z
      .object({
        title: z.string(),
        message: z.string(),
      })
      .optional(),
  }),
})

type ApiEnvelope = z.infer<typeof ApiDataEnvelope>

/* -------------------------------------------------------
 * Normalizers (API -> internal Property)
 * ----------------------------------------------------- */

function toStringNumberish(v: string | number | undefined | null): string {
  if (v == null) return ''
  return typeof v === 'number' ? String(v) : v
}

function normalizeFloorPlans(
  p: z.infer<typeof ApiProperty>
): Array<{ title: string; img: string; img_type: 'image' | 'video' | null; Description: string }> {
  const plans = p.floor_plans ?? p.Floor_plans ?? []
  return plans.map(fp => ({
    title: fp.title,
    img: fp.img ?? '', // handle null/missing
    img_type: (fp.img_type as 'image' | 'video' | null) ?? null,
    // normalize to capital-D `Description` to match your existing types
    Description: fp.Description ?? fp.description ?? '',
  }))
}

function normalizeProperty(p: z.infer<typeof ApiProperty>): Property {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    community: p.community,
    price: toStringNumberish(p.price),
    beds: toStringNumberish(p.beds),
    baths: toStringNumberish(p.baths),
    garages: toStringNumberish(p.garages),
    sqft: toStringNumberish(p.sqft),
    gallery: p.gallery ?? [],
    zillow_link: p.zillow_link ?? null,
    Whats_special:
      p.Whats_special && (p.Whats_special.badges || p.Whats_special.description)
        ? {
            badges: p.Whats_special.badges ?? [],
            description: p.Whats_special.description ?? '',
          }
        : null,
    Facts_features: p.Facts_features ?? [],
    // Your internal type uses `floor_plans` with `Description`
    floor_plans: normalizeFloorPlans(p),
  }
}

/* -------------------------------------------------------
 * Public API (same signatures as file.repository.ts)
 * ----------------------------------------------------- */

/**
 * Retrieves a filtered, sorted, and paginated list of properties
 */
export async function list(params: ListParams = {}): Promise<Property[]> {
  const qs = buildQuery(params)
  const envelope = ApiDataEnvelope.parse(
    await getJson<ApiEnvelope>(`https://cms.pnehomes.com/api/properties?${qs}`)
  )
  return envelope.data.properties.map(normalizeProperty)
}

/**
 * Gets the total count of properties that match the given filter criteria
 * (reads `data.pagination.total`; if pagination missing, falls back to array length)
 */
export async function getTotalFilteredCount(params: ListParams = {}): Promise<number> {
  const qs = buildQuery({ ...params, page: 1, limit: params.limit ?? 1 })
  const envelope = ApiDataEnvelope.parse(
    await getJson<ApiEnvelope>(`https://cms.pnehomes.com/api/properties?${qs}`)
  )
  return envelope.data.pagination?.total ?? envelope.data.properties.length
}

/**
 * Retrieves a single property by its unique slug.
 * Strategy:
 *  1) Try a direct slug filter if the backend supports it (?slug=...).
 *  2) Fallback: walk pages until found.
 */
export async function getBySlug(slug: string): Promise<Property | undefined> {
  // 1) Try direct slug param (harmless if backend ignores it)
  try {
    const url = `https://cms.pnehomes.com/api/properties?slug=${encodeURIComponent(slug)}&limit=1&page=1`
    const direct = ApiDataEnvelope.parse(await getJson<ApiEnvelope>(url))
    const hit = direct.data.properties.find(p => p.slug === slug)
    if (hit) return normalizeProperty(hit)
  } catch {
    // ignore and fallback to scan
  }

  // 2) Scan pages (starts at page 1)
  let page = 1
  while (true) {
    const qs = buildQuery({ page, limit: 50 }) // larger page to reduce roundtrips
    const env = ApiDataEnvelope.parse(
      await getJson<ApiEnvelope>(`https://cms.pnehomes.com/api/properties?${qs}`)
    )
    const found = env.data.properties.find(p => p.slug === slug)
    if (found) return normalizeProperty(found)

    const last = env.data.pagination?.last_page ?? page
    if (page >= last) break
    page += 1
  }

  return undefined
}

/**
 * Retrieves all property slugs (walks pagination).
 */
export async function allSlugs(): Promise<string[]> {
  const slugs: string[] = []
  let page = 1
  let last = 1

  do {
    const qs = buildQuery({ page, limit: 100 })
    const env = ApiDataEnvelope.parse(
      await getJson<ApiEnvelope>(`https://cms.pnehomes.com/api/properties?${qs}`)
    )
    slugs.push(...env.data.properties.map(p => p.slug))
    last = env.data.pagination?.last_page ?? page
    page += 1
  } while (page <= last)

  return slugs
}

/**
 * Gets all unique communities from the API response.
 * Prefer `data.filters.communities`; if absent, derive from properties.
 */
export async function getCommunities(): Promise<string[]> {
  const env = ApiDataEnvelope.parse(
    await getJson<ApiEnvelope>(`https://cms.pnehomes.com/api/properties?page=1&limit=1`)
  )
  if (env.data.filters?.communities?.length) {
    return [...env.data.filters.communities].sort((a, b) => a.localeCompare(b))
  }

  // Fallback: derive by walking pages
  const set = new Set<string>()
  let page = 1
  let last = 1
  do {
    const qs = buildQuery({ page, limit: 100 })
    const pageEnv = ApiDataEnvelope.parse(
      await getJson<ApiEnvelope>(`https://cms.pnehomes.com/api/properties?${qs}`)
    )
    pageEnv.data.properties.forEach(p => {
      if (p.community?.trim()) set.add(p.community.trim())
    })
    last = pageEnv.data.pagination?.last_page ?? page
    page += 1
  } while (page <= last)

  return Array.from(set).sort((a, b) => a.localeCompare(b))
}

/**
 * Gets the cover image URL for the floor plans page.
 */
export async function getCoverImage(): Promise<string> {
  const env = ApiDataEnvelope.parse(
    await getJson<ApiEnvelope>(`https://cms.pnehomes.com/api/properties?page=1&limit=1`)
  )
  return env.data.cover ?? ''
}

/**
 * Gets the page title for the floor plans page.
 */
export async function getPageTitle(): Promise<string> {
  const env = ApiDataEnvelope.parse(
    await getJson<ApiEnvelope>(`https://cms.pnehomes.com/api/properties?page=1&limit=1`)
  )
  return env.data.title ?? 'Floor Plans'
}

/**
 * Gets the contact information including title and message template.
 * If the API doesn't provide `data.contact`, we return a sensible default.
 */
export async function getContactInfo(): Promise<Contact> {
  const env = ApiDataEnvelope.parse(
    await getJson<ApiEnvelope>(`https://cms.pnehomes.com/api/properties?page=1&limit=1`)
  )
  if (env.data.contact?.title && env.data.contact?.message) {
    return {
      title: env.data.contact.title,
      message: env.data.contact.message,
    }
  }
  // Fallback (preserves previous contract)
  return {
    title: 'Contact Us',
    message: "I'm contacting you to ask about the property {propertyTitle}",
  }
}

// Re-export the ListParams type for external consumption
export type { ListParams } from '../model/selectors'
