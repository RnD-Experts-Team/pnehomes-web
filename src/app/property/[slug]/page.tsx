// src/app/property/[slug]/page.tsx
import * as Property from '@/features/property/api'
import Link from 'next/link'
import { CmsMedia } from '@/components/CmsMedia'
import { notFound } from 'next/navigation'
import SharePrintButtons from '@/features/property/components/SharePrintButtons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ImageGallery from '@/components/ImageGallery'
import { Card, CardContent } from '@/components/ui/card'
import { CircleDollarSignIcon, Bed, Bath, Car, Map } from 'lucide-react'
import { FloorPlanCollapsible } from '@/features/property/components/FloorPlanCollapsible'
import { replacePlaceholders } from '@/lib/utils'

// Ensure this page always renders with fresh API data
export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  const slugs = await Property.allSlugs()
  return slugs.map(slug => ({ slug }))
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { slug } = await params
  const sp = await searchParams

  const p = await Property.getBySlug(slug)
  if (!p) return notFound()

  // Get contact information for dynamic message
  const contactInfo = await Property.getContactInfo()

  // Keep filter context from the URL (used for prev/next navigation)
  const filterParams = {
    community: typeof sp.community === 'string' ? sp.community : undefined,
    price: sp.price ? Number(sp.price) : undefined,
    beds: sp.beds ? Number(sp.beds) : undefined,
    baths: sp.baths ? Number(sp.baths) : undefined,
    garages: sp.garages ? Number(sp.garages) : undefined,
    min: sp.min ? Number(sp.min) : undefined,
    max: sp.max ? Number(sp.max) : undefined,
    sortBy: 'sqft' as const,
    sortOrder: 'desc' as const,
  }

  // Get filtered properties to calculate navigation and cover image
  const [filteredProperties, coverImage, coverType] = await Promise.all([
    Property.list({ ...filterParams, limit: 1000 }),
    Property.getCoverImage(),
    Property.getCoverType(),
  ])

  const currentIndex = filteredProperties.findIndex(prop => prop.slug === slug)
  const prevProperty = currentIndex > 0 ? filteredProperties[currentIndex - 1] : null
  const nextProperty =
    currentIndex < filteredProperties.length - 1 ? filteredProperties[currentIndex + 1] : null

  // Build query string for navigation links
  const buildNavUrl = (targetSlug: string) => {
    const queryParams = new URLSearchParams()
    Object.entries(sp).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        queryParams.set(key, value)
      }
    })
    const qs = queryParams.toString()
    return qs ? `/property/${targetSlug}?${qs}` : `/property/${targetSlug}`
  }

  // helpers
  const num = (v?: string) => {
    if (!v && v !== '0') return undefined
    const n = Number(v)
    return Number.isNaN(n) ? undefined : n
  }
  const money = (v?: string) => {
    const n = num(v)
    return typeof n === 'number' ? `$${Math.round(n).toLocaleString()}` : 'Contact for price'
  }
  const sqft = (v?: string) => {
    const n = num(v)
    return typeof n === 'number' ? `${n.toLocaleString()} sqft` : ''
  }

  const beds = p.beds ? `${p.beds} bd` : ''
  const baths = p.baths ? `${p.baths} ba` : ''

  const gallery = Array.isArray(p.gallery) && p.gallery.length > 0 ? p.gallery : []

  const shareText =
    p?.Whats_special?.description?.slice(0, 140)?.trim() ||
    '' ||
    [beds, baths, sqft(p.sqft)].filter(Boolean).join(' • ')

  return (
    <div className="relative min-h-full">
      {/* Hero / Title - Parallax Effect */}
      {coverImage && (
        <section className="relative isolate h-[60vh] overflow-hidden">
          {/* Parallax background image container */}
          <div className="fixed inset-0 -z-10 bg-gray-100">
            <CmsMedia
              src={coverImage}
              mediaType={coverType}
              isCover
              alt={p.title || 'Property'}
              fill
              className="object-cover object-center"
              priority
              sizes="100vw"
              style={{
                transform: 'translateZ(0)', // Force hardware acceleration
              }}
            />
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-white/10 to-black/10" />
          </div>

          <div className="relative flex h-full items-center justify-center py-16">
            <div className="container mx-auto px-6 text-center">
              <h1 className="text-pne-brand text-4xl font-extrabold tracking-tight uppercase drop-shadow-lg sm:text-5xl max-w-[800px] mx-auto break-words">
                {p.title}
              </h1>
            </div>
          </div>
        </section>
      )}

      {/* Content sections with solid backgrounds to cover parallax */}
      <div className="relative z-10 min-h-full bg-white">
        {/* Header Title block */}
        <header className="container mx-auto max-w-6xl px-4 pt-6 pb-5 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="text-left">
              <h1 className="mb-2 text-3xl leading-tight font-semibold sm:text-4xl">{p.title}</h1>
              <p className="text-muted-foreground/80 text-lg font-semibold tracking-wider uppercase">
                {p.community || 'Featured Property'}
              </p>
            </div>
            <div className="text-right">
              <div className="mt-4">
                <SharePrintButtons 
                  title={p.title || 'Property'} 
                  text={shareText} 
                  property={p}
                />
              </div>
              {/* <div className="text-2xl font-semibold sm:text-3xl">{money(p.price)}</div> */}
            </div>
          </div>
        </header>

        {/* Main content area */}
        <section className="container mx-auto max-w-6xl px-4 pb-12 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr,380px]">
            {/* Gallery */}
            {gallery.length > 0 && (
              <Card>
                <CardContent className="p-2">
                  <ImageGallery images={gallery} imageTypes={p.gallery_types?.map(t => t ?? null)} title={p.title} maxVisibleImages={5} />

                  {/* Responsive Property Stats */}
                  <div className="mt-5">
                    {/* Mobile Layout */}
                    <div className="block text-sm opacity-80 lg:hidden">
                      {/* First Row: Price and SQFT */}
                      <div className="mb-4 flex items-center justify-around border-b border-gray-200 pb-4">
                        <div className="flex-col items-center justify-center">
                          <div className="mt-2 text-base font-medium">
                            <CircleDollarSignIcon className="mr-1 inline-block h-5 w-5" />
                            {p.price
                              ? `$${parseInt(p.price).toLocaleString()}`
                              : 'Contact for price'}
                          </div>
                          <div className="text-xs">Price</div>
                        </div>
                        <div className="h-10 border-r border-gray-300"></div>
                        <div className="flex-col items-center justify-center">
                          <div className="text-lg">
                            <Map className="mr-1 inline-block h-5 w-5" />
                            {p.sqft}
                          </div>
                          <div className="text-xs">SQFT</div>
                        </div>
                      </div>
                      {/* Second Row: Beds, Baths, Garages */}
                      <div className="flex items-center justify-around">
                        <div className="flex-col items-center justify-center">
                          <div className="text-lg">
                            <Bed className="mr-1 inline-block h-5 w-5" />
                            {p.beds}
                          </div>
                          <div className="text-xs">Bedrooms</div>
                        </div>
                        <div className="h-10 border-r border-gray-300"></div>
                        <div className="flex-col items-center justify-center">
                          <div className="text-lg">
                            <Bath className="mr-1 inline-block h-5 w-5" />
                            {p.baths}
                          </div>
                          <div className="text-xs">Bathrooms</div>
                        </div>
                        <div className="h-10 border-r border-gray-300"></div>
                        <div className="flex-col items-center justify-center">
                          <div className="text-lg">
                            <Car className="mr-1 inline-block h-5 w-5" />
                            {p.garages}
                          </div>
                          <div className="text-xs">Garages</div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden text-sm opacity-80 lg:flex lg:items-center lg:justify-around">
                      <div className="flex-col items-center justify-between">
                        <div className="mt-2 text-base font-medium">
                          <CircleDollarSignIcon className="mr-1 inline-block h-5 w-5" />
                          {p.price ? `$${parseInt(p.price).toLocaleString()}` : 'Contact for price'}
                        </div>
                        <div className="text-xs">Price</div>
                      </div>
                      <div className="h-10 border-r border-gray-500"></div>
                      <div className="flex-col items-center justify-between">
                        <div className="text-lg">
                          <Bed className="mr-1 inline-block h-5 w-5" />
                          {p.beds}
                        </div>
                        <div className="text-xs">Bedrooms</div>
                      </div>
                      <div className="h-10 border-r border-gray-500"></div>
                      <div className="flex-col items-center justify-center">
                        <div className="text-lg">
                          <Bath className="mr-1 inline-block h-5 w-5" />
                          {p.baths}
                        </div>
                        <div className="text-xs">Bathrooms</div>
                      </div>
                      <div className="h-10 border-r border-gray-500"></div>
                      <div className="flex-col items-center justify-center">
                        <div className="text-lg">
                          <Car className="mr-1 inline-block h-5 w-5" />
                          {p.garages}
                        </div>
                        <div className="text-xs">Garages</div>
                      </div>
                      <div className="h-10 border-r border-gray-500"></div>
                      <div className="flex-col items-center justify-center">
                        <div className="text-lg">
                          <Map className="mr-1 inline-block h-5 w-5" />
                          {p.sqft}
                        </div>
                        <div className="text-xs">SQFT</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* What's Special / Highlights */}
          {p.Whats_special && (
            <section className="bg-card mt-12 rounded-xl border p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">What&apos;s Special</h2>
              </div>

              {Array.isArray(p.Whats_special.badges) && p.Whats_special.badges.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {p.Whats_special.badges.map((badge, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="border-blue-100 bg-blue-50 text-blue-700"
                    >
                      {badge}
                    </Badge>
                  ))}
                </div>
              )}

              {p.Whats_special.description && (
                <div className="prose prose-lg max-w-none text-gray-700">
                  <div
                    className="text-muted-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: p.Whats_special.description }}
                  />
                </div>
              )}
            </section>
          )}

          {/* Facts & Features */}
          {Array.isArray(p.Facts_features) && p.Facts_features.length > 0 && (
            <section className="mt-12">
              <div className="mb-5">
                <h2 className="text-xl font-semibold">Facts &amp; Features</h2>
                <div className="bg-primary/60 mt-2 h-px w-16" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {p.Facts_features.map((section, i) => (
                  <div key={i} className="bg-card rounded-xl border p-5 shadow-sm">
                    <h3 className="mb-2 font-medium">{section.title}</h3>
                    <ul className="text-muted-foreground space-y-1 text-sm">
                      {section.list.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Floor Plans - Collapsible */}
          {Array.isArray(p.floor_plans) && p.floor_plans.length > 0 && (
            <section className="mt-12">
              <div className="mb-5">
                <h2 className="text-xl font-semibold">Floor Plans</h2>
                <div className="bg-primary/60 mt-2 h-px w-16" />
              </div>
              <div className="space-y-4">
                {p.floor_plans.map((plan, i) => (
                  <FloorPlanCollapsible key={i} plan={plan} />
                ))}
              </div>
            </section>
          )}

          {/* Responsive Buttons */}
          <div className="mt-6 flex flex-col gap-2 sm:flex-row print:hidden">
            {p.zillow_link && (
              <Button
                asChild
                variant="outline"
                className="w-full border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 sm:w-auto sm:flex-1"
              >
                <a href={p.zillow_link} target="_blank" rel="noopener noreferrer">
                  View on Zillow
                </a>
              </Button>
            )}

            <Button asChild size="lg" className="w-full sm:flex-1">
              <Link
                href={`/contact?message=${encodeURIComponent(
                  replacePlaceholders(contactInfo.message, {
                    propertyTitle: p.title || '',
                    title: p.title || '',
                    community: p.community || '',
                    price: p.price || '',
                    beds: p.beds || '',
                    baths: p.baths || '',
                    sqft: p.sqft || '',
                  })
                )}`}
              >
                {contactInfo.title}
              </Link>
            </Button>
          </div>

          {/* Prev / Next property navigation */}
          {(prevProperty || nextProperty) && (
            <nav className="mt-12 flex items-center justify-between gap-3">
              <div className="min-w-0">
                {prevProperty && (
                  <Button asChild variant="outline" className="justify-start gap-2">
                    <Link href={buildNavUrl(prevProperty.slug)}>
                      <span aria-hidden>←</span>
                      <span className="truncate">Previous: {prevProperty.title}</span>
                    </Link>
                  </Button>
                )}
              </div>
              <div className="text-muted-foreground hidden text-sm opacity-70 sm:block">
                {p.title}
              </div>
              <div className="min-w-0 text-right">
                {nextProperty && (
                  <Button asChild variant="outline" className="justify-end gap-2">
                    <Link href={buildNavUrl(nextProperty.slug)}>
                      <span className="truncate">Next: {nextProperty.title}</span>
                      <span aria-hidden>→</span>
                    </Link>
                  </Button>
                )}
              </div>
            </nav>
          )}
        </section>

        {/* Print-only footer */}
        <div className="text-muted-foreground hidden px-8 pt-4 pb-16 text-sm print:block">
          <hr className="border-muted mb-3" />
          <p>
            {p.title} — {p.community || ''} {beds && `• ${beds}`} {baths && `• ${baths}`}{' '}
            {sqft(p.sqft) && `• ${sqft(p.sqft)}`}
          </p>
          <p>Price: {money(p.price)}</p>
        </div>
      </div>
    </div>
  )
}
