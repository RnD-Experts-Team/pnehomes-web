import React from 'react'
import { CmsMedia } from '@/components/CmsMedia'
import type { MediaType } from '@/components/CmsMedia'
import { Badge } from '@/components/ui/badge'
import { CircleDollarSignIcon, Bed, Bath, Car, Map } from 'lucide-react'

interface FloorPlan {
  img: string
  img_type?: MediaType
  title: string
  Description?: string
}

interface Property {
  id?: number;
  slug?: string;
  title?: string;
  community?: string;
  price?: string;
  beds?: string;
  baths?: string;
  garages?: string;
  sqft?: string;
  gallery?: string[];
  gallery_types?: MediaType[];
  zillow_link?: string | null;
  Whats_special?: {
    badges?: string[];
    description?: string;
  } | null;
  Facts_features?: Array<{
    title: string;
    list: string[];
  }>;
  floor_plans?: FloorPlan[];
}

interface PrintablePropertyPageProps {
  property: Property
}



const PrintablePropertyPage = React.forwardRef<HTMLDivElement, PrintablePropertyPageProps>(
  ({ property: p }, ref) => {
    const gallery = Array.isArray(p.gallery) && p.gallery.length > 0 ? p.gallery : []

    return (
      <div ref={ref} className="bg-white p-8 text-black">
        {/* Header */}
        <header className="mb-8 border-b border-gray-300 pb-6">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">{p.title || 'Property Details'}</h1>
          <p className="text-xl font-semibold uppercase tracking-wider text-gray-600">
            {p.community || 'Featured Property'}
          </p>
        </header>

        {/* Property Stats */}
        <section className="mb-8">
          <div className="grid grid-cols-5 gap-4 text-center">
            <div className="border-r border-gray-300 pr-4">
              <div className="mb-1 flex items-center justify-center text-lg font-medium">
                <CircleDollarSignIcon className="mr-1 h-5 w-5" />
                {p.price ? `$${parseInt(p.price).toLocaleString()}` : 'Contact for price'}
              </div>
              <div className="text-sm text-gray-600">Price</div>
            </div>
            <div className="border-r border-gray-300 pr-4">
              <div className="mb-1 flex items-center justify-center text-lg">
                <Bed className="mr-1 h-5 w-5" />
                {p.beds}
              </div>
              <div className="text-sm text-gray-600">Bedrooms</div>
            </div>
            <div className="border-r border-gray-300 pr-4">
              <div className="mb-1 flex items-center justify-center text-lg">
                <Bath className="mr-1 h-5 w-5" />
                {p.baths}
              </div>
              <div className="text-sm text-gray-600">Bathrooms</div>
            </div>
            <div className="border-r border-gray-300 pr-4">
              <div className="mb-1 flex items-center justify-center text-lg">
                <Car className="mr-1 h-5 w-5" />
                {p.garages}
              </div>
              <div className="text-sm text-gray-600">Garages</div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-center text-lg">
                <Map className="mr-1 h-5 w-5" />
                {p.sqft}
              </div>
              <div className="text-sm text-gray-600">SQFT</div>
            </div>
          </div>
        </section>

        {/* Gallery - All Images Expanded */}
        {gallery.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Property Gallery</h2>
            <div className="grid grid-cols-2 gap-4">
              {gallery.map((image, index) => (
                <div key={index} className="relative aspect-[4/3] overflow-hidden rounded-lg">
                  <CmsMedia
                    src={image}
                    mediaType={p.gallery_types?.[index]}
                    alt={`${p.title} photo ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="50vw"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* What's Special */}
        {p.Whats_special && (
          <section className="mb-8" style={{ pageBreakBefore: 'always' }}>
            <h2 className="mb-4 text-2xl font-semibold">What&apos;s Special</h2>
            
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
                  className="leading-relaxed text-gray-700"
                  dangerouslySetInnerHTML={{ __html: p.Whats_special.description }}
                />
              </div>
            )}
          </section>
        )}

        {/* Facts & Features */}
        {Array.isArray(p.Facts_features) && p.Facts_features.length > 0 && (
          <section className="mb-8" >
            <h2 className="mb-4 text-2xl font-semibold">Facts & Features</h2>
            <div className="grid grid-cols-2 gap-4">
              {p.Facts_features.map((section, i) => (
                <div key={i} className="rounded-lg border border-gray-200 p-4">
                  <h3 className="mb-2 font-medium">{section.title}</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {section.list.map((item, j) => (
                      <li key={j}>• {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Floor Plans - All Expanded */}
        {Array.isArray(p.floor_plans) && p.floor_plans.length > 0 && (
          <section className="mb-8" style={{ pageBreakBefore: 'always' }}>
            <h2 className="mb-4 text-2xl font-semibold">Floor Plans</h2>
            <div className="space-y-6">
              {p.floor_plans.map((plan, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-gray-200 p-4"
                  style={{
                    breakInside: 'avoid',
                    pageBreakInside: 'avoid',
                    pageBreakAfter: 'always',
                  }}
                >
                  <h3 className="mb-4 text-lg font-medium">{plan.title}</h3>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                    <CmsMedia
                      src={plan.img}
                      mediaType={plan.img_type}
                      alt={plan.title}
                      fill
                      className="object-cover"
                      sizes="100vw"
                    />
                  </div>
                  {plan.Description && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">{plan.Description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        {/* <footer className="mt-8 border-t border-gray-300 pt-4 text-sm text-gray-600">
          <p>
            {p.title} — {p.community || ''} {beds && `• ${beds}`} {baths && `• ${baths}`}{' '}
            {sqft(p.sqft) && `• ${sqft(p.sqft)}`}
          </p>
          <p>Price: {money(p.price)}</p>
          <p className="mt-2">Printed from: {printedFromUrl}</p>
        </footer> */}
      </div>
    )
  }
)

PrintablePropertyPage.displayName = 'PrintablePropertyPage'

export default PrintablePropertyPage
