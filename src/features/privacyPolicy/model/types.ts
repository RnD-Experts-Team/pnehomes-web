// src/privacy-policy/model/types.ts

export type MediaType = 'image' | 'video' | null

export interface Contact {
  title: string
  message: string
}

export interface PrivacyPolicy {
  slogan: string
  title: string
  /**
   * CMS returns HTML in this field (string of HTML, e.g. "<p>...</p>")
   */
  description: string
  cover?: string
  cover_type: MediaType
  contact?: Contact
}

export interface PrivacyPolicyResponse {
  data: PrivacyPolicy
  success: boolean
  message?: string
}
