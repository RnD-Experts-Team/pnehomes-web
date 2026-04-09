import { serviceRepository } from './http.repository'
import {
  Services,
  ServiceApiResponse,
  SingleServiceApiResponse,
  CoverApiResponse,
  type MediaType,
} from '../model/types'

/**
 * Services API - Main entry point for services data operations
 * (Public surface kept the same as your mock-backed version)
 */
export class ServicesAPI {
  /**
   * Get all services
   */
  static async getAllServices(): Promise<ServiceApiResponse> {
    try {
      const services = await serviceRepository.getAll()
      return {
        data: services,
        success: true,
        message: 'Services retrieved successfully',
      }
    } catch (error) {
      return {
        data: [],
        success: false,
        message: `Failed to retrieve services: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      }
    }
  }

  /**
   * Get service by ID
   */
  static async getServiceById(id: number): Promise<SingleServiceApiResponse> {
    try {
      const service = await serviceRepository.getById(id)
      return {
        data: service,
        success: true,
        message: service ? 'Service retrieved successfully' : 'Service not found',
      }
    } catch (error) {
      return {
        data: null,
        success: false,
        message: `Failed to retrieve service: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      }
    }
  }

  /**
   * Get service by slug
   */
  static async getServiceBySlug(slug: string): Promise<SingleServiceApiResponse> {
    try {
      const service = await serviceRepository.getBySlug(slug)
      return {
        data: service,
        success: true,
        message: service ? 'Service retrieved successfully' : 'Service not found',
      }
    } catch (error) {
      return {
        data: null,
        success: false,
        message: `Failed to retrieve service: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      }
    }
  }

  /**
   * Search services by title
   */
  static async searchServices(query: string): Promise<ServiceApiResponse> {
    try {
      const services = await serviceRepository.searchByTitle(query)
      return {
        data: services,
        success: true,
        message: `Found ${services.length} service(s) matching "${query}"`,
      }
    } catch (error) {
      return {
        data: [],
        success: false,
        message: `Failed to search services: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      }
    }
  }

  /**
   * Get paginated services
   */
  static async getPaginatedServices(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    data: Services
    success: boolean
    message?: string
    pagination: {
      total: number
      page: number
      totalPages: number
      limit: number
    }
  }> {
    try {
      const result = await serviceRepository.getPaginated(page, limit)
      return {
        data: result.services,
        success: true,
        message: 'Services retrieved successfully',
        pagination: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
          limit,
        },
      }
    } catch (error) {
      return {
        data: [],
        success: false,
        message: `Failed to retrieve paginated services: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        pagination: {
          total: 0,
          page: 1,
          totalPages: 0,
          limit,
        },
      }
    }
  }

  /**
   * Check if service exists by slug
   */
  static async serviceExists(slug: string): Promise<{
    exists: boolean
    success: boolean
    message?: string
  }> {
    try {
      const exists = await serviceRepository.existsBySlug(slug)
      return {
        exists,
        success: true,
        message: exists ? 'Service exists' : 'Service does not exist',
      }
    } catch (error) {
      return {
        exists: false,
        success: false,
        message: `Failed to check service existence: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      }
    }
  }

  /**
   * Get cover image
   */
  static async getCover(): Promise<CoverApiResponse> {
    try {
      const cover = await serviceRepository.getCover()
      return {
        data: cover,
        success: true,
        message: 'Cover image retrieved successfully',
      }
    } catch (error) {
      return {
        data: '',
        success: false,
        message: `Failed to retrieve cover image: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      }
    }
  }

  static async getCoverType(): Promise<MediaType> {
    try {
      return await serviceRepository.getCoverType()
    } catch {
      return null
    }
  }
}

// Export convenience functions
export const {
  getAllServices,
  getServiceById,
  getServiceBySlug,
  searchServices,
  getPaginatedServices,
  serviceExists,
  getCover,
  getCoverType,
} = ServicesAPI

// Export repository for direct access if needed
export { serviceRepository } from './http.repository'

// Re-export types for convenience
export type {
  Service,
  Services,
  ServiceContentItem,
  ServiceContact,
  ServiceRepository,
  ServiceApiResponse,
  SingleServiceApiResponse,
  CoverApiResponse,
} from '../model/types'
