'use client'

import { notFound, useRouter } from 'next/navigation'
import { CmsMedia } from '@/components/CmsMedia'
import { use, useEffect, useState } from 'react'
import { getBuildingOptions, getArticleBySlug } from '@/features/buildingOptions/api'
import { Button } from '@/components/ui/button'
import type { BuildingOptionsData, Article } from '@/features/buildingOptions/model/types'

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const router = useRouter()
  const { slug } = use(params)

  // State for async data loading
  const [article, setArticle] = useState<Article | null>(null)
  const [buildingOptionsData, setBuildingOptionsData] = useState<BuildingOptionsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Load building options data first to populate the cache
        const buildingOptions = await getBuildingOptions()
        setBuildingOptionsData(buildingOptions)

        // Then get the specific article
        const articleData = await getArticleBySlug(slug)
        if (!articleData) {
          notFound()
          return
        }

        setArticle(articleData)
      } catch (err) {
        console.error('Error loading article data:', err)
        setError('Failed to load article data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [slug])

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen">
        <div className="container mx-auto px-6 py-16">
          <div className="animate-pulse space-y-6">
            <div className="bg-muted mx-auto h-12 w-2/3 rounded" />
            <div className="bg-muted mx-auto h-6 w-1/2 rounded" />
            <div className="bg-muted h-64 rounded sm:h-80 md:h-96" />
            <div className="space-y-4">
              <div className="bg-muted h-4 w-full rounded" />
              <div className="bg-muted h-4 w-5/6 rounded" />
              <div className="bg-muted h-4 w-4/5 rounded" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-screen">
        <div className="container mx-auto px-6 py-16 text-center">
          <p className="text-destructive mb-4 text-lg font-medium">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-pne-accent hover:bg-pne-brand text-white"
          >
            Try Again
          </Button>
        </div>
      </main>
    )
  }

  // Data not found
  if (!article || !buildingOptionsData) {
    notFound()
    return null
  }

  const handleBackClick = () => {
    router.back()
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section with Cover Image */}
      {buildingOptionsData.cover && (
        <section className="relative isolate">
          {/* Background image (fixed) */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat md:bg-fixed"
            style={{ backgroundImage: `url(${buildingOptionsData.cover})` }}
          />
          {/* Overlay */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-white/10 to-black/10" />

          {/* Centered content */}
          <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-6 text-center">
            <h1 className="text-pne-brand text-4xl font-extrabold tracking-tight uppercase sm:text-5xl max-w-[800px] mx-auto break-words">
              {article.title}
            </h1>
          </div>
        </section>
      )}

      <section className="bg-background px-3 pb-4 sm:px-4 sm:pb-6 lg:px-6 lg:pb-8">
        <div className="mx-auto max-w-7xl">
          {/* Article Title and Description */}
          <header className="mb-6 px-2 text-center sm:mb-8 sm:px-4 lg:mb-10">
            {article.description && (
              <p className="text-muted-foreground mx-auto mt-3 max-w-4xl text-sm leading-relaxed sm:mt-4 sm:text-base md:text-lg lg:mt-6 lg:text-xl">
                {article.description}
              </p>
            )}
          </header>

          {/* Article Main Image */}
          <figure className="relative mb-6 h-48 w-full overflow-hidden rounded-lg sm:mb-8 sm:h-64 sm:rounded-xl md:h-80 lg:mb-10 lg:h-96 xl:h-[500px]">
            <CmsMedia
              src={article.img}
              mediaType={article.img_type}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 1024px, (min-width: 768px) 768px, 100vw"
              priority
            />
          </figure>

          {/* Article Content */}

          <div className="prose prose-lg max-w-none text-gray-700">
            <article
              className="prose prose-sm sm:prose-base md:prose-lg lg:prose-xl text-foreground mx-auto max-w-none px-2 leading-relaxed sm:px-4 lg:px-6"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>

          {/* Back Button */}
          <footer className="mt-8 flex justify-center px-2 sm:mt-10 sm:px-4 lg:mt-12">
            <Button
              type="button"
              onClick={handleBackClick}
              className="bg-pne-accent hover:bg-pne-brand w-full text-sm font-medium text-white shadow-md sm:w-auto sm:text-base lg:text-lg"
              size="lg"
              aria-label="Back to Building Options"
            >
              ← Back to Building Options
            </Button>
          </footer>
        </div>
      </section>
    </main>
  )
}
