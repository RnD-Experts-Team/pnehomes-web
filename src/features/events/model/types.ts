export type MediaType = 'image' | 'video' | null

export interface GalleryItem {
  url: string
  type: MediaType
}

/**
 * Event interface representing a single event
 * (updated to support 'id' and optional per-event 'cover' from the API)
 */
export interface Event {
  id?: number
  title: string
  description: string
  gallery: GalleryItem[]
  cover?: string
}

/**
 * Contact interface for contact information
 */
export interface Contact {
  title: string
  message: string
}

/**
 * Main events data structure interface
 */
export interface EventsData {
  cover: string
  cover_type: MediaType
  title: string
  slogan: string
  events: Event[]
  contact?: Contact
}

/**
 * API response wrapper for events data
 */
export interface EventsResponse {
  success: boolean
  data?: EventsData
  error?: string
}

/**
 * Raw API wire types (as returned by https://cms.pnehomes.com/api/events)
 * We keep these separate from the app's internal types so we can map/validate.
 */
export interface RawEvent {
  id?: number
  title: string
  description: string
  cover?: string
  gallery: GalleryItem[]
}

export interface RawEventsData {
  cover: string
  cover_type?: string | null
  slogan: string
  title: string
  events: RawEvent[]
  contact?: Contact
}

export interface RawEventsResponse {
  success: boolean
  data?: RawEventsData
  error?: string
}
