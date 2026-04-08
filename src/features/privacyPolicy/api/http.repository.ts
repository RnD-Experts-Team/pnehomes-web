// src/privacy-policy/repository/http.repository.ts

import { PrivacyPolicy, PrivacyPolicyResponse } from '../model/types'

/**
 * Where the CMS lives. Override in env if you have different environments.
 * - NEXT_PUBLIC_ so this works in both server & client (Next.js, Vite + import.meta.env, etc.)
 */
const CMS_BASE =  'https://cms.pnehomes.com'

const PRIVACY_POLICY_ENDPOINT = `${CMS_BASE}/api/privacy-policy`

/**
 * Low-level fetch helper with a sane timeout and nice error messages.
 */
async function fetchJSON<T>(url: string, init?: RequestInit, timeoutMs = 8000): Promise<T> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(init?.headers || {}),
      },
      signal: controller.signal,
      ...init,
    })

    if (!res.ok) {
      // Try to pull text for better diagnostics
      const body = await res.text().catch(() => '')
      throw new Error(`HTTP ${res.status} ${res.statusText}${body ? ` – ${body.slice(0, 200)}` : ''}`)
    }

    // If the response has no body, this will throw; that's okay—we'll surface it.
    return (await res.json()) as T
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms`)
    }
    throw err
  } finally {
    clearTimeout(id)
  }
}

/**
 * Repository class for handling privacy policy data operations via HTTP
 */
export class PrivacyPolicyHttpRepository {
  /**
   * Get privacy policy data from the CMS API
   * @returns Promise<PrivacyPolicyResponse>
   */
  static async getPrivacyPolicy(): Promise<PrivacyPolicyResponse> {
    try {
      type Raw = {
        success: boolean
        data?: PrivacyPolicy
        message?: string
      }

      const payload = await fetchJSON<Raw>(PRIVACY_POLICY_ENDPOINT)

      if (payload?.success && payload?.data) {
        // Ensure minimal shape safety (in case CMS adds/removes props)
        const data: PrivacyPolicy = {
          title: payload.data.title ?? '',
          slogan: payload.data.slogan ?? '',
          description: payload.data.description ?? '',
          cover: payload.data.cover ?? '',
          cover_type: (payload.data.cover_type as PrivacyPolicy['cover_type']) ?? null,
          contact: payload.data.contact
            ? {
                title: payload.data.contact.title ?? '',
                message: payload.data.contact.message ?? '',
              }
            : undefined,
        }

        return {
          data,
          success: true,
          message: 'Privacy policy data retrieved successfully',
        }
      }

      return {
        data: {} as PrivacyPolicy,
        success: false,
        message:
          payload?.message ||
          'CMS responded without success or missing data',
      }
    } catch (error) {
      return {
        data: {} as PrivacyPolicy,
        success: false,
        message: `Failed to retrieve privacy policy data: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      }
    }
  }

  /**
   * Get privacy policy slogan
   * @returns Promise<string>
   */
  static async getSlogan(): Promise<string> {
    try {
      const response = await this.getPrivacyPolicy()
      return response.success ? response.data.slogan : ''
    } catch (error) {
      console.error('Error getting privacy policy slogan:', error)
      return ''
    }
  }

  /**
   * Get privacy policy title
   * @returns Promise<string>
   */
  static async getTitle(): Promise<string> {
    try {
      const response = await this.getPrivacyPolicy()
      return response.success ? response.data.title : ''
    } catch (error) {
      console.error('Error getting privacy policy title:', error)
      return ''
    }
  }

  /**
   * Get privacy policy description (HTML string)
   * @returns Promise<string>
   */
  static async getDescription(): Promise<string> {
    try {
      const response = await this.getPrivacyPolicy()
      return response.success ? response.data.description : ''
    } catch (error) {
      console.error('Error getting privacy policy description:', error)
      return ''
    }
  }

  /**
   * Get contact information
   * @returns Promise<{title: string, message: string} | null>
   */
  static async getContact(): Promise<{ title: string; message: string } | null> {
    try {
      const response = await this.getPrivacyPolicy()
      return response.success && response.data.contact ? response.data.contact : null
    } catch (error) {
      console.error('Error getting privacy policy contact:', error)
      return null
    }
  }

  /**
   * Get privacy policy cover
   * @returns Promise<string>
   */
  static async getCover(): Promise<string> {
    try {
      const response = await this.getPrivacyPolicy()
      return response.success ? response.data.cover || '' : ''
    } catch (error) {
      console.error('Error getting privacy policy cover:', error)
      return ''
    }
  }
}
