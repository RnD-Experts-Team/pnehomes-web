import { ProjectsApiRepository } from './projects.repository'
import type {
  GalleryData,
  GalleryAlbum,
  GallerySearchResult,
  ContactInfo,
  MediaType,
} from '@/features/gallery/model/types'

const projectsRepository = new ProjectsApiRepository()

export const getProjectsData = async (): Promise<GalleryData> =>
  projectsRepository.getProjectsData()

export const getProjectsTitle = async (): Promise<string> =>
  projectsRepository.getTitle()

export const getProjectsCoverData = async (): Promise<{ cover: string; cover_type: MediaType }> => {
  const data = await projectsRepository.getProjectsData()
  return { cover: data.cover, cover_type: data.cover_type }
}

export const getProjectsContactInfo = async (): Promise<ContactInfo> =>
  projectsRepository.getContactInfo()

export const getAllProjects = async (): Promise<GalleryAlbum[]> =>
  projectsRepository.getAllProjects()

export const getProjectBySlug = async (slug: string): Promise<GalleryAlbum | null> =>
  projectsRepository.getProjectBySlug(slug)

export const getProjectRoom = async (
  projectSlug: string,
  roomSlug: string
): Promise<GallerySearchResult> => projectsRepository.getRoom(projectSlug, roomSlug)

// Re-export the shared gallery types for convenience.
export type {
  GalleryData,
  GalleryAlbum,
  GalleryAlbums,
  SubAlbum,
  GalleryImage,
  GallerySearchResult,
  ContactInfo,
  MediaType,
} from '@/features/gallery/model/types'

export { ProjectsApiRepository } from './projects.repository'
