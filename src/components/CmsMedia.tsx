'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ResponsiveMedia } from '@/features/home/components/ResponsiveMedia'
import VideoLightbox from '@/components/VideoLightbox'
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


/**
 * Interactive video tile: a clean poster with a themed play button that opens
 * the video in a centered modal (VideoLightbox).
 *
 * - Direct video (real .mp4): poster is the video's first frame, and the modal
 *   plays it in a native <video> that AUTOPLAYS on open (one click, with sound).
 * - Google Drive video: poster is Drive's thumbnail image, and the modal embeds
 *   Drive's `/preview` iframe (Drive can't be auto-started — one click to play).
 */
function InteractiveVideoTile(props: CmsMediaProps) {
  const [open, setOpen] = useState(false)
  const drive = isDriveUrl(props.src)

  const thumbnailSrc = props.isCover
    ? normalizeDriveCoverImage(props.src)
    : normalizeDriveImageUrl(props.src)
  const imgSrc = thumbnailSrc || props.src || '/img/placeholder.jpg'

  // Self-contained wrapper so the overlay positions relative to THIS element.
  // Branded gradient background so the tile looks intentional while the poster
  // loads (instead of a bare gray box).
  const wrapperClass = props.fill
    ? `absolute inset-0 bg-gradient-to-br from-[color:var(--pne-brand)] to-[color:var(--pne-footer)] ${props.className ?? ''}`
    : `relative w-full h-full bg-gradient-to-br from-[color:var(--pne-brand)] to-[color:var(--pne-footer)] ${props.className ?? ''}`

  return (
    <div className={wrapperClass} style={props.style}>
      {drive ? (
        <Image
          src={imgSrc}
          alt=""
          fill
          className="object-cover"
          sizes={props.sizes}
          priority={props.priority}
          quality={props.quality}
          onError={props.onError}
        />
      ) : (
        // Direct video: show the first frame as the poster (muted, not playing).
        <video
          src={`${props.src}#t=0.1`}
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Play button — opens the video in a clean modal */}
      <button
        type="button"
        aria-label={`Play video: ${props.alt}`}
        onClick={() => setOpen(true)}
        className="group/play absolute inset-0 z-10 flex cursor-pointer items-center justify-center bg-black/25 transition-colors hover:bg-black/35"
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--pne-accent)]/95 text-white shadow-lg backdrop-blur-sm transition-transform duration-200 group-hover/play:scale-110">
          <svg className="ml-1 h-7 w-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </button>

      <VideoLightbox
        open={open}
        onClose={() => setOpen(false)}
        videoSrc={drive ? undefined : props.src}
        iframeSrc={drive ? normalizeDriveVideoUrl(props.src) : undefined}
        title={props.alt}
      />
    </div>
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
    // ---------- Interactive (click-to-play) ----------
    // Poster + play button that opens the video in a clean modal. Works for
    // both direct .mp4 (autoplays in the modal) and Drive (one click in the
    // embedded player). Used by tiles/cards where the video isn't ambient.
    if (videoProps?.autoPlay === false) {
      return (
        <InteractiveVideoTile
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

    // ---------- Google Drive URLs (ambient / autoplay intent) ----------
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
