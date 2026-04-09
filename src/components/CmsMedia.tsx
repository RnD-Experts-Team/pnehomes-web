'use client'

import Image from 'next/image'
import { ResponsiveMedia } from '@/features/home/components/ResponsiveMedia'
import {
  normalizeDriveImageUrl,
  normalizeDriveCoverImage,
  normalizeDriveVideoUrl,
} from '@/features/home/model/url.utils'

export type MediaType = 'image' | 'video' | null

interface CmsMediaProps {
  src: string
  mediaType?: MediaType
  alt: string
  fill?: boolean
  className?: string
  sizes?: string
  priority?: boolean
  quality?: number
  width?: number
  height?: number
  /** Use w4096 for hero/background images instead of w1024 */
  isCover?: boolean
  /** Props forwarded to ResponsiveMedia when rendering video */
  videoProps?: {
    autoPlay?: boolean
    muted?: boolean
    loop?: boolean
    playsInline?: boolean
  }
  onError?: () => void
  style?: React.CSSProperties
}

export function CmsMedia({
  src,
  mediaType,
  alt,
  fill,
  className,
  sizes,
  priority,
  quality,
  width,
  height,
  isCover = false,
  videoProps,
  onError,
  style,
}: CmsMediaProps) {
  if (!src || src.trim() === '') {
    return null
  }

  if (mediaType === 'video') {
    const videoSrc = normalizeDriveVideoUrl(src)
    return (
      <ResponsiveMedia
        src={videoSrc}
        className={className}
        autoPlay={videoProps?.autoPlay ?? true}
        muted={videoProps?.muted ?? true}
        loop={videoProps?.loop ?? true}
        playsInline={videoProps?.playsInline ?? true}
      />
    )
  }

  // For images (or null/undefined type), normalize the URL
  const normalizedSrc = isCover
    ? normalizeDriveCoverImage(src)
    : normalizeDriveImageUrl(src)

  const imgSrc = normalizedSrc || src || '/img/placeholder.jpg'

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      quality={quality}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      onError={onError}
      style={style}
    />
  )
}
