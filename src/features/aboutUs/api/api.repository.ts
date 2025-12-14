import { AboutUsData, AboutUsResponse, ContactInfo } from '../model/types'

const API_URL = 'https://cms.pnehomes.com/api/about-us'

/**
 * Repository class for handling aboutUs data operations from API
 * Fix option A: disable caching so CMS updates show immediately.
 */
export class AboutUsApiRepository {
  /**
   * Get aboutUs data from the live API (NO CACHE)
   * @returns Promise<AboutUsResponse> - The aboutUs data wrapped in a response object
   */
  static async getAboutUsData(): Promise<AboutUsResponse> {
    try {
      const response = await fetch(API_URL, {
        cache: 'no-store', // ✅ always fetch fresh data
        // Optional: ensure no CDN/proxy cache issues if they respect request headers
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      })

      const result = await response.json()

      // Normalize the data so frontend structure stays consistent
      const data: AboutUsData = {
        cover: result?.data?.cover ?? '',
        slogan: result?.data?.slogan ?? '',
        title: result?.data?.title ?? '',
        description: result?.data?.content ?? '', // map `content` -> `description`
        contact: result?.data?.contact, // keep if API returns it
      }

      return {
        data,
        success: Boolean(result?.success),
        message: 'AboutUs data retrieved successfully',
      }
    } catch (error) {
      console.error('Error fetching AboutUs data:', error)
      return {
        data: {} as AboutUsData,
        success: false,
        message: `Failed to retrieve aboutUs data: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      }
    }
  }

  /**
   * Get contact information from API (if needed, may return null)
   */
  static async getContactInfo(): Promise<ContactInfo | null> {
    try {
      const response = await this.getAboutUsData()
      if (response.success && response.data.contact) {
        return response.data.contact
      }
      return null
    } catch (error) {
      console.error('Error retrieving contact info:', error)
      return null
    }
  }

  static async getTitle(): Promise<string | null> {
    try {
      const response = await this.getAboutUsData()
      return response.data.title || null
    } catch (error) {
      console.error('Error retrieving title:', error)
      return null
    }
  }

  static async getSlogan(): Promise<string | null> {
    try {
      const response = await this.getAboutUsData()
      return response.data.slogan || null
    } catch (error) {
      console.error('Error retrieving slogan:', error)
      return null
    }
  }

  static async getDescription(): Promise<string | null> {
    try {
      const response = await this.getAboutUsData()
      return response.data.description || response.data.content || null
    } catch (error) {
      console.error('Error retrieving description:', error)
      return null
    }
  }

  static async getCover(): Promise<string | null> {
    try {
      const response = await this.getAboutUsData()
      return response.data.cover || null
    } catch (error) {
      console.error('Error retrieving cover:', error)
      return null
    }
  }
}
