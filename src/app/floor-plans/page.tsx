// src/app/floor-plans/page.tsx

import { getFloorPlansPageData } from '@/features/property/api'
import FloorPlansExplorer from '@/features/property/components/FloorPlansExplorer'
import HeroSection from '@/features/property/components/HeroSection'
import { getGlobalSubtitle } from '@/lib/global-subtitle'

// ISR: serve from cache, refresh in the background (see src/lib/cms.ts).
export const revalidate = 60

export default async function Page() {
  // One request returns everything: title, cover, the full (small) property
  // catalog, and the community list. The client filters/paginates in memory,
  // so no further round-trips happen when the user changes a filter.
  const [pageData, subtitle] = await Promise.all([getFloorPlansPageData(), getGlobalSubtitle()])

  return (
    <div className="relative min-h-full">
      {/* Hero / Title */}
      <div className="relative z-0">
        {pageData.cover && (
          <HeroSection
            coverImage={pageData.cover}
            coverImageType={pageData.cover_type}
            pageTitle={pageData.title}
            subtitle={subtitle}
          />
        )}
      </div>

      {/* Interactive, client-side filtered results */}
      <div className="relative z-10 min-h-full bg-white">
        <FloorPlansExplorer
          initialProperties={pageData.properties}
          communities={pageData.communities}
        />
      </div>
    </div>
  )
}
