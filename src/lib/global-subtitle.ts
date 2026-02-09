/**
 * Global subtitle utility
 * Fetches the subtitle from the home page's first section to use across multiple pages
 */

import { homeContentApi } from '@/features/home/api/new.home_content.api'

/**
 * Get the global subtitle from the first section of the home page
 * This subtitle is used consistently across floor plans, gallery, communities, and building options pages
 */
export async function getGlobalSubtitle(): Promise<string> {
  const firstSection = await homeContentApi.getFirstSection()
  return firstSection.subtitle || ''
}
