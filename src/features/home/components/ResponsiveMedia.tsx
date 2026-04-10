'use client'

import React from 'react'

export function ResponsiveMedia({
  src,
  className,
  style,
  autoPlay = true,
  muted = true,
  loop = true,
  playsInline = true,
}: {
  src: string
  className?: string
  style?: React.CSSProperties
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  playsInline?: boolean
}) {
  const isDrivePreview = /drive\.google\.com\/file\/.*\/preview/.test(src)

  if (isDrivePreview) {
    // Render iframe for Google Drive preview links
    return (
      <iframe
        src={src}
        className={className}
        style={{ border: 0, ...style }}
        allow="autoplay; fullscreen"
        allowFullScreen
      />
    )
  }

  // Fallback to <video> for direct mp4 links
  return (
    <video
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      playsInline={playsInline}
      className={className}
      style={style}
    >
      <source src={src} type="video/mp4" />
    </video>
  )
}
