import { Community, CommunitiesPageData } from '../model/types'
import communitiesData from '../mock/communities.json'

export class FileRepository {
  private communities: Community[] = communitiesData.communities as unknown as Community[]

  /**
   * Get all communities
   */
  async getAllCommunities(): Promise<Community[]> {
    return Promise.resolve(this.communities)
  }

  /**
   * Get community by slug
   */
  async getCommunityBySlug(slug: string): Promise<Community | null> {
    const community = this.communities.find(c => c.slug === slug)
    return Promise.resolve(community || null)
  }

  /**
   * Get community by ID
   */
  async getCommunityById(id: number): Promise<Community | null> {
    const community = this.communities.find(c => c.id === id)
    return Promise.resolve(community || null)
  }

  /**
   * Get communities by city
   */
  async getCommunitiesByCity(city: string): Promise<Community[]> {
    const filteredCommunities = this.communities.filter(c =>
      c.city.toLowerCase().includes(city.toLowerCase())
    )
    return Promise.resolve(filteredCommunities)
  }

  /**
   * Search communities by name
   */
  async searchCommunitiesByName(name: string): Promise<Community[]> {
    const filteredCommunities = this.communities.filter(c =>
      c.title.toLowerCase().includes(name.toLowerCase())
    )
    return Promise.resolve(filteredCommunities)
  }

  /**
   * Get all unique cities
   */
  async getAllCities(): Promise<string[]> {
    const cities = [...new Set(this.communities.map(c => c.city))]
    return Promise.resolve(cities)
  }

  /**
   * Get Zillow URL
   */
  async getZillowUrl(): Promise<string> {
    return Promise.resolve(communitiesData.zillow)
  }

  /**
   * Get contact message template
   */
  async getContactMessage(): Promise<string> {
    return Promise.resolve(communitiesData.contact.message)
  }

  /**
   * Get cover image
   */
  async getCoverImage(): Promise<string> {
    // Use communities.jpg as fallback since cover.jpg doesn't exist
    return Promise.resolve(communitiesData.cover || '/img/communities.jpg')
  }

  /**
   * Get communities page data (title, cover, zillow link, contact)
   */
  async getCommunitiesPageData(): Promise<CommunitiesPageData> {
    return Promise.resolve({
      title: communitiesData.title,
      cover: communitiesData.cover || '/img/communities.jpg',
      cover_type: null,
      zillowLink: communitiesData.zillow,
      contact: {
        title: communitiesData.contact?.title,
        message: communitiesData.contact?.message
      }
    })
  }
}
