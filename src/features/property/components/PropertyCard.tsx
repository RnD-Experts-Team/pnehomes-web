'use client'

// src/features/property/components/PropertyCard.tsx

import Link from 'next/link'
import { CmsMedia } from '@/components/CmsMedia'
import { useSearchParams } from 'next/navigation'
import type { Property } from '../model/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, Plus, Check } from 'lucide-react'
import PropertyReviewDialog from './PropertyReviewDialog'
import { useComparison } from '@/contexts/ComparisonContext'
import { Bed, Bath, Car, Map } from 'lucide-react'

export default function PropertyCard({ p }: { p: Property }) {
  const { addToComparison, removeFromComparison, isInComparison } = useComparison()
  const isSelected = isInComparison(p.id)
  const searchParams = useSearchParams()

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isSelected) {
      removeFromComparison(p.id)
    } else {
      addToComparison(p)
    }
  }

  // Build property URL with current filter parameters
  const propertyUrl = `/property/${p.slug}?${searchParams.toString()}`

  const handleQuickReviewClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <Link href={propertyUrl} className="block">
      <Card className="group cursor-pointer overflow-hidden p-0 transition-shadow hover:shadow-lg">
        {p.gallery && p.gallery[0] && (
          <div className="relative aspect-[5/3]">
            <CmsMedia
              src={p.gallery[0]}
              mediaType={p.gallery_types?.[0]}
              alt={p.title}
              fill
              sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
              className="object-cover transition-transform group-hover:scale-105"
            />
            {/* Review Button - Bottom Left Corner */}
            <div className="absolute bottom-2 left-2 z-10" onClick={handleQuickReviewClick}>
              <PropertyReviewDialog property={p}>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/95 text-black shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-105 active:scale-95"
                >
                  <Eye className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">Quick Review</span>
                </Button>
              </PropertyReviewDialog>
            </div>
          </div>
        )}
        <CardContent className="p-1.5">
          <div className="text-xl font-bold hover:underline">{p.title}</div>
          <div className="mt-0.5 text-base capitalize opacity-60">{p.community}</div>
          <div className="mt-1.5 text-sm font-medium">
            {p.price ? `$${parseInt(p.price).toLocaleString()}` : 'Contact for price'}
          </div>
          <div className="mt-1 flex items-center justify-around text-xs opacity-80">
            <div className="flex-col items-center justify-between">
              <div className="text-base">
                <Bed className="mr-1 inline-block h-4 w-4" />
                {p.beds}
              </div>
              <div className="text-xs">Bedrooms</div>
            </div>
            <div className="h-8 border-r border-gray-500"></div>
            <div className="flex-col items-center justify-center">
              <div className="text-base">
                <Bath className="mr-1 inline-block h-4 w-4" />
                {p.baths}
              </div>
              <div className="text-xs">Bathrooms</div>
            </div>
            <div className="h-8 border-r border-gray-500"></div>
            <div className="flex-col items-center justify-center">
              <div className="text-base">
                <Car className="mr-1 inline-block h-4 w-4" />
                {p.garages}
              </div>
              <div className="text-xs">Garages</div>
            </div>
            <div className="h-8 border-r border-gray-500"></div>
            <div className="flex-col items-center justify-center">
              <div className="text-base">
                <Map className="mr-1 inline-block h-4 w-4" />
                {p.sqft}
              </div>
              <div className="text-xs">SQFT</div>
            </div>
          </div>

          {/* Compare Button */}
          <div className="mt-1.5 border-t border-gray-100 pt-1">
            <div className="flex gap-2">
              <div onClick={handleCompareClick} className="flex-1">
                <Button
                  size="sm"
                  variant={isSelected ? 'default' : 'outline'}
                  className={`w-full transition-all text-xs ${
                    isSelected ? 'bg-pne-accent text-white hover:bg-pne-brand' : 'hover:bg-blue-50'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="mr-1 h-3 w-3" />
                      Added to Compare
                    </>
                  ) : (
                    <>
                      <Plus className="mr-1 h-3 w-3" />
                      Add to Compare
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
