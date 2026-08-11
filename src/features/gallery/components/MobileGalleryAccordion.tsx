'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

/**
 * Inline, expandable "Gallery" section for the mobile drawer.
 *
 * The desktop Radix dropdown renders in a portal that sits *behind* the mobile
 * drawer, so mobile uses an inline expand instead (same approach as
 * MobileServicesAccordion). Two static links: "Our Projects" and "Rooms".
 */
const OPTIONS = [
  { label: 'Our Projects', href: '/our-projects' },
  { label: 'Rooms', href: '/gallery' },
] as const

export function MobileGalleryAccordion({
  label = 'Gallery',
  active = false,
  onNavigate,
}: {
  label?: string
  active?: boolean
  onNavigate?: () => void
}) {
  const [open, setOpen] = useState(active)

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className={`group flex w-full items-center justify-between rounded-lg px-4 py-3.5 text-lg font-medium transition-all ${
          active
            ? 'bg-[color:var(--pne-accent)]/10 text-[color:var(--pne-accent)]'
            : 'text-[color:var(--pne-brand)] hover:bg-gray-50'
        }`}
      >
        <span className="flex items-center gap-3">
          <span
            className={`h-5 w-1 rounded-full transition-all ${
              active
                ? 'bg-[color:var(--pne-accent)]'
                : 'bg-transparent group-hover:bg-[color:var(--pne-accent)]/40'
            }`}
          />
          {label}
        </span>
        <ChevronDown
          className={`h-5 w-5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            key="gallery-list"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden pl-6"
          >
            {OPTIONS.map(option => (
              <li key={option.href}>
                <Link
                  href={option.href}
                  onClick={onNavigate}
                  className="block rounded-md px-4 py-2.5 text-base text-[color:var(--pne-brand)] transition-colors hover:bg-gray-50 hover:text-[color:var(--pne-accent)]"
                >
                  {option.label}
                </Link>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
