'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import { Gallery, Item } from 'react-photoswipe-gallery'
import 'photoswipe/style.css'
import { Badge } from '@/components/ui/badge'
import { CmsMedia, type MediaType } from '@/components/CmsMedia'
import { ResponsiveMedia } from '@/features/home/components/ResponsiveMedia'
import { normalizeDriveVideoUrl } from '@/features/home/model/url.utils'
import type React from 'react'

interface ImageGalleryProps {
  images: string[]
  imageTypes?: (MediaType)[]
  title: string
  maxVisibleImages?: number
}

/** --- helpers to keep refs typed (no `any`) --- */
type PswpRef = React.MutableRefObject<HTMLElement | null> | ((el: HTMLElement | null) => void)
const adaptRef = <T extends HTMLElement>(r: PswpRef): React.Ref<T> =>
  r as unknown as React.Ref<T>
/** ------------------------------------------- */

const normalizeGoogleUrl = (u: string): string => {
  const m1 = u.match(/https?:\/\/lh3\.googleusercontent\.com\/d\/([^/?#]+)/i)
  if (m1?.[1]) return `https://lh3.googleusercontent.com/d/${m1[1]}=s0`

  const m2 = u.match(/https?:\/\/drive\.google\.com\/file\/d\/([^/]+)/i)
  if (m2?.[1]) return `https://drive.google.com/uc?export=view&id=${m2[1]}`

  return u
}

// PhotoSwipe options (unchanged)
const galleryOptions = {
  wheelToZoom: true,
  zoom: true,
  pswpModule: () => import('photoswipe'),
}

type LightboxContentProps = {
  src: string
  alt: string
  mediaType?: MediaType
}

function LightboxContent({ src, alt, mediaType }: LightboxContentProps) {
  if (mediaType === 'video') {
    const videoSrc = normalizeDriveVideoUrl(src)
    return (
      <div className="relative h-full w-full bg-black flex items-center justify-center">
        <ResponsiveMedia src={videoSrc} className="w-full h-full object-contain" />
      </div>
    )
  }

  const normalized = normalizeGoogleUrl(src)

  return (
    <div className="relative h-full w-full bg-black">
      <Image
        src={normalized}
        alt={alt}
        fill
        className="object-contain"
        sizes="100vw"
        priority={false}
      />
    </div>
  )
}

export default function ImageGallery({
  images,
  imageTypes,
  title,
  maxVisibleImages = 3,
}: ImageGalleryProps) {
  const total = images.length

  const visible = useMemo(
    () => images.slice(0, maxVisibleImages),
    [images, maxVisibleImages]
  )

  const hidden = useMemo(
    () => images.slice(maxVisibleImages),
    [images, maxVisibleImages]
  )

  const remaining = Math.max(0, total - maxVisibleImages)

  if (!total) return null

  return (
    <Gallery withCaption options={galleryOptions}>
      {/* Pre-register hidden slides so lightbox can navigate to them */}
      {hidden.map((src, i) => (
        <Item
          key={`hidden-${i}`}
          content={<LightboxContent src={src} alt={title} mediaType={imageTypes?.[maxVisibleImages + i]} />}
        >
          {({ ref }) => (
            <span
              ref={adaptRef<HTMLSpanElement>(ref as PswpRef)}
              style={{ display: 'none' }}
            />
          )}
        </Item>
      ))}

      <div>
        {/* Main image (layout same as before) */}
        {visible[0] && (
          <Item content={<LightboxContent src={visible[0]} alt={title} mediaType={imageTypes?.[0]} />}>
            {({ ref, open }) => (
              <div
                ref={adaptRef<HTMLDivElement>(ref as PswpRef)}
                className="group relative aspect-[16/9] w-full cursor-pointer overflow-hidden rounded-lg"
                onClick={open}
              >
                <CmsMedia
                  src={visible[0]}
                  mediaType={imageTypes?.[0]}
                  alt={title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(min-width:1024px) 66vw, 100vw"
                  priority
                />
              </div>
            )}
          </Item>
        )}

        {/* Thumbnails (layout same as before) */}
        {visible.length > 1 && (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {visible.slice(1).map((src, i, arr) => (
              <Item
                key={`thumb-${i}`}
                content={<LightboxContent src={src} alt={`${title} photo ${i + 2}`} mediaType={imageTypes?.[i + 1]} />}
              >
                {({ ref, open }) => (
                  <div
                    ref={adaptRef<HTMLDivElement>(ref as PswpRef)}
                    className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-md"
                    onClick={open}
                  >
                    <CmsMedia
                      src={src}
                      mediaType={imageTypes?.[i + 1]}
                      alt={`${title} photo ${i + 2}`}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(min-width:1024px) 16vw, 25vw"
                    />

                    {i === arr.length - 1 && remaining > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Badge
                          variant="secondary"
                          className="bg-white/90 font-semibold text-black"
                        >
                          +{remaining} more
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
              </Item>
            ))}
          </div>
        )}
      </div>
    </Gallery>
  )
}
