'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { normalizeDriveImageUrl } from '@/features/home/model/url.utils'
import type { GalleryImage } from '@/features/gallery/model/types'

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

  const hasValid = (img: GalleryImage) =>
    !!(img.virtual_img && img.virtual_img.trim()) || !!(img.real_img && img.real_img.trim())
  const hasReal = (img: GalleryImage) => !!(img.real_img && img.real_img.trim())

  const validImages = images.filter(hasValid)

  const toggle = (index: number) => {
    setTransitioning(prev => ({ ...prev, [index]: true }))
    setTimeout(() => {
      setStates(prev => ({ ...prev, [index]: prev[index] === 'real' ? 'virtual' : 'real' }))
      setTimeout(() => setTransitioning(prev => ({ ...prev, [index]: false })), 50)
    }, 200)
  }

  const currentSrc = (img: GalleryImage, index: number): string => {
    const state = states[index] || 'virtual'
    const url = state === 'real' && img.real_img ? img.real_img : img.virtual_img
    return url && url.trim() ? normalizeDriveImageUrl(url) : ''
  }
  const toggleLabel = (index: number) =>
    states[index] === 'real' ? 'View Virtual Image' : 'View Real Image'

  if (validImages.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">No images available for this project yet.</p>
      </div>
    )
  }

  // Cap columns to the photo count so few photos never leave an empty column.
  const n = validImages.length
  const colClass =
    n <= 1
      ? 'columns-1'
      : n === 2
        ? 'columns-2'
        : n === 3
          ? 'columns-2 sm:columns-3'
          : 'columns-2 md:columns-3 lg:columns-4'

  return (
    <div className={`${colClass} [column-gap:1rem] sm:[column-gap:1.25rem]`}>
      {validImages.map((image, index) => {
        const src = currentSrc(image, index)
        if (!src) return null
        return (
          <figure
            key={index}
            className="group relative mb-4 break-inside-avoid overflow-hidden rounded-2xl bg-gray-100 shadow-sm ring-1 ring-black/5 transition-shadow duration-300 hover:shadow-xl sm:mb-5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={title ? `${title} — photo ${index + 1}` : `Project photo ${index + 1}`}
              loading="lazy"
              className={`block h-auto w-full object-cover transition-all duration-500 ease-in-out group-hover:scale-[1.03] ${
                transitioning[index] ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
              }`}
            />

            {/* Depth gradient on hover */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            {/* Virtual ↔ real toggle */}
            {hasReal(image) && (
              <figcaption className="absolute inset-0 flex items-end justify-center p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <Button
                  onClick={() => toggle(index)}
                  variant="secondary"
                  size="sm"
                  disabled={transitioning[index]}
                  className="bg-white/90 text-black shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-white"
                >
                  {toggleLabel(index)}
                </Button>
              </figcaption>
            )}
          </figure>
        )
      })}
    </div>
  )
}
