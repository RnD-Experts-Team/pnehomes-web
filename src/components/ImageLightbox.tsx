'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { driveGridThumb } from '@/features/home/model/url.utils'

type ImageLightboxProps = {
  open: boolean
  onClose: () => void
  /** Raw image src (same value used for the thumbnail) — upgraded to full resolution internally. */
  src: string
  alt?: string
}

/**
 * Full-screen, high-resolution image preview.
 *
 * Both the blurred placeholder and the full-res image are fetched through
 * Next's own `/_next/image` endpoint (via `driveGridThumb`) rather than
 * hitting lh3.googleusercontent.com directly from the browser. Google
 * throttles/rejects (429) bursts of direct cross-origin requests to that
 * host — routing through Next means only the server talks to Google (once,
 * then cached), and the placeholder reuses the exact same URL the grid
 * thumbnail already requested, so it's served from the browser cache
 * instantly with no extra network request at all.
 *
 * The full-res image is requested at a larger width (1920) than the grid
 * thumbnail (750) — enough detail to look crisp in the modal without
 * pulling Drive's full original, which can be several MB. A plain <img> is
 * used (not next/image) so the browser displays it at its natural aspect
 * ratio without a pre-sized container.
 *
 * Rendered through a portal to document.body, matching VideoLightbox.
 */
// Smooth, unhurried "settle in" curve for the modal's entrance/exit.
const EASE_OUT = [0.16, 1, 0.3, 1] as const

export default function ImageLightbox({ open, onClose, src, alt }: ImageLightboxProps) {
  const [mounted, setMounted] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => setMounted(true), [])

  // A new image is loading full-res — start from the blurred thumbnail again.
  useEffect(() => {
    setLoaded(false)
  }, [src])

  // Close on Escape and lock body scroll while open.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!mounted) return null

  // Same width (750) + defaults the grid uses, so this is a cache hit, not a new request.
  const thumbSrc = driveGridThumb(src) || src
  const fullSrc = driveGridThumb(src, 1920, 80) || src

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
        >
          {/* Backdrop — clicking it (or anywhere outside the image) closes the modal */}
          <button
            type="button"
            aria-label="Close image preview"
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-black/90 backdrop-blur-sm"
          />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 z-20 grid h-11 w-11 place-items-center rounded-full bg-white text-[color:var(--pne-brand)] shadow-lg ring-1 ring-black/10 transition hover:scale-105 hover:bg-white/90 sm:top-6 sm:right-6"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </button>

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={alt ?? 'Image preview'}
            className="relative z-10 inline-block max-h-[90vh] max-w-[95vw]"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
            onClick={e => e.stopPropagation()}
          >
            {/* Blurred low-res thumbnail — already cached from the grid, so it
                appears instantly and sets the box's size while the full-res
                version streams in behind it. */}
            {/* eslint-disable-next-line @next/next/no-img-element -- natural size/aspect ratio in a modal, not a layout image */}
            <img
              src={thumbSrc}
              alt=""
              aria-hidden="true"
              className={`max-h-[90vh] max-w-[95vw] rounded-lg object-contain shadow-2xl blur-lg scale-105 transition-opacity duration-500 ${
                loaded ? 'opacity-0' : 'opacity-100'
              }`}
            />

            {/* Full-resolution image — cross-fades in over the thumbnail once loaded. */}
            {/* eslint-disable-next-line @next/next/no-img-element -- natural size/aspect ratio in a modal, not a layout image */}
            <img
              src={fullSrc}
              alt={alt ?? ''}
              fetchPriority="high"
              onLoad={() => setLoaded(true)}
              className={`absolute inset-0 h-full w-full rounded-lg object-contain shadow-2xl transition-opacity duration-500 ease-out ${
                loaded ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Loading spinner while the full-res image streams in */}
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-white/30 border-t-white" />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
