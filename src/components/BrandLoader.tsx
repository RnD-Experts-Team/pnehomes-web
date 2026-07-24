/**
 * Branded, theme-consistent loading indicator used across the site
 * (route-level loading.tsx files, Suspense fallbacks, etc.).
 *
 * Pure CSS animation — no client JS — so it can render instantly as a
 * server component while page data is being fetched.
 */
export default function BrandLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[70vh] w-full flex-col items-center justify-center gap-6 bg-white px-6"
    >
      {/* Spinner with house mark in the center */}
      <div className="relative h-20 w-20">
        {/* Track */}
        <div className="absolute inset-0 rounded-full border-4 border-[color:var(--pne-border)]" />
        {/* Spinning accent arc */}
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[color:var(--pne-accent)]" />
        {/* House icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="h-9 w-9 text-[color:var(--pne-brand)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 10.5 12 3l9 7.5" />
            <path d="M5 9.5V21h14V9.5" />
            <path d="M9.5 21v-6h5v6" />
          </svg>
        </div>
      </div>

      {/* Wordmark + tagline, matching the header lockup */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-lg font-bold tracking-[0.2em] text-[color:var(--pne-brand)]">
          PNE HOMES
        </span>
        <span className="text-[10px] font-medium tracking-[0.35em] text-[color:var(--pne-muted)] uppercase">
          Come Build With Us
        </span>
      </div>

      {/* Animated dots */}
      <div className="flex items-center gap-1.5" aria-hidden="true">
        <span className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--pne-accent)] [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--pne-accent)] [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--pne-accent)]" />
      </div>

      <span className="sr-only">{label}</span>
    </div>
  )
}
