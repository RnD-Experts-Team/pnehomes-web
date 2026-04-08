export type MediaType = 'image' | 'video' | null

/**
 * Content item interface for service sections
 */
export interface ServiceContentItem {
  img: string
  img_type: MediaType
  sub_title: string
  description: string
}

/**
 * Contact information interface for services
 */
export interface ServiceContact {
  title: string
  message: string
}

/**
 * Main service interface
 */
export interface Service {
  id: number
  slug: string
  title: string
  sub_title?: string
  description?: string
  content: ServiceContentItem[]
  contact: ServiceContact
}

/**
 * Array of services type
 */
export type Services = Service[]

/**
 * Main services data structure with cover and services array
 */
export interface ServicesData {
  cover: string
  cover_type: MediaType
  services: Services
}

/**
 * Service repository interface for data operations
 */
export interface ServiceRepository {
  getAll(): Promise<Services>
  getById(id: number): Promise<Service | null>
  getBySlug(slug: string): Promise<Service | null>
  getCover(): Promise<string>
  searchByTitle(query: string): Promise<Services>
  getPaginated(
    page?: number,
    limit?: number
  ): Promise<{ services: Services; total: number; page: number; totalPages: number }>
  existsBySlug(slug: string): Promise<boolean>
}

/**
 * Service API response types (kept stable for the rest of your app)
 */
export interface ServiceApiResponse {
  data: Services
  success: boolean
  message?: string
}

export interface SingleServiceApiResponse {
  data: Service | null
  success: boolean
  message?: string
}

export interface CoverApiResponse {
  data: string
  success: boolean
  message?: string
}

/**
 * Remote CMS envelope — the new CMS returns:
 * { success: boolean, data: ServicesData }
 */
export interface RemoteServicesEnvelope {
  success: boolean
  data: ServicesData
}
