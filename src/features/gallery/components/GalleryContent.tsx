'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CmsMedia } from '@/components/CmsMedia'
import ImageLightbox from '@/components/ImageLightbox'
import { Skeleton } from '@/components/ui/skeleton'
import { driveGridThumb } from '@/features/home/model/url.utils'
import { GalleryImage, MediaType } from '../model/types'

interface GalleryContentProps {
  images: GalleryImage[]
  albumTitle?: string
}

interface ImageState {
  [key: number]: 'virtual' | 'real'
}

interface TransitionState {
  [key: number]: boolean
}

export default function GalleryContent({ images, albumTitle }: GalleryContentProps) {
  const [imageStates, setImageStates] = useState<ImageState>({})
  const [isTransitioning, setIsTransitioning] = useState<TransitionState>({})
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const [lightboxAlt, setLightboxAlt] = useState<string | undefined>(undefined)
  // Tracks which image URLs have finished loading, so each tile can reserve a
  // fixed-height skeleton box until then instead of collapsing to 0 height
  // (a plain <img> has no intrinsic size before it loads).
  const [loadedSrcs, setLoadedSrcs] = useState<Set<string>>(new Set())

  const markLoaded = (src: string) => {
    setLoadedSrcs(prev => (prev.has(src) ? prev : new Set(prev).add(src)))
  }

  const toggleImage = (index: number) => {
    setIsTransitioning(prev => ({ ...prev, [index]: true }))

    setTimeout(() => {
      setImageStates(prev => ({
        ...prev,
        [index]: prev[index] === 'real' ? 'virtual' : 'real',
      }))

      setTimeout(() => {
        setIsTransitioning(prev => ({ ...prev, [index]: false }))
      }, 50)
    }, 200)
  }

  const hasVirtualImage = (image: GalleryImage): boolean => {
    return !!(image.virtual_img && image.virtual_img.trim() !== '')
  }

  const hasRealImage = (image: GalleryImage): boolean => {
    return !!(image.real_img && image.real_img.trim() !== '')
  }

  const hasValidImage = (image: GalleryImage): boolean => {
    return hasVirtualImage(image) || hasRealImage(image)
  }

  const hasBothImages = (image: GalleryImage): boolean => {
    return hasVirtualImage(image) && hasRealImage(image)
  }

  // Default to whichever image type actually exists; prefer virtual when both are present.
  const getDefaultState = (image: GalleryImage): 'virtual' | 'real' => {
    return hasVirtualImage(image) ? 'virtual' : 'real'
  }

  const getCurrentImage = (image: GalleryImage, index: number): string => {
    const state = imageStates[index] || getDefaultState(image)
    const imageUrl = state === 'real' && image.real_img ? image.real_img : image.virtual_img

    // Return null placeholder if URL is empty or invalid
    return imageUrl && imageUrl.trim() !== '' ? imageUrl : '/placeholder-image.jpg'
  }

  const getCurrentMediaType = (image: GalleryImage, index: number): MediaType => {
    const state = imageStates[index] || getDefaultState(image)
    return state === 'real' && image.real_img ? image.real_img_type : image.virtual_img_type
  }

  const getToggleLabel = (image: GalleryImage, index: number) => {
    const state = imageStates[index] || getDefaultState(image)
    return state === 'real' ? 'View Virtual Image' : 'View Real Image'
  }

  // Filter out images with no valid URLs
  const validImages = images.filter(hasValidImage)

  console.log('[GalleryContent] Rendering:', {
    totalImages: images.length,
    validImages: validImages.length,
    albumTitle,
  })

  if (validImages.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No valid images available in this gallery.</p>
      </div>
    )
  }

  return (
    <>
      {/* Pinterest-style masonry: each tile keeps the image's own aspect ratio
          instead of being cropped into a fixed box. CSS columns lay tiles out
          top-to-bottom per column; `break-inside-avoid` keeps a tile intact. */}
      <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4">
        {validImages.map((image, index) => {
          const currentSrc = getCurrentImage(image, index)
          const currentMediaType = getCurrentMediaType(image, index)
          const alt = albumTitle
            ? `${albumTitle} - Image ${index + 1}`
            : `Gallery image ${index + 1}`
          const isMissing = currentSrc === '/placeholder-image.jpg'
          const isVideo = currentMediaType === 'video'
          const isPreviewable = !isMissing && !isVideo
          const isLoaded = loadedSrcs.has(currentSrc)
          // Reserve a fixed box until the image tells us its real aspect ratio;
          // drop the constraint once loaded so the tile can take its natural size.
          const showSkeleton = isPreviewable && !isLoaded

          return (
            <Card
              key={index}
              className="group mb-6 break-inside-avoid overflow-hidden border-0 p-0 shadow-md transition-all duration-300 hover:shadow-lg"
            >
              <CardContent className="p-0">
                <div
                  className={`relative overflow-hidden ${isMissing || showSkeleton ? 'aspect-[4/3]' : ''} ${isPreviewable ? 'cursor-pointer' : ''}`}
                  onClick={() => {
                    if (isPreviewable) {
                      setLightboxSrc(currentSrc)
                      setLightboxAlt(alt)
                    }
                  }}
                >
                  {isMissing ? (
                    <div className="flex items-center justify-center w-full h-full bg-gray-200">
                      <p className="text-gray-400 text-sm">Image not available</p>
                    </div>
                  ) : isVideo ? (
                    // Videos keep the fixed-box thumbnail (no natural dimensions to flow with).
                    <div className="relative aspect-[4/3]">
                      <CmsMedia
                        src={currentSrc}
                        mediaType={currentMediaType}
                        alt={alt}
                        fill
                        className={`object-cover transition-all duration-500 ease-in-out group-hover:scale-105 ${
                          isTransitioning[index] ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                        }`}
                        sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        onError={() => {
                          console.error('[GalleryContent] Image failed to load:', currentSrc)
                        }}
                      />
                    </div>
                  ) : (
                    <>
                      {showSkeleton && (
                        <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
                      )}
                      {/* Plain <img> at its natural size so the tile's height matches
                          whatever aspect ratio was actually uploaded, Pinterest-style.
                          Kept off-flow (absolute, cropped) and invisible until loaded,
                          so it never collapses the layout to 0 height while fetching. */}
                      {/* eslint-disable-next-line @next/next/no-img-element -- natural aspect ratio, not a fixed layout box */}
                      <img
                        src={driveGridThumb(currentSrc) || currentSrc}
                        alt={alt}
                        loading="lazy"
                        onLoad={() => markLoaded(currentSrc)}
                        className={`transition-all duration-500 ease-in-out group-hover:scale-105 ${
                          isLoaded ? 'block w-full h-auto' : 'absolute inset-0 h-full w-full object-cover'
                        } ${
                          isTransitioning[index] || !isLoaded ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                        }`}
                        onError={() => {
                          console.error('[GalleryContent] Image failed to load:', currentSrc)
                        }}
                      />
                    </>
                  )}

                  {/* Overlay for images with both virtual and real versions */}
                  {hasBothImages(image) && !isMissing && (
                    <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20">
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <Button
                          onClick={e => {
                            e.stopPropagation()
                            toggleImage(index)
                          }}
                          variant="secondary"
                          size="sm"
                          className="bg-white/90 text-black shadow-lg hover:bg-white transform transition-all duration-200 hover:scale-105"
                          disabled={isTransitioning[index]}
                        >
                          {getToggleLabel(image, index)}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <ImageLightbox
        open={lightboxSrc !== null}
        onClose={() => setLightboxSrc(null)}
        src={lightboxSrc ?? ''}
        alt={lightboxAlt}
      />
    </>
  )
}
