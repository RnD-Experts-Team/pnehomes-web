'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { getAllServices } from '../api'
import type { Service } from '../model/types'

/**
 * Inline, expandable "Services" section for the mobile drawer.
 *
 * The desktop header uses a Radix dropdown popup, but a popup renders in a
 * portal *behind* the mobile drawer (lower z-index) and is never visible.
 * Here we expand the service links inline within the drawer instead.
 */
export function MobileServicesAccordion({
  label = 'Services',
  active = false,
  onNavigate,
}: {
  label?: string
  active?: boolean
  onNavigate?: () => void
}) {
  const [services, setServices] = useState<Service[]>([])
  const [open, setOpen] = useState(active)

  useEffect(() => {
    let mounted = true
    getAllServices()
      .then(res => {
        if (mounted && res.success) setServices(res.data)
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

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
            key="services-list"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden pl-6"
          >
            {services.length === 0 ? (
              <li className="px-4 py-2 text-sm text-[color:var(--pne-muted)]">Loading…</li>
            ) : (
              services.map(service => (
                <li key={service.id}>
                  <Link
                    href={`/services/${service.slug}`}
                    onClick={onNavigate}
                    className="block rounded-md px-4 py-2.5 text-base text-[color:var(--pne-brand)] transition-colors hover:bg-gray-50 hover:text-[color:var(--pne-accent)]"
                  >
                    {service.title}
                  </Link>
                </li>
              ))
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
