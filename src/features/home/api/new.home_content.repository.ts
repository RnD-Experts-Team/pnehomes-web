import { HomeContent } from '../model/home_content.types'
import { ApiHomeResponse } from '../model/new.home_content.api.types'
import { mapApiToHomeContent } from '../model/new.home_content.mappers'
import { cmsUrl } from '@/lib/cms'

/**
 * Server-friendly repository that pulls from the CMS.
 * You can tune revalidation per your needs.
 */
export class HomeContentRepository {
  private static instance: HomeContentRepository
  private constructor() {}

  static getInstance(): HomeContentRepository {
    if (!HomeContentRepository.instance) {
      HomeContentRepository.instance = new HomeContentRepository()
    }
    return HomeContentRepository.instance
  }

  private endpoint = cmsUrl('/api/home')

  /**
   * Fetch & map the complete home content.
   * - Uses Next.js fetch cache by default; tweak `next`/`cache` as needed.
   */
  public async getHomeContent(): Promise<HomeContent> {
    const res = await fetch(this.endpoint, {
      // Option A: ISR-ish (e.g. revalidate every 5 mins)
      next: { revalidate: 300 },

      // Option B: always fresh (uncomment instead of `next`):
      // cache: 'no-store',
    })

    if (!res.ok) throw new Error(`Failed to load home content: ${res.status}`)

    const json = (await res.json()) as ApiHomeResponse
    if (!json.success || !json.data) {
      throw new Error('Malformed CMS response')
    }

    return mapApiToHomeContent(json.data)
  }

  // Convenience getters that work off of getHomeContent()
  public async getFirstSection() {
    const c = await this.getHomeContent()
    return c['first-section']
  }

  public async getHero() {
    const c = await this.getHomeContent()
    return c.hero
  }

  public async getServices() {
    const c = await this.getHomeContent()
    return c.services
  }

  public async getGridSection() {
    const c = await this.getHomeContent()
    return c['grid-section']
  }

  public async getTestimonials() {
    const c = await this.getHomeContent()
    return c.testimonials
  }

  public async getContact() {
    const c = await this.getHomeContent()
    return c.contact
  }

  public async getMainVideo() {
    const c = await this.getHomeContent()
    return c['first-section'].video
  }

  public async getLogo() {
    const c = await this.getHomeContent()
    return c['first-section'].logo
  }

  public async getMainTitle() {
    const c = await this.getHomeContent()
    return {
      title: c['first-section'].title,
      subtitle: c['first-section'].subtitle,
    }
  }

  public async getBookButton() {
    const c = await this.getHomeContent()
    return c['first-section']['book-button']
  }

  public async hasBookButton() {
    const t = await this.getBookButton()
    return t !== null && t !== ''
  }

  public async hasFirstSectionSubtitle() {
    const { subtitle } = await this.getMainTitle()
    return subtitle !== null && subtitle !== ''
  }

  public async hasHeroSubtitle() {
    const { hero } = await this.getHomeContent()
    return hero.subtitle !== null && hero.subtitle !== ''
  }

  public async hasServicesDescription() {
    const { services } = await this.getHomeContent()
    return services.description !== null && services.description !== ''
  }

  public async getCoverForMobile() {
    const c = await this.getHomeContent()
    return c['first-section']['cover-for-mobile']
  }

  public async getServicesCover() {
    const c = await this.getHomeContent()
    return c.services.cover
  }

  // Kept for API parity (no-op merge in-memory). In a real app you'd POST/PATCH to CMS.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public updateHomeContent(_updates: Partial<HomeContent>): void {
    // intentionally left blank - no-op for CMS-based repository
  }
}
