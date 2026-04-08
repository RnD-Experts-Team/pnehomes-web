export type MediaType = 'image' | 'video' | null

/**
 * Contact information interface for aboutUs section
 */
export interface ContactInfo {
  title: string
  message: string
}

/**
 * Main aboutUs data interface
 */
export interface AboutUsData {
  cover: string
  cover_type: MediaType
  slogan: string
  title: string
  /** Description text that may contain HTML tags for formatting */
  description?: string
  /** Some APIs may return content instead of description */
  content?: string
  contact?: ContactInfo
}

/**
 * API response wrapper for aboutUs data
 */
export interface AboutUsResponse {
  data: AboutUsData
  success: boolean
  message?: string
}
