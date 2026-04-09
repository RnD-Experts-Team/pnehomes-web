'use client'

import React from 'react'
import { CmsMedia } from '@/components/CmsMedia'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, ArrowRight } from 'lucide-react'
import { useComparison } from '@/contexts/ComparisonContext'

export default function ComparisonDrawer() {
  const router = useRouter()
  const pathname = usePathname()
  const {
    selectedProperties,
    removeFromComparison,
    clearComparison,
    isDrawerOpen,
    setIsDrawerOpen,
  } = useComparison()

  // Only show the drawer on specific routes: /floor-plans, /property/[slug], and /compare
  const allowedRoutes = ['/floor-plans', '/property/', '/compare']
  const isOnAllowedRoute = allowedRoutes.some(route => pathname.startsWith(route))

  const handleCompare = () => {
    if (selectedProperties.length >= 2) {
      const propertyIds = selectedProperties.map(p => p.id).join(',')
      router.push(`/compare?properties=${propertyIds}`)
    }
  }

  // Don't render the drawer if not on allowed routes
  if (!isOnAllowedRoute) {
    return null
  }

  return (
    <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between m-0 p-0">
            Compare Properties ({selectedProperties.length})
            {selectedProperties.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearComparison}
                className="text-red-600 hover:bg-red-50 hover:text-red-700 mr-5"
              >
                Clear All
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {selectedProperties.length === 0 ? (
            <div className="py-8 text-center">
              <p className="mb-2 text-gray-500">No properties selected</p>
              <p className="text-sm text-gray-400">
                Click &ldquo;Add to Compare&rdquo; on property cards to start comparing
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedProperties.map(property => (
                <Card key={property.id} className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromComparison(property.id)}
                    className="absolute top-2 right-2 z-10 h-6 w-6 p-0 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  <CardContent className="p-3">
                    <div className="flex gap-3">
                      <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded">
                        <CmsMedia
                          src={property.gallery[0] ?? '/img/placeholder.jpg'}
                          mediaType={property.gallery_types?.[0]}
                          alt={property.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/property/${property.slug}`}
                          className="line-clamp-2 text-sm font-medium hover:text-blue-600"
                        >
                          {property.title}
                        </Link>
                        <p className="mt-1 text-xs text-gray-500 capitalize">
                          {property.community}
                        </p>
                        <div className="mt-1 text-xs text-gray-600">
                          {property.beds} bd • {property.baths} ba •{' '}
                          {parseInt(property.sqft).toLocaleString()} sqft
                        </div>
                        <div className="mt-1 text-sm font-medium text-green-600">
                          {property.price
                            ? `$${parseInt(property.price).toLocaleString()}`
                            : 'Contact for price'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {selectedProperties.length > 0 && (
          <SheetFooter className="border-t pt-4">
            <div className="w-full space-y-2">
              {selectedProperties.length < 2 && (
                <p className="text-center text-xs text-gray-500">
                  Add at least 2 properties to compare
                </p>
              )}
              <Button
                onClick={handleCompare}
                disabled={selectedProperties.length < 2}
                className="w-full"
                size="lg"
              >
                Compare Properties ({selectedProperties.length})
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
