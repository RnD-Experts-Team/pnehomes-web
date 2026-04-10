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
    // CSS object-fit has no effect on iframes. Wrap the iframe in a <div>
    // that inherits the caller's positioning / sizing classes and clips
    // overflow. When "object-cover" was requested we scale the iframe so
    // the Drive player's letter-box bars fall outside the visible area.
    const wantsCover = /\bobject-cover\b/.test(className ?? '')

    const wrapperCls = (className ?? '')
      .replace(/\bobject-(cover|contain|fill|none|scale-down)\b/g, '')
      .replace(/\bobject-(center|top|bottom|left|right)\b/g, '')
      .trim()

    // The iframe uses absolute positioning; ensure the wrapper is a
    // positioned element so the iframe is contained within it.
    const needsRelative =
      !/\b(absolute|relative|fixed|sticky)\b/.test(wrapperCls)

    return (
      <div
        className={`${wrapperCls}${needsRelative ? ' relative' : ''} overflow-hidden`}
        style={style}
      >
        <iframe
          src={src}
          className="absolute inset-0 h-full w-full border-0"
          style={
            wantsCover
              ? { transform: 'scale(1.2)', transformOrigin: 'center center' }
              : undefined
          }
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      </div>
    )
  }

  // <video> natively supports object-fit — className is passed through as-is
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
