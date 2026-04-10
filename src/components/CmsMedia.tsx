'use client'

import { useState } from 'react'
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
  /**
   * Force Drive video URLs to render as an actual iframe instead of a
   * static thumbnail. Use this for tiles / sections where the video is
   * the main content and should loop/autoplay (e.g. home-page grid tiles).
   */
  forcePlay?: boolean
  onError?: () => void
  style?: React.CSSProperties
}

/** Check whether a URL points at Google Drive / lh3 (i.e. will become an iframe) */
function isDriveUrl(url: string): boolean {
  return /drive\.google\.com|lh3\.googleusercontent\.com/.test(url)
}

/** Play-button overlay shown on interactive Drive video thumbnails */
function PlayOverlay({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Play video"
      onClick={onClick}
      className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center bg-black/20 transition-colors hover:bg-black/30"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-transform hover:scale-110">
        <svg className="ml-1 h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </button>
  )
}

/**
 * Interactive Drive video player.
 * Renders a thumbnail initially; clicking the play overlay swaps it for the
 * Drive iframe via ResponsiveMedia.
 */
function DriveVideoPlayer(props: CmsMediaProps) {
  const [playing, setPlaying] = useState(false)

  if (playing) {
    const videoSrc = normalizeDriveVideoUrl(props.src)
    const videoClassName = props.fill
      ? `absolute inset-0 h-full w-full ${props.className ?? ''}`
      : props.className
    return (
      <ResponsiveMedia
        src={videoSrc}
        className={videoClassName}
        style={props.style}
        autoPlay
        muted={props.videoProps?.muted ?? true}
        loop={props.videoProps?.loop ?? false}
        playsInline={props.videoProps?.playsInline ?? true}
      />
    )
  }

  const thumbnailSrc = props.isCover
    ? normalizeDriveCoverImage(props.src)
    : normalizeDriveImageUrl(props.src)
  const imgSrc = thumbnailSrc || props.src || '/img/placeholder.jpg'

  return (
    <>
      <Image
        src={imgSrc}
        alt={props.alt}
        fill={props.fill}
        className={props.className}
        sizes={props.sizes}
        priority={props.priority}
        quality={props.quality}
        width={!props.fill ? props.width : undefined}
        height={!props.fill ? props.height : undefined}
        onError={props.onError}
        style={props.style}
      />
      <PlayOverlay onClick={() => setPlaying(true)} />
    </>
  )
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
  forcePlay = false,
  onError,
  style,
}: CmsMediaProps) {
  if (!src || src.trim() === '') {
    return null
  }

  if (mediaType === 'video') {
    // ---------- Google Drive URLs ----------
    // Drive iframes cannot honour CSS object-fit and always show their own
    // player chrome (play button, scrubber, info bar).  For clean layout
    // fitting we render the Drive-generated thumbnail as an <Image> instead.
    if (isDriveUrl(src)) {
      // forcePlay: caller explicitly wants the video to play (e.g. home-page
      // grid ambient tiles). Render the iframe via ResponsiveMedia.
      if (forcePlay) {
        const videoSrc = normalizeDriveVideoUrl(src)
        // Strip object-fit classes — iframes don't support them and
        // ResponsiveMedia would apply a scale(1.2) which over-zooms the video.
        // Just fill the container naturally with overflow-hidden clipping.
        const cleanClass = (className ?? '')
          .replace(/\bobject-(cover|contain|fill|none|scale-down)\b/g, '')
          .trim()
        const videoClassName = fill
          ? `absolute inset-0 h-full w-full ${cleanClass}`
          : cleanClass
        return (
          <ResponsiveMedia
            src={videoSrc}
            className={videoClassName}
            style={style}
            autoPlay={videoProps?.autoPlay ?? true}
            muted={videoProps?.muted ?? true}
            loop={videoProps?.loop ?? true}
            playsInline={videoProps?.playsInline ?? true}
          />
        )
      }

      // Interactive context (autoPlay explicitly false) → show thumbnail
      // with a play overlay; clicking it swaps in the iframe.
      if (videoProps?.autoPlay === false) {
        return (
          <DriveVideoPlayer
            src={src}
            mediaType={mediaType}
            alt={alt}
            fill={fill}
            className={className}
            sizes={sizes}
            priority={priority}
            quality={quality}
            width={width}
            height={height}
            isCover={isCover}
            videoProps={videoProps}
            onError={onError}
            style={style}
          />
        )
      }

      // Non-interactive (default) → render as a plain thumbnail image.
      // This fits perfectly in cards, hero backgrounds, gallery grids, etc.
      const thumbnailSrc = isCover
        ? normalizeDriveCoverImage(src)
        : normalizeDriveImageUrl(src)
      const imgSrc = thumbnailSrc || src || '/img/placeholder.jpg'

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

    // ---------- Direct video URLs (mp4 etc.) ----------
    // <video> natively supports object-fit, so pass through as-is.
    const videoClassName = fill
      ? `absolute inset-0 h-full w-full ${className ?? ''}`
      : className
    return (
      <ResponsiveMedia
        src={src}
        className={videoClassName}
        style={style}
        autoPlay={videoProps?.autoPlay ?? true}
        muted={videoProps?.muted ?? true}
        loop={videoProps?.loop ?? true}
        playsInline={videoProps?.playsInline ?? true}
      />
    )
  }

  // ---------- Image path (unchanged) ----------
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
