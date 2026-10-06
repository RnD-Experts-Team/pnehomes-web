'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import MasonryColumns from '@/components/MasonryColumns'
import { driveGridThumb } from '@/features/home/model/url.utils'
import type { GalleryImage } from '@/features/gallery/model/types'

// The image proxy times out fetching from Google when many uncached photos are
// requested at once; a retry moments later succeeds because Google has cached
// the resize by then.
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1500

interface ProjectGalleryProps {
  images: GalleryImage[]
  /** Used only for image alt text. */
  title?: string
}

/**
 * Elegant masonry gallery for a lot's photos (no room dividers), in order.
 *
 * Images keep their natural aspect ratio and flow into balanced columns, so
 * the layout is varied and magazine-like yet has NO ragged gaps at any photo
 * count. The number of columns is capped to the photo count so sparse lots
 * never leave an empty column. Each image keeps the virtual↔real toggle.
 */
export default function ProjectGallery({ images, title }: ProjectGalleryProps) {
  const [states, setStates] = useState<Record<number, 'virtual' | 'real'>>({})
  const [transitioning, setTransitioning] = useState<Record<number, boolean>>({})
  const [loaded, setLoaded] = useState<Set<string>>(new Set())
  const [retries, setRetries] = useState<Record<string, number>>({})
  const pendingRetry = useRef<Set<string>>(new Set())

  const markLoaded = (src: string) =>
    setLoaded(prev => (prev.has(src) ? prev : new Set(prev).add(src)))

  const scheduleRetry = (src: string) => {
    const attempt = retries[src] ?? 0
    if (attempt >= MAX_RETRIES || pendingRetry.current.has(src)) return
    pendingRetry.current.add(src)
    setTimeout(() => {
      pendingRetry.current.delete(src)
      setRetries(prev => ({ ...prev, [src]: (prev[src] ?? 0) + 1 }))
    }, RETRY_DELAY_MS * (attempt + 1))
  }

  const hasVirtual = (img: GalleryImage) => !!(img.virtual_img && img.virtual_img.trim())
  const hasReal = (img: GalleryImage) => !!(img.real_img && img.real_img.trim())
  const hasValid = (img: GalleryImage) => hasVirtual(img) || hasReal(img)
  const hasBoth = (img: GalleryImage) => hasVirtual(img) && hasReal(img)
  // Start on whichever version exists — lots uploaded with only real photos
  // have no virtual image, and defaulting to 'virtual' rendered nothing at all.
  const defaultState = (img: GalleryImage): 'virtual' | 'real' => (hasVirtual(img) ? 'virtual' : 'real')

  const validImages = images.filter(hasValid)

  const toggle = (index: number) => {
    setTransitioning(prev => ({ ...prev, [index]: true }))
    setTimeout(() => {
      setStates(prev => ({ ...prev, [index]: prev[index] === 'real' ? 'virtual' : 'real' }))
      setTimeout(() => setTransitioning(prev => ({ ...prev, [index]: false })), 50)
    }, 200)
  }

  const currentSrc = (img: GalleryImage, index: number): string => {
    const state = states[index] || defaultState(img)
    const url = state === 'real' && img.real_img ? img.real_img : img.virtual_img
    // Same-origin /_next/image URL: a lot can have 60+ photos, and loading
    // them straight from lh3.googleusercontent.com gets throttled (429).
    return url && url.trim() ? driveGridThumb(url) || url : ''
  }
  const toggleLabel = (img: GalleryImage, index: number) =>
    (states[index] || defaultState(img)) === 'real' ? 'View Virtual Image' : 'View Real Image'

  if (validImages.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">No images available for this project yet.</p>
      </div>
    )
  }

  // MasonryColumns caps columns to the photo count, so 1–2 photos never leave
  // an empty column; 3 photos get 3 columns from sm up.
  const columns =
    validImages.length === 3 ? { base: 2, sm: 3 } : { base: 2, md: 3, lg: 4 }

  return (
    <MasonryColumns
      items={validImages}
      columns={columns}
      className="gap-4 sm:gap-5"
      renderItem={(image, index) => {
        const src = currentSrc(image, index)
        if (!src) return null
        const isLoaded = loaded.has(src)
        const attempt = retries[src] ?? 0
        const requestSrc = attempt ? `${src}&r=${attempt}` : src
        return (
          <figure
            key={index}
            // Until the photo loads, hold a 4:3 box. A zero-height <img> makes
            // lazy loading treat every tile as on-screen and fetch all at once.
            className={`group relative mb-4 overflow-hidden rounded-2xl bg-gray-100 shadow-sm ring-1 ring-black/5 transition-shadow duration-300 hover:shadow-xl sm:mb-5 ${
              isLoaded ? '' : 'aspect-[4/3]'
            }`}
          >
            {!isLoaded && <Skeleton className="absolute inset-0 h-full w-full rounded-none" />}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={requestSrc}
              alt={title ? `${title} — photo ${index + 1}` : `Project photo ${index + 1}`}
              loading="lazy"
              // Catches photos that finished (or failed) before hydration
              // attached onLoad/onError.
              ref={el => {
                if (!el || !el.complete || isLoaded) return
                if (el.naturalWidth > 0) markLoaded(src)
                else scheduleRetry(src)
              }}
              onLoad={() => markLoaded(src)}
              onError={() => scheduleRetry(src)}
              className={`transition-all duration-500 ease-in-out group-hover:scale-[1.03] ${
                isLoaded ? 'block h-auto w-full' : 'absolute inset-0 h-full w-full object-cover'
              } ${transitioning[index] || !isLoaded ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
            />

            {/* Depth gradient on hover */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            {/* Virtual ↔ real toggle — only when there's another version to switch to */}
            {hasBoth(image) && (
              <figcaption className="absolute inset-0 flex items-end justify-center p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <Button
                  onClick={() => toggle(index)}
                  variant="secondary"
                  size="sm"
                  disabled={transitioning[index]}
                  className="bg-white/90 text-black shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-white"
                >
                  {toggleLabel(image, index)}
                </Button>
              </figcaption>
            )}
          </figure>
        )
      }}
    />
  )
}
