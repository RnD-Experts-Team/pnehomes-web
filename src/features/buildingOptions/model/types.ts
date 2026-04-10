export type MediaType = 'image' | 'video' | null

export interface BuildingOption {
  id: number
  title: string
  description?: string | null
  section_img: string
  section_img_type: MediaType
}

export interface Article {
  id: number
  slug: string
  title: string
  description?: string | null
  img: string
  img_type: MediaType
  content: string
}

export interface ArticlesSection {
  cover?: string | null
  cover_type: MediaType
  articles: Article[]
}

export interface BuildingOptionsData {
  cover: string
  cover_type: MediaType
  slogan: string
  title: string
  options: BuildingOption[]
  articles: ArticlesSection
}
