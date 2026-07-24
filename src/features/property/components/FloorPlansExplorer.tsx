'use client'
// src/features/property/components/FloorPlansExplorer.tsx

import { useMemo, useState, useDeferredValue, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Property } from '../model/types'
import { applyFiltersAndSort, getTotalCount, type ListParams } from '../model/selectors'
import PropertyCard from './PropertyCard'
import FilterBar, { EMPTY_FILTERS, type FilterValues } from './FilterBar'
import { Button } from '@/components/ui/button'

const PAGE_SIZE = 9

/** Convert UI filter values ("all"/"any"/"") into numeric ListParams for the selectors. */
function toListParams(v: FilterValues): ListParams {
  const num = (s: string) => {
    const n = Number(s)
    return s.trim() !== '' && !Number.isNaN(n) && n > 0 ? n : undefined
  }
  return {
    community: v.community && v.community !== 'all' ? v.community : undefined,
    price: num(v.price),
    beds: v.beds !== 'any' ? num(v.beds) : undefined,
    baths: v.baths !== 'any' ? num(v.baths) : undefined,
    garages: v.garages !== 'any' ? num(v.garages) : undefined,
  }
}

/** Compact pagination window: 1 … 4 5 [6] 7 8 … 20 */
function getWindowedPages(current: number, total: number): (number | '...')[] {
  const delta = 2
  const set = new Set<number>([1, total])
  for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
    set.add(i)
  }
  const sorted = Array.from(set).sort((a, b) => a - b)
  const pages: (number | '...')[] = []
  for (let i = 0; i < sorted.length; i++) {
    pages.push(sorted[i])
    const next = sorted[i + 1]
    if (next && next - sorted[i] > 1) pages.push('...')
  }
  return pages
}

export default function FloorPlansExplorer({
  initialProperties,
  communities,
}: {
  initialProperties: Property[]
  communities: string[]
}) {
  const [filters, setFilters] = useState<FilterValues>(EMPTY_FILTERS)
  const [page, setPage] = useState(1)
  const resultsTopRef = useRef<HTMLDivElement>(null)

  // Defer the filter values so rapid typing in "Max price" stays smooth.
  const deferredFilters = useDeferredValue(filters)
  const listParams = useMemo(() => toListParams(deferredFilters), [deferredFilters])

  const totalCount = useMemo(
    () => getTotalCount(initialProperties, listParams),
    [initialProperties, listParams]
  )
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)

  const pageItems = useMemo(
    () =>
      applyFiltersAndSort(initialProperties, {
        ...listParams,
        page: currentPage,
        limit: PAGE_SIZE,
      }),
    [initialProperties, listParams, currentPage]
  )

  const pages = getWindowedPages(currentPage, totalPages)

  function handleFilterChange(next: FilterValues) {
    setFilters(next)
    setPage(1) // any filter change returns to the first page
  }

  function handleReset() {
    setFilters(EMPTY_FILTERS)
    setPage(1)
  }

  function goToPage(p: number) {
    setPage(p)
    resultsTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      {/* Filter bar */}
      <section className="border-y bg-white">
        <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6">
          <FilterBar
            values={filters}
            communities={communities}
            onChange={handleFilterChange}
            onReset={handleReset}
          />
        </div>
      </section>

      {/* Results */}
      <section className="container mx-auto bg-white px-6 pb-16">
        <div ref={resultsTopRef} className="scroll-mt-24" />

        <p className="mb-4 pt-6 text-sm text-gray-600">
          Showing <span className="font-medium">{pageItems.length}</span> of{' '}
          <span className="font-medium">{totalCount}</span> result{totalCount === 1 ? '' : 's'}
        </p>

        {totalCount === 0 ? (
          <div className="rounded-xl border border-dashed bg-gray-50 py-16 text-center text-gray-500">
            No floor plans match your filters.
            <div className="mt-4">
              <Button variant="outline" onClick={handleReset}>
                Clear filters
              </Button>
            </div>
          </div>
        ) : (
          <motion.div
            layout
            className="my-2 grid gap-6 px-1 sm:grid-cols-2 sm:px-0 lg:grid-cols-3 lg:px-10"
          >
            <AnimatePresence mode="popLayout">
              {pageItems.map((p) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="group overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md"
                >
                  <PropertyCard p={p} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Pagination (client-side, no reload) */}
        {totalPages > 1 && (
          <nav
            aria-label="Pagination"
            className="mx-auto mt-10 mb-16 flex items-center justify-center gap-2"
          >
            {currentPage > 1 && (
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <span aria-hidden="true">‹</span>
                <span className="hidden sm:inline">Previous</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              {pages.map((pg, idx) =>
                pg === '...' ? (
                  <span
                    key={`dots-${idx}`}
                    className="select-none px-3 py-2 text-sm text-gray-400"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => goToPage(pg)}
                    aria-current={pg === currentPage ? 'page' : undefined}
                    className={[
                      'inline-flex min-w-10 items-center justify-center rounded-full border px-3 py-2 text-sm font-medium transition',
                      pg === currentPage
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-50',
                    ].join(' ')}
                  >
                    {pg}
                  </button>
                )
              )}
            </div>

            {currentPage < totalPages && (
              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <span className="hidden sm:inline">Next</span>
                <span aria-hidden="true">›</span>
              </button>
            )}
          </nav>
        )}
      </section>
    </>
  )
}
