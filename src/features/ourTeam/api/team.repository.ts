// src/repository/team.repository.ts

import { getJson } from './http'
import type {
  Contact,
  OurTeamData,
  OurTeamApiData,
  OurTeamApiEnvelope,
  TeamMember,
} from '../model/types'

// You can override this via env if you prefer.
// Example (Vite): import.meta.env.VITE_CMS_BASE_URL
// Example (Next.js): process.env.NEXT_PUBLIC_CMS_BASE_URL
const CMS_BASE_URL = 'https://cms.pnehomes.com/api'

const TEAM_ENDPOINT = `${CMS_BASE_URL.replace(/\/$/, '')}/team`

/**
 * Transform raw API data into the stable OurTeamData shape used by the app.
 * Keeping this here isolates the rest of the app from server shape changes.
 */
function toOurTeamData(api: OurTeamApiData): OurTeamData {
  // Defensive defaults in case any fields are missing
  const team: TeamMember[] = Array.isArray(api.team)
    ? api.team.map(m => ({
        id: m.id,
        cover: m.cover ?? '',
        cover_type: (m.cover_type as TeamMember['cover_type']) ?? null,
        name: m.name ?? '',
        position: m.position ?? '',
        description: m.description ?? '',
      }))
    : []

  const contact: Contact | undefined = api.contact
    ? {
        title: api.contact.title ?? '',
        message: api.contact.message ?? '',
      }
    : undefined

  return {
    cover: api.cover ?? '',
    cover_type: (api.cover_type as OurTeamData['cover_type']) ?? null,
    slogan: api.slogan ?? '',
    title: api.title ?? '',
    subtitle: api.subtitle,
    description: api.description,
    team,
    contact,
  }
}

/**
 * Repository class for handling ourTeam data operations (API-backed)
 */
export class OurTeamRepository {
  /**
   * Get all ourTeam data
   * @returns Promise<OurTeamData> - The complete ourTeam data
   */
  static async getOurTeamData(): Promise<OurTeamData> {
    const envelope = await getJson<OurTeamApiEnvelope>(TEAM_ENDPOINT)
    if (!envelope?.success || !envelope?.data) {
      throw new Error('Failed to load team data')
    }
    return toOurTeamData(envelope.data)
  }

  /**
   * Get team members only
   * @returns Promise<TeamMember[]> - Array of team members
   */
  static async getTeamMembers(): Promise<TeamMember[]> {
    const data = await this.getOurTeamData()
    return data.team
  }

  /**
   * Get a specific team member by name
   * @param name - The name of the team member
   * @returns Promise<TeamMember | undefined> - The team member or undefined if not found
   */
  static async getTeamMemberByName(name: string): Promise<TeamMember | undefined> {
    const data = await this.getOurTeamData()
    const lower = name.trim().toLowerCase()
    return data.team.find(member => member.name.toLowerCase() === lower)
  }

  /**
   * Get team member by position
   * @param position - The position to search for
   * @returns Promise<TeamMember | undefined> - The team member or undefined if not found
   */
  static async getTeamMemberByPosition(position: string): Promise<TeamMember | undefined> {
    const data = await this.getOurTeamData()
    const needle = position.trim().toLowerCase()
    return data.team.find(member => member.position.toLowerCase().includes(needle))
  }

  /**
   * Get contact information
   * @returns Promise<Contact | undefined> - The contact information or undefined if not available
   */
  static async getContactInfo(): Promise<Contact | undefined> {
    const data = await this.getOurTeamData()
    return data.contact
  }

  /**
   * Get page header information (slogan, title, description, cover, subtitle)
   * @returns Promise<Omit<OurTeamData, 'team' | 'contact'>> - Header information
   */
  static async getHeaderInfo(): Promise<Omit<OurTeamData, 'team' | 'contact'>> {
    const data = await this.getOurTeamData()
    return {
      cover: data.cover,
      cover_type: data.cover_type,
      slogan: data.slogan,
      title: data.title,
      description: data.description,
      subtitle: data.subtitle,
    }
  }

  /**
   * Get cover image
   * @returns Promise<string> - The cover image URL
   */
  static async getCover(): Promise<string> {
    const data = await this.getOurTeamData()
    return data.cover
  }
}
