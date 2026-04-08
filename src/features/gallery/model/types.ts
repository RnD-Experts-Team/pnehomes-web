export type MediaType = 'image' | 'video' | null

/**
 * Gallery Image Interface
 * Represents a single image with virtual and real versions
 */
export interface GalleryImage {
  virtual_img: string
  virtual_img_type: MediaType
  real_img: string
  real_img_type: MediaType
}

/**
 * Sub Album Interface
 * Represents a sub-album within a main gallery album
 */
export interface SubAlbum {
  slug: string
  title: string
  cover_img: string
  cover_img_type: MediaType
  gallery: GalleryImage[]
}

/**
 * Gallery Album Interface
 * Represents a main gallery album that can contain either sub-albums or direct gallery images
 */
export interface GalleryAlbum {
  id: number
  slug: string
  title: string
  cover_img: string
  cover_img_type: MediaType
  sub_albums?: SubAlbum[]
  gallery?: GalleryImage[]
}

/**
 * Contact Information Interface
 * Represents contact information for gallery inquiries
 */
export interface ContactInfo {
  title: string
  message: string
}

/**
 * Gallery Data Interface
 * Represents the complete gallery data structure with title, cover and albums
 */
export interface GalleryData {
  title: string
  cover: string
  cover_type: MediaType
  gallery: GalleryAlbum[]
  contact: ContactInfo
}

/**
 * Gallery Albums Type
 * Array of gallery albums (for backward compatibility)
 */
export type GalleryAlbums = GalleryAlbum[]

/**
 * Gallery Filter Options
 * Options for filtering gallery data
 */
export interface GalleryFilterOptions {
  slug?: string
  id?: number
  hasSubAlbums?: boolean
}

/**
 * Gallery Search Result
 * Result type for gallery search operations
 */
export interface GallerySearchResult {
  album?: GalleryAlbum
  subAlbum?: SubAlbum
  found: boolean
}
