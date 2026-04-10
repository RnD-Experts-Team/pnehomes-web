import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CmsMedia } from '@/components/CmsMedia'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { communitiesAPI } from '@/features/communities/api'
import ImageGallery from '@/components/ImageGallery'
import RequestTourButton from '@/components/RequestTourButton'
import { ResponsiveMedia } from '@/features/home/components/ResponsiveMedia'
import { Bed, Bath, Car, Map } from 'lucide-react'
import { replacePlaceholders } from '@/lib/utils'

interface CommunityPageProps {
  params: Promise<{ slug: string }>
}

export default async function CommunityPage({ params }: CommunityPageProps) {
  const { slug } = await params
  const [community, pageData] = await Promise.all([
    communitiesAPI.getCommunityBySlug(slug),
    communitiesAPI.getCommunitiesPageData(),
  ])

  if (!community) {
    return notFound()
  }

  // Show only first 3 floor plans, safely handling possible null or undefined
  const floorPlans = community['floor-plans'] || []
  const displayedFloorPlans = floorPlans.slice(0, 3)
  const hasMoreFloorPlans = floorPlans.length > 3

  return (
    <div className="relative min-h-full">
      {/* Hero / Title (clean and bold like pnehomes.com) */}
      <section className="relative isolate overflow-hidden h-[60vh]">
        {/* Parallax background image container */}
        {pageData.cover ? (
          <div className="fixed inset-0 -z-10 bg-gray-100">
            <CmsMedia
              src={pageData.cover}
              mediaType={pageData.cover_type}
              isCover
              alt="Community Cover"
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
        ) : (
          <div className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-600 to-blue-800" />
        )}

        {/* Centered content */}
        <div className="relative z-20 container mx-auto flex h-full items-center justify-center px-6 text-center">
          <h1 className="text-pne-brand text-4xl font-extrabold tracking-tight uppercase sm:text-5xl">
            {community.title}
          </h1>
        </div>
      </section>

      {/* Content wrapper with white background */}
      <div className="relative z-10 bg-white min-h-full">
        <div className="container mx-auto max-w-6xl px-4 pb-16">

      {/* Header Title block */}
      <header className="pt-6 pb-5 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="text-left">
            <h1 className="text-pne-brand text-4xl font-extrabold tracking-tight uppercase sm:text-5xl max-w-[800px] mx-auto break-words">{community.title}</h1>
            <p className="text-muted-foreground/80 text-lg font-semibold tracking-wider uppercase">
              {community.address || 'Featured Community'}
            </p>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <section className="pb-12 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr,380px]">
          {/* Gallery */}
          <Card>
            <CardContent className="p-2">
              <ImageGallery images={community.gallery.map(g => typeof g === 'string' ? g : g.url)} imageTypes={community.gallery.map(g => typeof g === 'string' ? null : g.type)} title={community.title} maxVisibleImages={5} />
            </CardContent>
          </Card>
        </div>

        {/* Video Section */}
        {community.video && (
          <section className="mt-12">
            <Card>
              <CardContent className="p-2">
                <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100">
                  <ResponsiveMedia
                    src={community.video}
                    className="h-full w-full object-cover"
                    autoPlay={false}
                    muted={true}
                    loop={false}
                    playsInline={true}
                  />
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Community Features */}
        <section className="mt-12">
          <div className="mb-5">
            <h2 className="text-xl font-semibold">Community Features</h2>
            <div className="bg-primary/60 mt-2 h-px w-16" />
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="prose prose-lg max-w-none">
                <p className="leading-relaxed text-gray-700">{community['community-features']}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Floor Plans Preview - Only show if floor plans exist */}
        {floorPlans.length > 0 && (
          <section className="mt-12">
            <div className="mb-5">
              <h2 className="text-xl font-semibold">Floor Plans</h2>
              <div className="bg-primary/60 mt-2 h-px w-16" />
            </div>
            {hasMoreFloorPlans && (
              <div className="mb-6 flex justify-end">
                <Link href={`/floor-plans?community=${encodeURIComponent(community.title)}`}>
                  <Button variant="outline">Show All Floor Plans ({floorPlans.length})</Button>
                </Link>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {displayedFloorPlans.map(floorPlan => (
                <div
                  key={floorPlan.slug}
                  className="overflow-hidden rounded-xl border bg-white shadow-sm"
                >
                  <Card className="overflow-hidden p-0">
                    <div className="relative aspect-[4/3]">
                      <CmsMedia
                        src={floorPlan.cover}
                        mediaType={floorPlan.cover_type}
                        alt={floorPlan.title}
                        fill
                        sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="p-2">
                      <div className="text-2xl font-bold">{floorPlan.title}</div>
                      <div className="mt-1 text-lg capitalize opacity-60">{community.title}</div>
                      <div className="mt-2 text-base font-medium">
                        ${parseInt(floorPlan.price).toLocaleString()}
                      </div>
                      <div className="mt-1 flex items-center justify-around text-sm opacity-80">
                        <div className="flex-col items-center justify-between">
                          <div className="text-lg">
                            <Bed className="mr-1 inline-block h-5 w-5" />
                            {floorPlan.beds}
                          </div>
                          <div className="text-xs">Bedrooms</div>
                        </div>
                        <div className="h-10 border-r border-gray-500"></div>
                        <div className="flex-col items-center justify-center">
                          <div className="text-lg">
                            <Bath className="mr-1 inline-block h-5 w-5" />
                            {floorPlan.baths}
                          </div>
                          <div className="text-xs">Bathrooms</div>
                        </div>
                        <div className="h-10 border-r border-gray-500"></div>
                        <div className="flex-col items-center justify-center">
                          <div className="text-lg">
                            <Car className="mr-1 inline-block h-5 w-5" />
                            {floorPlan.garages}
                          </div>
                          <div className="text-xs">Garages</div>
                        </div>
                        <div className="h-10 border-r border-gray-500"></div>
                        <div className="flex-col items-center justify-center">
                          <div className="text-lg">
                            <Map className="mr-1 inline-block h-5 w-5" />
                            {parseInt(floorPlan.sqft).toLocaleString()}
                          </div>
                          <div className="text-xs">SQFT</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Show Floor Plans Button */}
            <div className="mt-6 text-center">
              <Link href={`/floor-plans?community=${encodeURIComponent(community.title)}`}>
                <Button size="lg" className="px-8">
                  Show more Floor Plans
                </Button>
              </Link>
            </div>
          </section>
        )}

        {/* Price Card */}
              <Card className='mt-12'>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="mb-2 text-3xl font-bold text-green-600">
                      ${community['starting-price']}
                    </div>
                    <p className="mb-4 text-gray-600">Starting Price</p>
                    <div className="mb-6 text-sm text-gray-500">{community.city}</div>

                    {/* Request Tour Button */}
                    <RequestTourButton 
                      content={{
                        title: pageData.contact.title || 'Request a Tour',
                        message: replacePlaceholders(
                          pageData.contact.message || "I'm contacting you to ask about the community of {title}",
                          { 
                            title: community.title,
                            community: community.title,
                            city: community.city 
                          }
                        )
                      }} 
                      className="mb-3 w-full" 
                    />
                  </div>
                </CardContent>
              </Card>
            </section>
        </div>
      </div>
    </div>
  )
}
