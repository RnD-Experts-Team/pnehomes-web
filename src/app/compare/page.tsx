'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CmsMedia } from '@/components/CmsMedia'
import Link from 'next/link'
import * as Property from '@/features/property/api'
import type { Property as PropertyType } from '@/features/property/model/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

// Compare component that uses useSearchParams
function CompareContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [properties, setProperties] = useState<PropertyType[]>([])
  const [loading, setLoading] = useState(true)
  const [coverImage, setCoverImage] = useState<string>('')
  const [coverType, setCoverType] = useState<'image' | 'video' | null>(null)

  useEffect(() => {
    const propertyIds = searchParams.get('properties')
    if (!propertyIds) {
      router.push('/floor-plans')
      return
    }

    const ids = propertyIds
      .split(',')
      .map(id => parseInt(id.trim()))
      .filter(id => !isNaN(id))
    if (ids.length < 2) {
      router.push('/floor-plans')
      return
    }

    // Fetch properties by IDs and cover image
    const fetchData = async () => {
      try {
        const [allProperties, cover, covType] = await Promise.all([
          Property.list({ limit: 1000 }),
          Property.getCoverImage(),
          Property.getCoverType()
        ])
        const selectedProperties = allProperties.filter(p => ids.includes(p.id))
        setProperties(selectedProperties)
        setCoverImage(cover)
        setCoverType(covType)
      } catch (error) {
        console.error('Error fetching data:', error)
        router.push('/floor-plans')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [searchParams, router])

  if (loading) {
    return (
      <main className="relative">
        {/* Hero / Title (clean and bold like pnehomes.com) */}
        <section className="relative isolate">
          {/* Background image (fixed) */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gray-100 bg-cover bg-center bg-no-repeat md:bg-fixed"
          >
            <CmsMedia
              src="/img/services_home.jpg"
              alt="Compare Properties Cover"
              isCover
              fill
              mediaType="image"
              className="object-cover object-center"
              priority
              sizes="100vw"
            />
          </div>
          {/* Overlay */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-white/10 to-black/10" />

          {/* Centered content */}
          <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-6 text-center">
            <h1 className="text-pne-brand text-4xl font-extrabold tracking-tight uppercase sm:text-5xl">
              Compare Properties
            </h1>
          </div>
        </section>

        <div className="container mx-auto p-6">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600 sm:text-base">Loading properties...</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (properties.length < 2) {
    return (
      <main className="relative">
        {/* Hero / Title (clean and bold like pnehomes.com) */}
        <section className="relative isolate">
          {/* Background image (fixed) */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gray-100 bg-cover bg-center bg-no-repeat md:bg-fixed"
          >
            <CmsMedia
              src={coverImage || "/img/services_home.jpg"}
              alt="Compare Properties Cover"
              isCover
              fill
              mediaType={coverType}
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>
          {/* Overlay */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-white/10 to-black/10" />

          {/* Centered content */}
          <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-6 text-center">
            <h1 className="text-pne-brand text-4xl font-extrabold tracking-tight uppercase sm:text-5xl">
              Compare Properties
            </h1>
          </div>
        </section>

        <div className="container mx-auto p-6">
          <div className="py-12 text-center">
            <h2 className="mb-4 text-lg font-bold sm:text-xl md:text-2xl">No Properties to Compare</h2>
            <p className="mb-6 text-sm text-gray-600 sm:text-base">Please select at least 2 properties to compare.</p>
            <Button onClick={() => router.push('/floor-plans')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Floor Plans
            </Button>
          </div>
        </div>
      </main>
    )
  }

  const comparisonFeatures = [
    {
      key: 'price',
      label: 'Price',
      format: (value: string) =>
        value ? `$${parseInt(value).toLocaleString()}` : 'Contact for price',
    },
    { key: 'beds', label: 'Bedrooms' },
    { key: 'baths', label: 'Bathrooms' },
    { key: 'garages', label: 'Garages' },
    {
      key: 'sqft',
      label: 'Square Feet',
      format: (value: string) => `${parseInt(value).toLocaleString()} sqft`,
    },
    {
      key: 'community',
      label: 'Community',
      format: (value: string) => value.charAt(0).toUpperCase() + value.slice(1),
    },
  ]

  return (
    <main className="relative">
      {/* Hero / Title (clean and bold like pnehomes.com) */}
      <section className="relative isolate">
        {/* Background image (fixed) */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gray-100 bg-cover bg-center bg-no-repeat md:bg-fixed"
        >
          <CmsMedia
            src={coverImage}
            alt="Compare Properties Cover"
            isCover
            fill
            mediaType={coverType}
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>
        {/* Overlay */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-white/10 to-black/10" />

        {/* Centered content */}
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-6 text-center">
          <h1 className="text-pne-brand text-4xl font-extrabold tracking-tight uppercase sm:text-5xl max-w-[800px] mx-auto break-words">
            Compare Properties
          </h1>
        </div>
      </section>

      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className='w-full flex-col md:flex md:align-baseline md:justify-between'>
            <Button variant="ghost" onClick={() => router.push('/floor-plans')} className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Floor Plans
            </Button>
            <span className="text-sm text-gray-600 p-2 inline-block md:inline sm:text-base">Side-by-side comparison of {properties.length} properties</span>
          </div>
        </div>

        {/* Property Images */}
        <div
          className={`mb-8 grid gap-6 ${properties.length === 2 ? 'grid-cols-2' : properties.length === 3 ? 'grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'}`}
        >
          {properties.map(property => (
            <Card key={property.id} className="overflow-hidden">
              <div className="relative aspect-[4/3]">
                <CmsMedia
                  src={property.gallery[0] ?? '/img/placeholder.jpg'}
                  mediaType={property.gallery_types?.[0]}
                  alt={property.title}
                  fill
                  className="object-cover"
                  sizes={`${100 / properties.length}vw`}
                />
              </div>
            </Card>
          ))}
        </div>

        {/* Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl md:text-2xl">Property Comparison</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="bg-gray-50 p-2 text-left font-medium text-gray-600 text-xs sm:text-sm md:text-base sm:p-4">Feature</th>
                    {properties.map(property => (
                      <th
                        key={property.id}
                        className="min-w-[200px] bg-gray-50 p-2 text-left font-medium text-xs sm:text-sm md:text-base sm:p-4"
                      >
                        <div className="truncate">{property.title}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, index) => (
                    <tr key={feature.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="border-r p-2 font-medium text-gray-700 text-xs sm:text-sm md:text-base sm:p-4">{feature.label}</td>
                      {properties.map(property => {
                        const value = property[feature.key as keyof PropertyType] as string
                        const displayValue = feature.format ? feature.format(value) : value
                        return (
                          <td key={property.id} className="p-2 text-xs sm:text-sm md:text-base sm:p-4">
                            {displayValue || 'N/A'}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {properties.map(property => (
            <Button key={property.id} asChild className='bg-pne-accent hover:bg-pne-brand text-xs sm:text-sm md:text-base'>
              <Link href={`/property/${property.slug}`}>View {property.title}</Link>
            </Button>
          ))}
        </div>
      </div>
    </main>
  )
}

// Main page component with Suspense wrapper
export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 dark:bg-gray-900">
          <div className="text-sm sm:text-base lg:text-lg">Loading...</div>
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  )
}
