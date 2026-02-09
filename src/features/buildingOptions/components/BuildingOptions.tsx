'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { getBuildingOptions } from '../api' // async API fetcher
import type { BuildingOptionsData } from '../model/types'
import HeroSection from './HeroSection'

interface BuildingOptionsProps {
  subtitle?: string
}

export default function BuildingOptions({ subtitle }: BuildingOptionsProps) {
  const router = useRouter()

  // Local state for data + loading + error
  const [data, setData] = useState<BuildingOptionsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getBuildingOptions()
        setData(result)
      } catch (err) {
        console.error('Error loading building options:', err)
        setError('Failed to load building options.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleCardClick = (optionId: number) => {
    if (optionId === 1) {
      router.push('/contact/own_land')
    } else {
      router.push('/communities')
    }
  }

  const handleArticleClick = (slug: string) => {
    router.push(`/articles/${slug}`)
  }

  // --- Loading state ---
  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-6 py-16">
          <div className="animate-pulse space-y-6">
            <div className="h-12 w-2/3 rounded bg-muted" />
            <div className="h-6 w-1/2 rounded bg-muted" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="h-80 rounded bg-muted" />
              <div className="h-80 rounded bg-muted" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- Error state ---
  if (error || !data) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-6 py-16 text-center">
          <p className="text-destructive text-lg font-medium">
            {error ?? 'Failed to load building options.'}
          </p>
        </div>
      </div>
    )
  }

  // --- Main render ---
  return (
    <div className="min-h-screen">
      {/* Hero Section with Cover Image */}
      {data.cover && (
        <HeroSection coverImage={data.cover} title={data.title} subtitle={subtitle} />
      )}

      {/* Slogan Section */}
      {data.cover && (
        <section className="relative z-20 bg-background py-8">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-pne-brand text-xl font-medium opacity-90 md:text-2xl lg:text-3xl">
              {data.slogan}
            </h2>
          </div>
        </section>
      )}

      <div className="relative z-20 bg-background px-4 py-16">
        <div className="mx-auto">
          {/* Fallback when no cover image */}
          {!data.cover && (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-foreground text-4xl leading-tight font-bold md:text-6xl lg:text-7xl">
                  {data.slogan}
                </h1>
              </div>

              <div className="mb-16 text-center">
                <h1 className="text-pne-brand text-4xl font-extrabold tracking-tight uppercase sm:text-5xl max-w-[800px] mx-auto break-words">
                  {data.title}
                </h1>
              </div>
            </>
          )}

          {/* Option cards */}
          <div className="mx-auto mb-16 grid max-w-7xl grid-cols-1 gap-6 sm:gap-8 md:max-w-4xl md:grid-cols-2 lg:max-w-6xl">
            {data.options.map(option => (
              <Card
                key={option.id}
                className="hover:border-primary/50 m-0 w-full cursor-pointer border-2 p-0 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                onClick={() => handleCardClick(option.id)}
              >
                <CardContent className="p-0">
                  <div className="relative h-48 w-full overflow-hidden rounded-t-xl sm:h-56 md:h-64 lg:h-80 xl:h-96">
                    <Image
                      src={option.section_img}
                      alt={option.title}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-110"
                      sizes="(min-width: 768px) 50vw, 100vw"
                    />
                  </div>

                  <div className="p-4 sm:p-6 md:p-8">
                    <h3 className="text-foreground mb-2 text-lg font-semibold sm:mb-3 sm:text-xl md:text-2xl">
                      {option.title}
                    </h3>

                    {option.description && (
                      <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                        {option.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Articles Section */}
          {data.articles?.articles?.length > 0 && (
            <div className="mx-auto max-w-4xl">
              <div className="mb-8 text-center">
                <h3 className="text-foreground mb-2 text-2xl font-bold md:text-3xl">
                  Featured Articles
                </h3>
                <p className="text-muted-foreground">
                  Discover more about our building process and expertise
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {data.articles.articles.map(article => (
                  <Card
                    key={article.id}
                    className="hover:border-primary/50 cursor-pointer border transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    onClick={() => handleArticleClick(article.slug)}
                  >
                    <CardContent className="p-0">
                      <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
                        <Image
                          src={article.img}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-110"
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        />
                      </div>

                      <div className="p-4">
                        <h4 className="text-foreground mb-2 line-clamp-2 text-lg font-semibold">
                          {article.title}
                        </h4>

                        {article.description && (
                          <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
                            {article.description}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
