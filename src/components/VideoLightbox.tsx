'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

type VideoLightboxProps = {
  open: boolean
  onClose: () => void
  /**
   * Direct, streamable video URL (e.g. a real .mp4) played in a native <video>
   * that AUTOPLAYS on open. Omit for Drive-hosted videos, which can only be
   * embedded via the `/preview` iframe and cannot be auto-started.
   */
  videoSrc?: string
  /** Drive `/preview` URL. Used directly when there's no `videoSrc`, or as a fallback. */
  iframeSrc?: string
  title?: string
}

/**
 * Centered, theme-consistent video modal.
 *
 * Plays the video in a native <video> element so it AUTOPLAYS the moment the
 * modal opens (no second click on Google's player). If the direct stream fails
 * — e.g. Drive quota — it falls back to the `/preview` iframe.
 *
 * Rendered through a portal to document.body so it isn't clipped or
 * mis-positioned by transformed/overflow-hidden ancestors (e.g. animated cards).
 */
export default function VideoLightbox({
  open,
  onClose,
  videoSrc,
  iframeSrc,
  title,
}: VideoLightboxProps) {
  const [mounted, setMounted] = useState(false)
  const [useIframe, setUseIframe] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => setMounted(true), [])

  // Reset the fallback each time the modal is (re)opened.
  useEffect(() => {
    if (open) setUseIframe(false)
  }, [open])

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

  const showNative = Boolean(videoSrc) && !useIframe

  // Autoplay the native video on open. The opening click is a user gesture, so
  // try with sound first; if the browser blocks it, retry muted so it always plays.
  useEffect(() => {
    if (!open || !showNative) return
    const v = videoRef.current
    if (!v) return
    v.play().catch(() => {
      v.muted = true
      v.play().catch(() => {})
    })
  }, [open, showNative])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close video"
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-black/80 backdrop-blur-sm"
          />

          {/* Close button — floats on the backdrop at the top-right of the
              screen, so it never sits on the video's letterbox bars. */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 z-20 grid h-11 w-11 place-items-center rounded-full bg-white text-[color:var(--pne-brand)] shadow-lg ring-1 ring-black/10 transition hover:scale-105 hover:bg-white/90 sm:top-6 sm:right-6"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </button>

          {/* Player */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title ?? 'Video player'}
            className="relative z-10 w-full max-w-5xl overflow-hidden rounded-2xl bg-black shadow-2xl"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          >
            <div className="relative aspect-video w-full">
              {showNative ? (
                <video
                  ref={videoRef}
                  src={videoSrc}
                  controls
                  autoPlay
                  playsInline
                  onError={() => {
                    if (iframeSrc) setUseIframe(true)
                  }}
                  className="absolute inset-0 h-full w-full bg-black"
                />
              ) : (
                <iframe
                  src={iframeSrc}
                  title={title ?? 'Video'}
                  className="absolute inset-0 h-full w-full border-0"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
