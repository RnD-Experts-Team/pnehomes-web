import { getProjectBySlug, getProjectsContactInfo, getProjectsCoverData } from '@/features/projects/api'
import { Button } from '@/components/ui/button'
import { CmsMedia } from '@/components/CmsMedia'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ProjectGallery from '@/features/projects/components/ProjectGallery'
import type { GalleryImage } from '@/features/projects/api'

interface LotPageProps {
  params: Promise<{ slug: string }>
}

export const revalidate = 60 // ISR: refresh route cache every 60s

export default async function LotPage({ params }: LotPageProps) {
  try {
    const { slug } = await params

    const [lot, contactInfo, { cover, cover_type: coverType }] = await Promise.all([
      getProjectBySlug(slug),
      getProjectsContactInfo(),
      getProjectsCoverData(),
    ])

    if (!lot) {
      return notFound()
    }

    // Prefer the lot's own cover for the hero; fall back to the section cover.
    const heroSrc = lot.cover_img || cover
    const heroType = lot.cover_img ? lot.cover_img_type : coverType

    // Flatten every room's photos into one ordered stream (rooms appear in
    // CMS order — Exterior first — then a lot's own flat gallery, if any).
    const allImages: GalleryImage[] = [
      ...(lot.sub_albums ?? []).flatMap(room => room.gallery ?? []),
      ...(lot.gallery ?? []),
    ]
    const contactMessage = contactInfo.message.replace('{title}', lot.title)
    const contactUrl = `/contact?message=${encodeURIComponent(contactMessage)}`

    return (
      <div className="relative min-h-full">
        {/* Hero / Title - Parallax Effect */}
        <section className="relative isolate overflow-hidden h-[60vh]">
          <div className="fixed inset-0 -z-10 bg-gray-100">
            <CmsMedia
              src={heroSrc}
              mediaType={heroType}
              alt={lot.title}
              isCover
              fill
              className="object-cover object-center"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-white/10 to-black/10 z-10" />
          </div>

          <div className="relative flex h-full items-center justify-center py-16">
            <div className="container mx-auto px-6 text-center">
              <h1 className="text-pne-brand text-4xl font-extrabold tracking-tight uppercase sm:text-5xl drop-shadow-lg max-w-[800px] mx-auto break-words">
                {lot.title}
              </h1>
            </div>
          </div>
        </section>

        {/* Content sections with a solid background to cover the parallax */}
        <div className="relative z-10 bg-white min-h-full">
          <div className="container mx-auto px-4 py-6 pb-16 sm:px-6 lg:px-8">
            <div className="flex items-center justify-start mb-6">
              <Link href="/our-projects">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-pne-accent text-white border-pne-accent hover:bg-pne-brand hover:border-pne-brand hover:text-white transition-colors"
                >
                  ← Back to Our Projects
                </Button>
              </Link>
            </div>

            {/* One continuous, editorial mosaic — all photos in order, no dividers */}
            <ProjectGallery images={allImages} title={lot.title} />

            {/* Contact CTA */}
            <div className="flex justify-center pt-12">
              <Link href={contactUrl}>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-pne-accent border-pne-accent hover:bg-pne-brand hover:border-pne-brand hover:text-white transition-colors px-8 py-3 text-lg"
                >
                  {contactInfo.title}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('[LotPage] Error loading project:', error)

    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Error Loading Project</h1>
        <p className="text-gray-600 mb-4">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
        <Link href="/our-projects">
          <Button variant="outline">Return to Our Projects</Button>
        </Link>
      </div>
    )
  }
}
