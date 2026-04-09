import { getGallerySubAlbum, getGalleryContactInfo, getGalleryCoverData } from '@/features/gallery/api'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import GalleryContent from '@/features/gallery/components/GalleryContent'
import { CmsMedia } from '@/components/CmsMedia'

interface SubAlbumPageProps {
  params: Promise<{ slug: string; subSlug: string }>
}

export const dynamic = 'force-dynamic'
export const revalidate = 60 // ✅ refresh route cache every 60s

export default async function SubAlbumPage({ params }: SubAlbumPageProps) {
  try {
    const { slug, subSlug } = await params

    console.log('[SubAlbumPage] Loading sub-album:', { slug, subSlug })

    const [result, contactInfo, { cover, cover_type: coverType }] = await Promise.all([
      getGallerySubAlbum(slug, subSlug),
      getGalleryContactInfo(),
      getGalleryCoverData(),
    ])

    console.log('[SubAlbumPage] Data loaded:', {
      found: result.found,
      hasSubAlbum: !!result.subAlbum,
      hasAlbum: !!result.album,
      imageCount: result.subAlbum?.gallery?.length || 0,
    })

    if (!result.found || !result.subAlbum) {
      console.log('[SubAlbumPage] Sub-album not found:', { slug, subSlug })
      return notFound()
    }

    const { album, subAlbum } = result

    const contactMessage = contactInfo.message.replace('{title}', subAlbum.title)
    const contactUrl = `/contact?message=${encodeURIComponent(contactMessage)}`

    return (
      <div className="relative">
        {/* Hero / Title */}
        <section className="relative isolate overflow-hidden h-[60vh]">
          <CmsMedia
            src={cover}
            mediaType={coverType}
            alt="Gallery Cover"
            isCover
            fill
            className="object-cover md:fixed md:inset-0 md:h-screen md:w-full"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-white/10 to-black/10 z-10" />

          <div className="relative z-20 flex h-full items-center justify-center">
            <div className="container mx-auto px-6 text-center">
              <h1 className="text-pne-brand text-4xl font-extrabold tracking-tight uppercase sm:text-5xl max-w-[800px] mx-auto break-words">
                {subAlbum.title}
              </h1>
            </div>
          </div>
        </section>

        {/* Content wrapper */}
        <div className="relative z-10 bg-white min-h-full">
          <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 pb-16">
            <div className="mb-8">
              <Link href={`/gallery/${slug}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-pne-accent text-white border-pne-accent hover:bg-pne-brand hover:border-pne-brand hover:text-white transition-colors"
                >
                  ← Go back to {album?.title}
                </Button>
              </Link>
            </div>

            {subAlbum.gallery && subAlbum.gallery.length > 0 ? (
              <GalleryContent images={subAlbum.gallery} albumTitle={subAlbum.title} />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No images available in this sub-album.</p>
              </div>
            )}

            {/* Contact button */}
            <div className="flex justify-center mt-12">
              <Link href={contactUrl}>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-pne-accent text-white border-pne-accent hover:bg-pne-brand hover:border-pne-brand hover:text-white transition-colors px-8 py-3 text-lg"
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
    console.error('[SubAlbumPage] Error loading sub-album:', error)

    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Error Loading Sub-Album</h1>
        <p className="text-gray-600 mb-4">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
        <Link href="/gallery">
          <Button variant="outline">Return to Gallery</Button>
        </Link>
      </div>
    )
  }
}
