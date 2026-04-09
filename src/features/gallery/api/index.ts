// Swap one line to choose your data source:
import { GalleryApiRepository } from './api.repository'
// import { GalleryFileRepository } from './file.repository'

import {
  GalleryData,
  GalleryAlbum,
  GalleryAlbums,
  GalleryFilterOptions,
  GallerySearchResult,
  ContactInfo,
  MediaType,
} from '../model/types'

const galleryRepository = new GalleryApiRepository()
// const galleryRepository = new GalleryFileRepository() // fallback to local mock

export const getGalleryData = async (): Promise<GalleryData> =>
  galleryRepository.getGalleryData()

export const getGalleryCover = async (): Promise<string> =>
  galleryRepository.getCoverImage()

export const getGalleryCoverData = async (): Promise<{ cover: string; cover_type: MediaType }> => {
  const data = await galleryRepository.getGalleryData()
  return { cover: data.cover, cover_type: data.cover_type }
}

export const getGalleryTitle = async (): Promise<string> =>
  galleryRepository.getGalleryTitle()

export const getGalleryContactInfo = async (): Promise<ContactInfo> =>
  galleryRepository.getContactInfo()

export const getAllGalleryAlbums = async (): Promise<GalleryAlbums> =>
  galleryRepository.getAllAlbums()

export const getGalleryAlbumById = async (id: number): Promise<GalleryAlbum | null> =>
  galleryRepository.getAlbumById(id)

export const getGalleryAlbumBySlug = async (slug: string): Promise<GalleryAlbum | null> =>
  galleryRepository.getAlbumBySlug(slug)

export const getGallerySubAlbum = async (
  albumSlug: string,
  subAlbumSlug: string
): Promise<GallerySearchResult> => galleryRepository.getSubAlbum(albumSlug, subAlbumSlug)

export const filterGalleryAlbums = async (
  options: GalleryFilterOptions
): Promise<GalleryAlbums> => galleryRepository.filterAlbums(options)

export const getAlbumsWithSubAlbums = async (): Promise<GalleryAlbums> =>
  galleryRepository.getAlbumsWithSubAlbums()

export const getAlbumsWithDirectGalleries = async (): Promise<GalleryAlbums> =>
  galleryRepository.getAlbumsWithDirectGalleries()

export const searchGalleryAlbumsByTitle = async (term: string): Promise<GalleryAlbums> =>
  galleryRepository.searchAlbumsByTitle(term)

export const getGalleryAlbumsCount = async (): Promise<number> =>
  galleryRepository.getAlbumsCount()

export const getGallerySubAlbumsCount = async (): Promise<number> =>
  galleryRepository.getSubAlbumsCount()

// Re-exports
export type {
  GalleryData,
  GalleryAlbum,
  GalleryAlbums,
  SubAlbum,
  GalleryFilterOptions,
  GallerySearchResult,
  GalleryImage,
  ContactInfo,
} from '../model/types'

// Export repo classes for advanced usage (e.g., cache invalidation)
export { GalleryApiRepository } from './api.repository'
// export { GalleryFileRepository } from './file.repository'
