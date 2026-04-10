// src/app/services/[slug]/page.tsx

import { notFound } from 'next/navigation'
import { getServiceBySlug, getCover, getCoverType } from '@/features/services/api'
import ServicePageClient from './service-page-client'

interface ServicePageProps {
  params: {
    slug: string
  }
}

export default async function ServicePage({ params }: ServicePageProps) {
  const response = await getServiceBySlug(params.slug)

  if (!response.success || !response.data) {
    notFound()
  }

  const service = response.data

  // Get cover image and type
  const [coverResponse, coverType] = await Promise.all([
    getCover(),
    getCoverType(),
  ])
  const coverImage = coverResponse.success ? coverResponse.data : null

  return <ServicePageClient service={service} coverImage={coverImage} coverType={coverType} />
}

// Generate static params for all services (optional, for better performance)
export async function generateStaticParams() {
  try {
    const { getAllServices } = await import('@/features/services/api')
    const response = await getAllServices()

    if (response.success) {
      return response.data.map(service => ({
        slug: service.slug,
      }))
    }
  } catch (error) {
    console.error('Failed to generate static params for services:', error)
  }

  return []
}
