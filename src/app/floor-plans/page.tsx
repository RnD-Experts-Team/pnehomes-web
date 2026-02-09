// src/floor-plans/page.tsx

import * as Property from '@/features/property/api'
import PropertyCard from '@/features/property/components/PropertyCard'
import FilterBar from '@/features/property/components/FilterBar'
import { toNum } from '@/lib/url'
import HeroSection from '@/features/property/components/HeroSection'
import { getGlobalSubtitle } from '@/lib/global-subtitle'

// Always fetch fresh data from the API (no Next cache snapshot)
export const dynamic = 'force-dynamic'

type SP = Record<string, string | string[] | undefined>

function buildQueryString(
  searchParams: SP,
  overrides: Record<string, string | number | undefined>
) {
  // keep existing params except "page" (we override it)
  const baseEntries = Object.entries(searchParams)
    .filter(([key]) => key !== 'page')
    .flatMap(([key, value]) => {
      // normalize only string values
      if (typeof value === 'string') return [[key, value]]
      // if it's an array, pick the first value (or join, depending on your use case)
      if (Array.isArray(value)) return [[key, value[0]]]
      // skip undefined
      return []
    })

  // stringify override values and merge
  const overrideEntries = Object.entries(overrides)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => [k, String(v as string | number)])

  const merged = Object.fromEntries([...baseEntries, ...overrideEntries]) as Record<string, string>

  return new URLSearchParams(merged).toString()
}

function getWindowedPages(current: number, total: number) {
  // Compact pagination: 1 … 4 5 [6] 7 8 … 20
  const delta = 2
  const pages: (number | '...')[] = []
  const set = new Set<number>([1, total])

  for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
    set.add(i)
  }

  const sorted = Array.from(set).sort((a, b) => a - b)
  for (let i = 0; i < sorted.length; i++) {
    const page = sorted[i]
    pages.push(page)
    const next = sorted[i + 1]
    if (next && next - page > 1) pages.push('...')
  }
  return pages
}

export default async function Page({ searchParams }: { searchParams: SP }) {
  const params = {
    community: typeof searchParams.community === 'string' ? searchParams.community : undefined,
    price: toNum(searchParams.price),
    beds: toNum(searchParams.beds),
    baths: toNum(searchParams.baths),
    garages: toNum(searchParams.garages),
    min: toNum(searchParams.min),
    max: toNum(searchParams.max),
    page: toNum(searchParams.page) || 1,
    limit: 9,
  }

  // With the HTTP-backed repo:
  // - list(params) returns just this page of items (already filtered/sorted on the server)
  // - getTotalFilteredCount(params) reads pagination.total (fallbacks if absent)
  const [list, totalCount, coverImage, pageTitle, subtitle] = await Promise.all([
    Property.list(params),
    Property.getTotalFilteredCount(params),
    Property.getCoverImage(),
    Property.getPageTitle(),
    getGlobalSubtitle(),
  ])

  const totalPages = Math.max(1, Math.ceil(totalCount / params.limit))
  const currentPage = Math.min(Math.max(1, params.page), totalPages)
  const pages = getWindowedPages(currentPage, totalPages)

  return (
    <div className="relative min-h-full">
      {/* Hero / Title - Limited parallax container */}
      <div className="relative z-0">
        {coverImage && <HeroSection coverImage={coverImage} pageTitle={pageTitle} subtitle={subtitle} />}
      </div>

      {/* Content sections with solid backgrounds to cover parallax */}
      <div className="relative z-10 bg-white min-h-full">
        {/* Filter bar */}
        <section className="border-y bg-white">
          <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6">
            <FilterBar />
          </div>
        </section>

        {/* Results summary */}
        <section className="container mx-auto px-6 bg-white pb-16">
          <p className="pt-6 mb-4 text-sm text-gray-600">
            Showing <span className="font-medium">{list.length}</span> of{' '}
            <span className="font-medium">{totalCount}</span> result{totalCount === 1 ? '' : 's'}
          </p>

          {/* Cards grid */}
          <div className="my-2 grid gap-6 px-1 sm:px-0 sm:grid-cols-2 lg:grid-cols-3 lg:px-10">
          {list.map(p => (
            <div
              key={p.id}
              className="group overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md"
            >
              <PropertyCard p={p} />
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav
            aria-label="Pagination"
            className="mx-auto mt-10 mb-16 flex items-center justify-center gap-2"
          >
            {/* Prev */}
            {currentPage > 1 && (
              <a
                href={`/floor-plans?${buildQueryString(searchParams, { page: currentPage - 1 })}`}
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <span aria-hidden="true">‹</span>
                <span className="hidden sm:inline">Previous</span>
              </a>
            )}

            {/* Numbered pages with ellipses */}
            <div className="flex items-center gap-2">
              {pages.map((pg, idx) =>
                pg === '...' ? (
                  <span key={`dots-${idx}`} className="select-none px-3 py-2 text-sm text-gray-400">
                    …
                  </span>
                ) : (
                  <a
                    key={pg}
                    href={`/floor-plans?${buildQueryString(searchParams, { page: pg })}`}
                    aria-current={pg === currentPage ? 'page' : undefined}
                    className={[
                      'inline-flex min-w-10 items-center justify-center rounded-full border px-3 py-2 text-sm font-medium',
                      pg === currentPage
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-50',
                    ].join(' ')}
                  >
                    {pg}
                  </a>
                )
              )}
            </div>

            {/* Next */}
            {currentPage < totalPages && (
              <a
                href={`/floor-plans?${buildQueryString(searchParams, { page: currentPage + 1 })}`}
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <span className="hidden sm:inline">Next</span>
                <span aria-hidden="true">›</span>
              </a>
            )}
          </nav>)}
        </section>
      </div>
    </div>
  )
}
