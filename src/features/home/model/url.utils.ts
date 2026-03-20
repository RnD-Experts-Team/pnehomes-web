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
