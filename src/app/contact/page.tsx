'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { homeLayoutApi } from '@/features/home/api'
import { Button } from '@/components/ui/button'
import { Phone } from 'lucide-react'
import Script from 'next/script'

const BUILDERTREND_IFRAME_SRC =
  'https://buildertrend.net/leads/contactforms/ContactFormFrame.aspx?builderID=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJidWlsZGVySWQiOjEwMzY0OX0.zyrj1cu4jFrbPWl-HgrbmhpcUK9ulyAGsvKHpaKlcqE'

/** Minimum height so the loading spinner has room before auto-resize kicks in */
const MIN_IFRAME_HEIGHT = 600

export default function ContactPage() {
  const [phone, setPhone] = useState<number | null>(null)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [iframeHeight, setIframeHeight] = useState(MIN_IFRAME_HEIGHT)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Fetch the phone number from the same API the footer uses
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const p = await homeLayoutApi.getPhone()
        if (mounted) setPhone(p)
      } catch (e) {
        console.error('Failed to load phone number', e)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  // Listen for cross-origin resize messages from the Buildertrend iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Buildertrend's script posts height via postMessage
      if (typeof event.data === 'string') {
        // BT sends stringified height or JSON – try to extract a pixel height
        const parsed = parseInt(event.data, 10)
        if (!isNaN(parsed) && parsed > 100) {
          setIframeHeight(parsed)
          return
        }
      }
      if (typeof event.data === 'object' && event.data !== null) {
        const h =
          event.data.height ??
          event.data.frameHeight ??
          event.data.btHeight
        if (typeof h === 'number' && h > 100) {
          setIframeHeight(h)
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const handleIframeLoad = useCallback(() => {
    setIframeLoaded(true)
  }, [])

  const isReady = iframeLoaded && scriptLoaded

  return (
    <div>
      {/* Hero banner – heading + subtitle on dark brand background */}
      <section className="relative isolate">
        <div className="absolute inset-0 -z-10 bg-[color:var(--pne-brand)]" />
        <div className="container mx-auto px-4 pt-16 pb-10 text-center sm:px-6 sm:pt-20 sm:pb-12 lg:px-8 lg:pt-24 lg:pb-14">
          <h1 className="text-4xl font-extrabold tracking-tight uppercase text-white sm:text-5xl max-w-[800px] mx-auto break-words">
            Contact Us
          </h1>
          <p className="mt-3 text-gray-300">
            Get in touch with our team. We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <div className="bg-gray-50 py-12 dark:bg-gray-900">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">

          {/* Call Us button – below hero, above form */}
          <div className="mb-6 flex items-center justify-center">
            {phone ? (
              <Button
                asChild
                size="default"
                className="rounded-md border border-transparent bg-[color:var(--pne-accent)] px-4 py-2 text-base text-white shadow-sm transition-all hover:shadow hover:brightness-110 active:brightness-95"
              >
                <a href={`tel:${phone}`}>
                  <Phone className="h-5 w-5" />
                  <span>Call Us: {phone}</span>
                </a>
              </Button>
            ) : (
              <span className="inline-block h-9 w-48 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
            )}
          </div>

          {/* Buildertrend form card — auto-height, responsive */}
          <div className="bt-form-card relative rounded-2xl bg-white p-4 shadow-xl ring-1 ring-[color:var(--pne-border)] dark:bg-gray-800 dark:ring-white/10 sm:p-6 lg:p-8">
            {/* Loading overlay */}
            {!isReady && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-2xl bg-white dark:bg-gray-800">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-[color:var(--pne-accent)]" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading contact form…</p>
              </div>
            )}

            {/* Iframe — grows to its content height */}
            <iframe
              ref={iframeRef}
              src={BUILDERTREND_IFRAME_SRC}
              scrolling="no"
              id="btIframe"
              onLoad={handleIframeLoad}
              title="Contact Form"
              className="bt-iframe w-full border-0"
              style={{
                background: 'transparent',
                height: `${iframeHeight}px`,
                transition: 'height 0.3s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* Buildertrend companion script — handles auto-resize */}
      <Script
        src="https://buildertrend.net/leads/contactforms/js/btClientContactForm.js"
        strategy="lazyOnload"
        onLoad={() => setScriptLoaded(true)}
      />
    </div>
  )
}
