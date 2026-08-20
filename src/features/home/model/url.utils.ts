// src/features/home/model/url.utils.ts

/**
 * Normalizes Google Drive image URLs for regular images (logos, icons, etc.)
 * Uses w1024 for smaller file sizes and faster loading
 */
export function normalizeDriveImageUrl(url: string | null | undefined): string {
  if (!url) return ''

  try {
    const u = new URL(url)

    // Case A: drive.google.com/file/d/<id>/preview or /view
    if (u.hostname === 'drive.google.com') {
      const m = u.pathname.match(/\/file\/d\/([^/]+)/)
      const id = m?.[1]
      if (id) {
        // Convert to lh3.googleusercontent.com format with width parameter
        return `https://lh3.googleusercontent.com/d/${id}=w1024`
      }
    }

    // Case B: lh3.googleusercontent.com/d/<id>
    if (u.hostname === 'lh3.googleusercontent.com') {
      // Remove any existing size parameters first, then add proper width parameter
      const baseUrl = url.split('=')[0]
      return `${baseUrl}=w1024`
    }

    return url
  } catch {
    return url
  }
}

/**
 * Same-origin, Next.js-optimized URL for a Drive-hosted image at a specific
 * width. Use this (instead of a raw lh3.googleusercontent.com URL) for grids
 * that render many thumbnails as plain <img> tags at once — Google throttles
 * bursts of concurrent cross-origin requests to lh3, which shows up as some
 * thumbnails randomly failing to load. Routing through Next's own
 * `/_next/image` endpoint means only the server fetches from Google (once,
 * then cached), and the browser only ever talks to the same origin.
 */
export function driveGridThumb(url: string | null | undefined, width = 750, quality = 75): string {
  const normalized = normalizeDriveImageUrl(url)
  if (!normalized) return ''
  return `/_next/image?url=${encodeURIComponent(normalized)}&w=${width}&q=${quality}`
}

/** Extract the Google Drive file id from any Drive/lh3 URL, or null. */
export function driveFileId(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    if (u.hostname === 'drive.google.com') {
      return u.pathname.match(/\/file\/d\/([^/]+)/)?.[1] ?? u.searchParams.get('id')
    }
    if (u.hostname === 'lh3.googleusercontent.com') {
      return u.pathname.match(/\/d\/([^/=?]+)/)?.[1] ?? null
    }
    return null
  } catch {
    return null
  }
}

/**
 * Direct, streamable video URL for a Drive-hosted file
 * (`uc?export=view` serves the raw video/mp4), so it can be played in a native
 * <video> element that autoplays — unlike the `/preview` iframe, which forces a
 * manual click on Google's player.
 */
export function normalizeDriveDownloadUrl(url: string | null | undefined): string {
  const id = driveFileId(url)
  return id ? `https://drive.google.com/uc?export=view&id=${id}` : url ?? ''
}

/**
 * Normalizes Google Drive URLs for video files.
 * Returns the Drive /preview URL so ResponsiveMedia can render it via iframe.
 */
export function normalizeDriveVideoUrl(url: string | null | undefined): string {
  if (!url) return ''

  try {
    const u = new URL(url)

    // Case A: drive.google.com/file/d/<id>/... — normalise to /preview
    if (u.hostname === 'drive.google.com') {
      const m = u.pathname.match(/\/file\/d\/([^/]+)/)
      const id = m?.[1]
      if (id) {
        return `https://drive.google.com/file/d/${id}/preview`
      }
    }

    // Case B: lh3.googleusercontent.com/d/<id> — extract id and build preview URL
    if (u.hostname === 'lh3.googleusercontent.com') {
      const m = u.pathname.match(/\/d\/([^/=?]+)/)
      const id = m?.[1]
      if (id) {
        return `https://drive.google.com/file/d/${id}/preview`
      }
    }

    return url
  } catch {
    return url
  }
}

/**
 * Normalizes Google Drive image URLs for cover/background images
 * Uses w4096 for high-resolution backgrounds and hero images
 */
export function normalizeDriveCoverImage(url: string | null | undefined): string {
  if (!url) return ''

  try {
    const u = new URL(url)

    // Case A: drive.google.com/file/d/<id>/preview or /view
    if (u.hostname === 'drive.google.com') {
      const m = u.pathname.match(/\/file\/d\/([^/]+)/)
      const id = m?.[1]
      if (id) {
        // Convert to lh3.googleusercontent.com format with larger width for backgrounds
        return `https://lh3.googleusercontent.com/d/${id}=w4096`
      }
    }

    // Case B: lh3.googleusercontent.com/d/<id>
    if (u.hostname === 'lh3.googleusercontent.com') {
      // Remove any existing size parameters first, then add proper width parameter
      const baseUrl = url.split('=')[0]
      return `${baseUrl}=w4096`
    }

    return url
  } catch {
    return url
  }
}
