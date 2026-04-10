import { Service, Services, ServiceRepository, ServicesData, type MediaType } from '../model/types'
import servicesData from '../mock/services.json'

/**
 * File-based repository implementation for services data
 */
export class FileServiceRepository implements ServiceRepository {
  private servicesData: ServicesData

  constructor() {
    this.servicesData = servicesData as ServicesData
  }

  /**
   * Get all services
   */
  async getAll(): Promise<Services> {
    return Promise.resolve(this.servicesData.services)
  }

  /**
   * Get service by ID
   */
  async getById(id: number): Promise<Service | null> {
    const service = this.servicesData.services.find(service => service.id === id)
    return Promise.resolve(service || null)
  }

  /**
   * Get service by slug
   */
  async getBySlug(slug: string): Promise<Service | null> {
    const service = this.servicesData.services.find(service => service.slug === slug)
    return Promise.resolve(service || null)
  }

  /**
   * Get cover image
   */
  async getCover(): Promise<string> {
    return Promise.resolve(this.servicesData.cover)
  }

  async getCoverType(): Promise<MediaType> {
    return Promise.resolve(this.servicesData.cover_type)
  }

  /**
   * Search services by title (case-insensitive)
   */
  async searchByTitle(query: string): Promise<Services> {
    const filteredServices = this.servicesData.services.filter(service =>
      service.title.toLowerCase().includes(query.toLowerCase())
    )
    return Promise.resolve(filteredServices)
  }

  /**
   * Get services with pagination
   */
  async getPaginated(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    services: Services
    total: number
    page: number
    totalPages: number
  }> {
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedServices = this.servicesData.services.slice(startIndex, endIndex)

    return Promise.resolve({
      services: paginatedServices,
      total: this.servicesData.services.length,
      page,
      totalPages: Math.ceil(this.servicesData.services.length / limit),
    })
  }

  /**
   * Check if service exists by slug
   */
  async existsBySlug(slug: string): Promise<boolean> {
    const exists = this.servicesData.services.some(service => service.slug === slug)
    return Promise.resolve(exists)
  }
}

// Export singleton instance
export const serviceRepository = new FileServiceRepository()
