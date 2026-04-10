import { getGalleryAlbumBySlug, getGalleryContactInfo, getGalleryCoverData } from '@/features/gallery/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CmsMedia } from '@/components/CmsMedia'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import GalleryContent from '@/features/gallery/components/GalleryContent'

interface AlbumPageProps {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'
export const revalidate = 60 // ✅ refresh route cache every 60s

export default async function AlbumPage({ params }: AlbumPageProps) {
  try {
    const { slug } = await params

    console.log('[AlbumPage] Loading album:', slug)

    const [album, contactInfo, { cover, cover_type: coverType }] = await Promise.all([
      getGalleryAlbumBySlug(slug),
      getGalleryContactInfo(),
      getGalleryCoverData(),
    ])

    console.log('[AlbumPage] Data loaded:', {
      albumFound: !!album,
      albumTitle: album?.title,
      hasSubAlbums: !!(album?.sub_albums && album.sub_albums.length > 0),
      hasGallery: !!(album?.gallery && album.gallery.length > 0),
    })

    if (!album) {
      console.log('[AlbumPage] Album not found:', slug)
      return notFound()
    }

    const contactMessage = contactInfo.message.replace('{title}', album.title)
    const contactUrl = `/contact?message=${encodeURIComponent(contactMessage)}`

    return (
      <div className="relative min-h-full">
        {/* Hero / Title - Parallax Effect */}
        <section className="relative isolate overflow-hidden h-[60vh]">
          {/* Parallax background image container */}
          <div className="fixed inset-0 -z-10 bg-gray-100">
            <CmsMedia
              src={cover}
              mediaType={coverType}
              alt={album.title}
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
                {album.title}
              </h1>
            </div>
          </div>
        </section>

        {/* Content sections with solid backgrounds to cover parallax */}
        <div className="relative z-10 bg-white min-h-full">
          <div className="container mx-auto px-4 py-6 pb-16 sm:px-6 lg:px-8">
            <div className="flex items-center justify-start mb-6">
              <Link href="/gallery">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-pne-accent text-white border-pne-accent hover:bg-pne-brand hover:border-pne-brand hover:text-white transition-colors"
                >
                  ← Back to Gallery
                </Button>
              </Link>
            </div>

            {/* Case A: Album has sub-albums */}
            {album.sub_albums && album.sub_albums.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
                {album.sub_albums.map(subAlbum => (
                  <Link key={subAlbum.slug} href={`/gallery/${album.slug}/${subAlbum.slug}`}>
                    <Card className="group cursor-pointer overflow-hidden border-0 p-0 shadow-md transition-all duration-300 hover:shadow-lg h-80">
                      <CardContent className="p-0 h-full">
                        <div className="relative h-full overflow-hidden">
                          <CmsMedia
                            src={subAlbum.cover_img}
                            mediaType={subAlbum.cover_img_type}
                            alt={subAlbum.title}
                            fill
                            className="object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-110"
                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <h2 className="text-2xl font-bold text-white text-center px-4 transition-transform duration-300 group-hover:-translate-y-2">
                              {subAlbum.title}
                            </h2>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              /* Case B: Album has direct gallery images */
              <div className="mb-12">
                {album.gallery && album.gallery.length > 0 ? (
                  <GalleryContent images={album.gallery} albumTitle={album.title} />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No images available in this album.</p>
                  </div>
                )}
              </div>
            )}

            {/* Contact Button - Centered at bottom */}
            <div className="flex justify-center pt-8">
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
    console.error('[AlbumPage] Error loading album:', error)

    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Error Loading Album</h1>
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
