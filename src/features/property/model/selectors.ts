/**
 * Property Selectors and Filtering Logic
 *
 * This module provides functions for filtering, sorting, and paginating property data.
 * It implements a flexible query system that supports multiple filter criteria,
 * various sorting options, and pagination for optimal user experience.
 */

// src/features/property/model/selectors.ts

import type { Property } from './types'

/**
 * Parameters for filtering, sorting, and paginating property lists
 *
 * @interface ListParams
 * @property {string} [community] - Filter by community name (case-insensitive partial match)
 * @property {number} [price] - Filter properties with price equal to or below this value
 * @property {number} [beds] - Filter properties with bedrooms equal to or above this value
 * @property {number} [baths] - Filter properties with bathrooms equal to or above this value
 * @property {number} [garages] - Filter properties with garages equal to or above this value
 * @property {number} [min] - Minimum price filter (inclusive)
 * @property {number} [max] - Maximum price filter (inclusive)
 * @property {number} [page] - Page number for pagination (1-based, defaults to 1)
 * @property {number} [limit] - Number of items per page (defaults to 9)
 * @property {string} [sortBy] - Field to sort by (sqft, price, id, title - defaults to title)
 * @property {string} [sortOrder] - Sort direction (asc, desc - defaults to asc)
 */
export type ListParams = {
  community?: string
  price?: number
  beds?: number
  baths?: number
  garages?: number
  min?: number
  max?: number
  page?: number
  limit?: number
  sortBy?: 'sqft' | 'price' | 'id' | 'title'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Applies filtering, sorting, and pagination to a property array
 *
 * This function processes properties through multiple stages:
 * 1. Filtering: Applies all specified filter criteria
 * 2. Sorting: Orders results by the specified field and direction
 * 3. Pagination: Returns only the requested page of results
 *
 * @param items - Array of Property objects to process
 * @param params - Filtering, sorting, and pagination parameters
 * @returns Filtered, sorted, and paginated array of properties
 *
 * @example
 * // Get second page of available properties in "Downtown" with 3+ bedrooms, sorted by price
 * const results = applyFiltersAndSort(properties, {
 *   community: 'Downtown',
 *   beds: 3,
 *   sortBy: 'price',
 *   sortOrder: 'asc',
 *   page: 2,
 *   limit: 6
 * })
 */
export function applyFiltersAndSort(items: Property[], params: ListParams = {}) {
  let out = [...items]

  // Community filter - case-insensitive comparison
  if (params.community) {
    const searchCommunity = params.community.toLowerCase().trim()
    out = out.filter(p => p.community.toLowerCase().includes(searchCommunity))
  }

  // Price filter - equal to or below specified value
  if (params.price) {
    out = out.filter(p => parseInt(p.price) <= params.price!)
  }

  // Bedroom filter - equal to or above specified value (minimum bedrooms)
  if (params.beds) out = out.filter(p => parseInt(p.beds) >= params.beds!)

  // Bathroom filter - equal to or above specified value (minimum bathrooms)
  if (params.baths) out = out.filter(p => parseFloat(p.baths) >= params.baths!)

  // Garages filter - equal to or above specified value (minimum garages)
  if (params.garages) out = out.filter(p => parseInt(p.garages) >= params.garages!)

  // Price range filters - min and max price boundaries
  if (params.min) out = out.filter(p => parseInt(p.price) >= params.min!)
  if (params.max) out = out.filter(p => parseInt(p.price) <= params.max!)

  // Sorting logic - supports multiple fields with ascending/descending order.
  // Defaults to a natural sort on `title` ascending. This is deliberate: the
  // database `id` does NOT track the plan/lot number (a plan numbered lower
  // can easily have been created in the CMS after one numbered higher), so
  // sorting by `id` still left the listing out of sequence. `sqft desc` (the
  // old default) was worse still — it silently overrode the CMS's intended
  // order with "biggest house first". Sorting the title itself with
  // `numeric: true` compares embedded numbers numerically ("Plan 2" before
  // "Plan 10", not after) and reliably reproduces the CMS's Plan 1, 2, 3 ...
  // 31, 32, 33 ordering regardless of insertion order.
  const sortBy = params.sortBy || 'title'
  const sortOrder = params.sortOrder || 'asc'

  // Collapse stray repeated whitespace (e.g. a CMS entry typed as "PNE PLAN  7"
  // with a double space) so a data typo can't throw the natural sort off —
  // localeCompare's numeric collation treats that extra space as meaningful,
  // which otherwise sorts "PNE PLAN  7" before "PNE PLAN 1" entirely.
  const normalizeTitle = (title: string) => title.replace(/\s+/g, ' ').trim()

  out.sort((a, b) => {
    if (sortBy === 'title') {
      const cmp = normalizeTitle(a.title).localeCompare(normalizeTitle(b.title), undefined, {
        numeric: true,
        sensitivity: 'base',
      })
      return sortOrder === 'desc' ? -cmp : cmp
    }

    let aValue: number
    let bValue: number

    // Determine comparison values based on sort field
    switch (sortBy) {
      case 'sqft':
        aValue = parseInt(a.sqft)
        bValue = parseInt(b.sqft)
        break
      case 'price':
        aValue = parseInt(a.price)
        bValue = parseInt(b.price)
        break
      case 'id':
      default:
        aValue = a.id
        bValue = b.id
        break
    }

    return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
  })

  // Pagination logic - slice array to return only requested page
  const page = params.page || 1
  const limit = params.limit || 9
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit

  return out.slice(startIndex, endIndex)
}

/**
 * Calculates the total count of properties matching the filter criteria
 *
 * This function applies the same filtering logic as applyFiltersAndSort
 * but without sorting and pagination, returning only the count.
 * Useful for pagination controls and displaying "X of Y results" information.
 *
 * @param items - Array of Property objects to count
 * @param params - Filtering parameters (sorting and pagination are ignored)
 * @returns Total number of properties matching the filter criteria
 *
 * @example
 * // Get total count of available properties under $500k
 * const totalCount = getTotalCount(properties, {
 *   max: 500000
 * })
 * console.log(`Found ${totalCount} available properties under $500k`)
 */
export function getTotalCount(items: Property[], params: ListParams = {}) {
  let out = [...items]

  // Apply the same filters as applyFiltersAndSort but without sorting and pagination
  if (params.community) {
    const searchCommunity = params.community.toLowerCase().trim()
    out = out.filter(p => p.community.toLowerCase().includes(searchCommunity))
  }

  if (params.price) {
    out = out.filter(p => parseInt(p.price) <= params.price!)
  }

  if (params.beds) out = out.filter(p => parseInt(p.beds) >= params.beds!)
  if (params.baths) out = out.filter(p => parseFloat(p.baths) >= params.baths!)
  if (params.garages) out = out.filter(p => parseInt(p.garages) >= params.garages!)
  if (params.min) out = out.filter(p => parseInt(p.price) >= params.min!)
  if (params.max) out = out.filter(p => parseInt(p.price) <= params.max!)

  return out.length
}

/**
 * Gets unique communities from all properties for dropdown filtering
 *
 * @param items - Array of Property objects to extract communities from
 * @returns Array of unique community names, sorted alphabetically
 *
 * @example
 * const communities = getUniqueCommunities(properties)
 * // Returns: ['Beulah Park', 'Downtown', 'Riverside']
 */
export function getUniqueCommunities(items: Property[]): string[] {
  const communities = new Set<string>()

  items.forEach(property => {
    if (property.community && property.community.trim()) {
      communities.add(property.community.trim())
    }
  })

  return Array.from(communities).sort((a, b) => a.localeCompare(b))
}
