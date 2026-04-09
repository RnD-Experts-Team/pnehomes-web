'use client'

import * as React from 'react'
import { CmsMedia } from '@/components/CmsMedia'
import Link from 'next/link'
import type { Property } from '../model/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { Eye, Bed, Bath, Map, Car } from 'lucide-react'

interface PropertyReviewDialogProps {
  property: Property
  children: React.ReactNode
}

export default function PropertyReviewDialog({ property, children }: PropertyReviewDialogProps) {
  const gallery = Array.isArray(property.gallery) && property.gallery.length > 0 ? property.gallery : []

  const formatPrice = (price?: string) => {
    return price ? `$${parseInt(price).toLocaleString()}` : 'Contact for price'
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      {/* Keep the dialog sized to the viewport and let internal areas manage their own height.
          Use svh to avoid mobile browser UI jumps. */}
      <DialogContent className="!max-w-[90vw] lg:!max-w-[75vw] w-full max-h-[95svh] overflow-hidden p-0">
        <div className="flex flex-col h-full">
          <DialogHeader className="p-4 lg:p-6 pb-2 lg:pb-4">
            <DialogTitle className="text-xl font-semibold"></DialogTitle>
          </DialogHeader>

          {/* Body: two columns on lg+, single column on mobile.
              The grid itself can scroll if content exceeds the dialog height. */}
          <div className="grid flex-1 min-h-0 grid-cols-1 gap-4 lg:gap-6 overflow-y-auto p-4 lg:p-6 pt-0 lg:grid-cols-[3fr_1fr]">
            {/* Left side - Image Carousel */}
            {gallery.length > 0 && (
              <div className="space-y-4">
                {/* Strict, consistent aspect ratios for perfect fit across breakpoints.
                   Remove conflicting h/max-h so the ratio box governs height. */}
                <Carousel className="w-full">
                  <CarouselContent>
                    {gallery.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="relative w-full overflow-hidden rounded-lg aspect-[16/9] lg:aspect-[4/3]">
                          <CmsMedia
                            src={image}
                            mediaType={property.gallery_types?.[index]}
                            alt={`${property.title} - Image ${index + 1}`}
                            fill
                            sizes="(min-width: 1024px) 60vw, 90vw"
                            priority={index === 0}
                            className="object-cover"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>

                  {gallery.length > 1 && (
                    <>
                      <CarouselPrevious className="left-2" />
                      <CarouselNext className="right-2" />
                    </>
                  )}
                </Carousel>

                {gallery.length > 1 && (
                  <p className="text-muted-foreground text-center text-sm">
                    {gallery.length} photos available
                  </p>
                )}
              </div>
            )}

            {/* Right side - Property Information */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-3">
                <div className="text-2xl font-bold hover:underline">{property.title}</div>
                <div className="mt-1 text-lg capitalize opacity-60">{property.community}</div>
                <div className="mt-2 text-base font-medium">
                  {property.price ? formatPrice(property.price) : 'Contact for price'}
                </div>

                <div className="mt-1 flex items-center justify-between text-sm opacity-80">
                  <div className="flex-col items-center justify-between">
                    <div className="text-lg">
                      <Bed className="mr-1 inline-block h-5 w-5" />
                      {property.beds}
                    </div>
                    <div className="text-xs">Bedrooms</div>
                  </div>

                  <div className="flex-col items-center justify-center">
                    <div className="text-lg">
                      <Bath className="mr-1 inline-block h-5 w-5" />
                      {property.baths}
                    </div>
                    <div className="mt-1 flex items-center justify-around text-sm opacity-80">
                      <div className="text-xs">Bathrooms</div>
                    </div>
                  </div>
                </div>

                <div className="mt-1 flex items-center justify-between text-sm opacity-80">
                  <div className="flex-col items-center justify-center">
                    <div className="text-lg">
                      <Car className="mr-1 inline-block h-5 w-5" />
                      {property.garages}
                    </div>
                    <div className="text-xs">Garages</div>
                  </div>

                  <div className="flex-col items-center justify-center">
                    <div className="text-lg">
                      <Map className="mr-1 inline-block h-5 w-5" />
                      {property.sqft}
                    </div>
                    <div className="text-xs">SQFT</div>
                  </div>
                </div>
              </div>

              {/* Show More Button */}
              <div className="border-t pt-4">
                <Button asChild className="bg-pne-accent w-full text-white" size="lg">
                  <Link href={`/property/${property.slug}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Show More Details
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
