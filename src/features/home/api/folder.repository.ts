// src/repository/folder.repository.ts

import type {
  HomeLayout,
  CmsLayoutResponse,
  CmsLayoutData,
  SocialMediaIcon,
  SocialMediaItem,
} from '../model/types'

import { cmsUrl } from '@/lib/cms'

/**
 * Config:
 * Tiny in-memory cache with TTL to avoid hammering the CMS.
 */

const CMS_LAYOUT_URL = cmsUrl('/api/layout')

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

type HeaderConfig = {
  logo: string
  navigation: string[]
  button: string | null
  phone: number | null
}

type FooterConfig = {
  navigation: string[]
  phone: number | null
  social: SocialMediaItem[]
}

export class HomeLayoutRepository {
  private static instance: HomeLayoutRepository

  // cache
  private homeLayout: HomeLayout | null = null
  private lastFetched = 0

  private constructor() {}

  public static getInstance(): HomeLayoutRepository {
    if (!HomeLayoutRepository.instance) {
      HomeLayoutRepository.instance = new HomeLayoutRepository()
    }
    return HomeLayoutRepository.instance
  }

  /**
   * Public: ensure data is loaded (cached) and return HomeLayout
   */
  public async getHomeLayout(forceRefresh = false): Promise<HomeLayout> {
    const now = Date.now()
    const cacheExpired = now - this.lastFetched > CACHE_TTL_MS

    if (!this.homeLayout || cacheExpired || forceRefresh) {
      const cmsData = await this.fetchCmsLayout()
      this.homeLayout = this.mapCmsToHomeLayout(cmsData)
      this.lastFetched = Date.now()
    }

    return this.homeLayout!
  }

  /**
   * Public helpers that mirror your previous repo API, now async.
   */
  public async getHeaderConfig(): Promise<HeaderConfig> {
    const layout = await this.getHomeLayout()
    return {
      logo: layout['header-logo'],
      navigation: layout['header-nav'],
      button: layout['header-button'],
      phone: layout['header-phone'],
    }
  }

  public async getFooterConfig(): Promise<FooterConfig> {
    const layout = await this.getHomeLayout()
    return {
      navigation: layout['footer-nav'],
      phone: layout['footer-phone'],
      social: layout['footer-social'],
    }
  }

  public async getHeaderNavigation(): Promise<string[]> {
    const layout = await this.getHomeLayout()
    return layout['header-nav']
  }

  public async getFooterNavigation(): Promise<string[]> {
    const layout = await this.getHomeLayout()
    return layout['footer-nav']
  }

  public async getSocialMediaLinks(): Promise<SocialMediaItem[]> {
    const layout = await this.getHomeLayout()
    return layout['footer-social']
  }

  public async getContactPhone(): Promise<number | null> {
    const layout = await this.getHomeLayout()
    return layout['header-phone']
  }

  /**
   * Optional: manual override/merge after load (kept for parity).
   */
  public async updateHomeLayout(newLayout: Partial<HomeLayout>): Promise<void> {
    const current = await this.getHomeLayout()
    this.homeLayout = { ...current, ...newLayout }
    this.lastFetched = Date.now()
  }

  // ===== internals =====

  private async fetchCmsLayout(): Promise<CmsLayoutData> {
    const res = await fetch(CMS_LAYOUT_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    })

    if (!res.ok) {
      // If the CMS fails, try to keep the app alive with a minimal default.
      throw new Error(`Failed to fetch CMS layout: ${res.status} ${res.statusText}`)
    }

    const json = (await res.json()) as CmsLayoutResponse
    if (!json?.success || !json?.data) {
      throw new Error('CMS layout returned an unexpected shape')
    }

    return json.data
  }

  private mapCmsToHomeLayout(data: CmsLayoutData): HomeLayout {
    // header
    const headerLogo = data?.navigation?.logo ?? ''
    const headerNav = Array.isArray(data?.navigation?.links)
      ? data.navigation.links.map(l => l?.title).filter(Boolean)
      : []

    // header contact info (phone and button from navigation.contact)
    const headerPhone = this.toPhoneNumberOrNull(data?.navigation?.contact?.phone)
    const headerButton = data?.navigation?.contact?.button || null

    // contact/phone for footer (from separate contact object)
    const footerPhoneNum = this.toPhoneNumberOrNull(data?.contact?.phone)

    // footer nav
    const footerNav = Array.isArray(data?.footer?.links)
      ? data.footer.links.map(l => l?.title).filter(Boolean)
      : []

    // socials
    const footerSocial = Array.isArray(data?.social)
      ? data.social
          .map(s => this.mapPlatformToSocialItem(s.platform, s.url))
          .filter((x): x is { icon: SocialMediaIcon; url: string } => Boolean(x))
      : []

    const result: HomeLayout = {
      'header-logo': headerLogo,
      'header-nav': headerNav,
      'header-button': headerButton,
      'header-phone': headerPhone,
      'footer-nav': footerNav,
      'footer-phone': footerPhoneNum,
      'footer-social': footerSocial,
    }

    return result
  }

  private toPhoneNumberOrNull(phone?: string | null): number | null {
    if (!phone) return null
    // keep digits only
    const digits = String(phone).replace(/\D+/g, '')
    if (!digits) return null
    const n = Number(digits)
    return Number.isFinite(n) ? n : null
  }

  private mapPlatformToSocialItem(
    platformRaw: string,
    url: string
  ): { icon: SocialMediaIcon; url: string } | null {
    if (!url) return null
    const p = (platformRaw || '').toLowerCase()

    // Map CMS "platform" to our strict union type
    const map: Record<string, SocialMediaIcon> = {
      facebook: 'facebook',
      instagram: 'instagram',
      youtube: 'youtube',
      // Future-proofing (if CMS adds these later)
      x: 'x',
      twitter: 'x',
      linkedin: 'linkedIn',
      tiktok: 'tiktok',
      pinterest: 'pinterest',
      zillow: 'zillow',
      other: 'other',
    }

    const icon = map[p]
    if (!icon) {
      // Unknown platforms are ignored to keep the UI clean and typed.
      return null
    }
    return { icon, url }
  }
}
