// src/services/buildingOptions.service.ts
import { BuildingOptionsApiRepository } from './api.repository'
import type { BuildingOptionsData, BuildingOption, Article, ArticlesSection } from '../model/types'
import { cmsUrl } from '@/lib/cms'

const BASE_URL = cmsUrl('/api')
const PATH = process.env.CMS_BUILDING_OPTIONS_PATH ?? '/building-options'
const TTL_MS = process.env.CMS_CACHE_TTL_MS ? Number(process.env.CMS_CACHE_TTL_MS) : 10 * 60 * 1000

// Create a singleton instance of the repository (API-backed)
const buildingOptionsRepository = new BuildingOptionsApiRepository(BASE_URL, PATH, TTL_MS)

/**
 * Get all building options data (async)
 */
export const getBuildingOptions = async (): Promise<BuildingOptionsData> => {
  return buildingOptionsRepository.getBuildingOptions()
}

/**
 * Get building options synchronously from cache
 */
export const getBuildingOptionsSync = (): BuildingOptionsData => {
  return buildingOptionsRepository.getBuildingOptionsSync()
}

/**
 * Get all articles (async)
 */
export const getArticles = async (): Promise<Article[]> => {
  return buildingOptionsRepository.getArticles()
}

/**
 * Get articles synchronously from cache
 */
export const getArticlesSync = (): Article[] => {
  return buildingOptionsRepository.getArticlesSync()
}

/**
 * Get article by slug (async)
 */
export const getArticleBySlug = async (slug: string): Promise<Article | undefined> => {
  return buildingOptionsRepository.getArticleBySlug(slug)
}

/**
 * Get article by slug synchronously from cache
 */
export const getArticleBySlugSync = (slug: string): Article | undefined => {
  return buildingOptionsRepository.getArticleBySlugSync(slug)
}

// Export types for convenience (unchanged)
export type { BuildingOptionsData, BuildingOption, Article, ArticlesSection }

// Export repository class for advanced usage
export { BuildingOptionsApiRepository }
