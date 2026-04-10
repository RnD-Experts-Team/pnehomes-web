export type MediaType = 'image' | 'video' | null

export interface HeroSection {
  icon: string
  title: string
  description: string | null
}

export interface Hero {
  title: string
  subtitle: string | null
  sections: HeroSection[]
}

export interface ServiceLink {
  title: string
  slug: string
}

export interface Services {
  title: string
  cover: string
  cover_type: MediaType
  description: string | null
  links: ServiceLink[]
}

export interface LinkItem {
  title: string
  cover: string
  cover_type: MediaType
}

export interface GridSection {
  video: string
  video_type: MediaType
  logo: string
  logo_type: MediaType
  links: LinkItem[]
}

export interface FirstSection {
  video: string
  'cover-for-mobile': string
  'cover-for-mobile-type': MediaType
  logo: string
  logo_type: MediaType
  title: string
  subtitle: string | null
  'book-button': string | null
}

export interface Testimonial {
  description: string
  by: string
}

export interface HomeContent {
  'first-section': FirstSection
  hero: Hero
  services: Services
  'grid-section': GridSection
  testimonials: Testimonial[]
  contact: string
}
