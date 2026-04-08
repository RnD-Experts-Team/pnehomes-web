// src/model/types.ts

export interface SocialMediaItem {
  icon: SocialMediaIcon
  url: string
}

export interface HomeLayout {
  'header-logo': string
  'header-nav': string[]
  'header-button': string | null
  'header-phone': number | null
  'footer-nav': string[]
  'footer-phone': number | null
  'footer-social': SocialMediaItem[]
}

export type SocialMediaIcon =
  | 'facebook'
  | 'youtube'
  | 'x'
  | 'linkedIn'
  | 'instagram'
  | 'tiktok'
  | 'pinterest'
  | 'zillow'
  | 'other'

/**
 * ===== CMS types (API response) =====
 * We keep these separate from the app's internal HomeLayout type.
 */

export interface CmsLayoutLink {
  title: string
  slug: string
}

export interface CmsNavigationContact {
  id: number
  phone: string
  button: string
  created_at: string
  updated_at: string
}

export interface CmsNavigation {
  logo: string
  logo_type?: string | null
  links: CmsLayoutLink[]
  contact: CmsNavigationContact
}

export interface CmsFooter {
  links: CmsLayoutLink[]
}

export interface CmsContact {
  phone: string | null
  email: string | null
  address: string | null
}

export interface CmsSocialItem {
  platform: string
  url: string
}

export interface CmsLayoutData {
  navigation: CmsNavigation
  footer: CmsFooter
  contact: CmsContact
  social: CmsSocialItem[]
}

export interface CmsLayoutResponse {
  success: boolean
  data: CmsLayoutData
}
