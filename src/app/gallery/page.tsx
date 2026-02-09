import { getGalleryData, getGalleryTitle, getGalleryCover } from '@/features/gallery/api'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'
import { getGlobalSubtitle } from '@/lib/global-subtitle'

export const dynamic = 'force-dynamic'
export const revalidate = 60 // ✅ refresh route cache every 60s

export default async function GalleryPage() {
  try {
    const [galleryData, galleryCover, galleryTitle, subtitle] = await Promise.all([
      getGalleryData(),
      getGalleryCover(),
      getGalleryTitle(),
      getGlobalSubtitle(),
    ])

    const { gallery: albums } = galleryData

    console.log('[GalleryPage] Rendering with data:', {
      title: galleryTitle,
      albumCount: albums.length,
      hasCover: !!galleryCover,
    })

    return (
      <div className="relative min-h-full">
        {/* Hero / Title - Parallax Effect */}
        <section className="relative isolate overflow-hidden h-[60vh]">
          {/* Parallax background image container */}
          <div className="fixed inset-0 -z-10 bg-gray-100">
            <Image
              src={galleryCover}
              alt={galleryTitle}
              fill
              className="object-cover object-center"
              priority
              sizes="100vw"
              style={{
                transform: 'translateZ(0)', // Force hardware acceleration
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-white/10 to-black/10 z-10" />
          </div>

          <div className="relative flex h-full items-center justify-center py-16">
            <div className="container mx-auto px-6 text-center">
              <h1 className="text-pne-brand text-4xl font-extrabold tracking-tight uppercase sm:text-5xl drop-shadow-lg max-w-[800px] mx-auto break-words">
                {galleryTitle}
              </h1>
              {subtitle && (
                <p
                  className="mx-auto mt-4 max-w-3xl text-base text-white/90 sm:text-lg md:text-xl"
                  style={{ fontFamily: '"New Caslon SB Bold", serif' }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Content sections with solid backgrounds to cover parallax */}
        <div className="relative z-10 bg-white min-h-full">
          <div className="container mx-auto px-4 py-6 pb-16 sm:px-6 lg:px-8">
            {/* Small screens (sm) - 2 columns regular grid */}
            <div className="grid gap-6 sm:grid-cols-2 md:hidden">
              {albums.map(album => (
                <Link key={album.id} href={`/gallery/${album.slug}`}>
                  <Card className="group cursor-pointer overflow-hidden border-0 p-0 shadow-md transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-0">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src={album.cover_img}
                          alt={album.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(min-width: 640px) 50vw, 100vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-all duration-300 group-hover:backdrop-blur-sm group-hover:bg-black/40" />
                        <div className="absolute inset-0 flex items-center justify-center p-6">
                          <h2 className="text-2xl font-semibold text-white transition-transform duration-300 group-hover:-translate-y-2">
                            {album.title}
                          </h2>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Medium screens (md) - Custom masonry grid with 2 columns */}
            <div className="hidden md:block lg:hidden">
              <div
                className="grid grid-cols-2 gap-6"
                style={{ gridTemplateRows: `repeat(${Math.ceil(albums.length * 10)}, minmax(0, 1fr))` }}
              >
                {albums.map((album, index) => {
                  const pairIndex = Math.floor(index / 2)
                  const isFirstInPair = index % 2 === 0

                  const gridColumn = isFirstInPair ? 1 : 2
                  const gridRowStart = isFirstInPair ? (pairIndex * 19 + 1) : (pairIndex * 19 + 2)
                  const gridRowEnd = isFirstInPair ? (pairIndex * 19 + 20) : (pairIndex * 19 + 21)

                  return (
                    <Link
                      key={album.id}
                      href={`/gallery/${album.slug}`}
                      style={{
                        gridColumn: gridColumn,
                        gridRowStart: gridRowStart,
                        gridRowEnd: gridRowEnd,
                      }}
                    >
                      <Card className="group cursor-pointer overflow-hidden border-0 p-0 shadow-md transition-all duration-300 hover:shadow-lg h-full">
                        <CardContent className="p-0 h-full">
                          <div className="relative h-full overflow-hidden">
                            <Image
                              src={album.cover_img}
                              alt={album.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              sizes="50vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-all duration-300 group-hover:backdrop-blur-sm group-hover:bg-black/40" />
                            <div className="absolute inset-0 flex items-center justify-center p-6">
                              <h2 className="text-2xl font-semibold text-white transition-transform duration-300 group-hover:-translate-y-2">
                                {album.title}
                              </h2>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Large screens (lg) and above - Custom masonry grid with 4 columns */}
            <div className="hidden lg:block">
              <div
                className="grid grid-cols-4 gap-6"
                style={{ gridTemplateRows: `repeat(${Math.ceil(albums.length * 5)}, minmax(0, 1fr))` }}
              >
                {albums.map((album, index) => {
                  const groupIndex = Math.floor(index / 4)
                  const positionInGroup = index % 4

                  const gridColumn = positionInGroup + 1
                  const startOffset = (positionInGroup === 0 || positionInGroup === 2) ? 0 : 1
                  const gridRowStart = groupIndex * 19 + startOffset + 1
                  const gridRowEnd = groupIndex * 19 + startOffset + 20

                  return (
                    <Link
                      key={album.id}
                      href={`/gallery/${album.slug}`}
                      style={{
                        gridColumn: gridColumn,
                        gridRowStart: gridRowStart,
                        gridRowEnd: gridRowEnd,
                      }}
                    >
                      <Card className="group cursor-pointer overflow-hidden border-0 p-0 shadow-md transition-all duration-300 hover:shadow-lg h-full">
                        <CardContent className="p-0 h-full">
                          <div className="relative h-full overflow-hidden">
                            <Image
                              src={album.cover_img}
                              alt={album.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              sizes="25vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-all duration-300 group-hover:backdrop-blur-sm group-hover:bg-black/40" />
                            <div className="absolute inset-0 flex items-center justify-center p-6">
                              <h2 className="text-4xl font-semibold text-white transition-transform duration-300 group-hover:-translate-y-2">
                                {album.title}
                              </h2>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('[GalleryPage] Error loading gallery:', error)

    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Error Loading Gallery</h1>
        <p className="text-gray-600">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
        <p className="text-sm text-gray-500 mt-4">Please check the console for more details.</p>
      </div>
    )
  }
}
