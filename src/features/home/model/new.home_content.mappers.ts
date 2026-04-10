import {
  ApiHomeData,
  ApiHeroSection,
  ApiGridSection as ApiGrid,
  ApiServices as ApiServicesDto,
} from './new.home_content.api.types'
import {
  HomeContent,
  FirstSection,
  Hero,
  Services,
  GridSection,
  LinkItem,
  Testimonial,
} from '../model/home_content.types'
import { normalizeDriveImageUrl, normalizeDriveCoverImage, normalizeDriveVideoUrl } from './url.utils'


const mapFirstSection = (src: ApiHomeData['first_section']): FirstSection => ({
  video: '/vid/first.mp4', // Use local video file instead of API value
  'cover-for-mobile': normalizeDriveCoverImage(src.mobile_cover),
  'cover-for-mobile-type': (src.mobile_cover_type as FirstSection['cover-for-mobile-type']) ?? null,
  logo: normalizeDriveImageUrl(src.logo),
  logo_type: (src.logo_type as FirstSection['logo_type']) ?? null,
  title: src.title,
  subtitle: src.subtitle ?? null,
  'book-button': src.book_button_text ?? null,
})


const mapServices = (src: ApiServicesDto): Services => ({
  title: src.title,
  cover: normalizeDriveCoverImage(src.cover),
  cover_type: (src.cover_type as Services['cover_type']) ?? null,
  description: src.description ?? null,
  links: src.links.map(l => ({ title: l.title, slug: l.slug })),
})


const mapGrid = (src: ApiGrid): GridSection => ({
  video: src.video ?? '/vid/second.mp4', // Use local video file as fallback if API value is null/undefined
  video_type: (src.video_type as GridSection['video_type']) ?? null,
  logo: normalizeDriveVideoUrl(src.logo),
  logo_type: (src.logo_type as GridSection['logo_type']) ?? null,
  links: src.links.map(l => ({ title: l.title, cover: normalizeDriveCoverImage(l.cover), cover_type: (l.cover_type as LinkItem['cover_type']) ?? null })),
})


const mapHero = (src: ApiHomeData['hero'], sections: ApiHeroSection[]): Hero => ({
  title: src.title,
  subtitle: src.subtitle ?? null,
  sections: sections.map(s => ({
    icon: s.icon,
    title: s.title,
    description: s.description ?? null,
  })),
})


const mapTestimonials = (src: ApiHomeData['testimonials']): Testimonial[] =>
  src.map(t => ({ description: t.description, by: t.by }))


export const mapApiToHomeContent = (data: ApiHomeData): HomeContent => ({
  'first-section': mapFirstSection(data.first_section),
  hero: mapHero(data.hero, data.hero_sections),
  services: mapServices(data.services),
  'grid-section': mapGrid(data.grid_section),
  testimonials: mapTestimonials(data.testimonials),
  contact: data.contact?.title ?? 'Contact Us',
})
