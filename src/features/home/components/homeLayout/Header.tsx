'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CmsMedia } from '@/components/CmsMedia'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { homeLayoutApi } from '@/features/home/api'
import { ServicesSelect } from '@/features/services/components/ServicesSelect'
import { MobileServicesAccordion } from '@/features/services/components/MobileServicesAccordion'
import { GallerySelect } from '@/features/gallery/components/GallerySelect'
import { MobileGalleryAccordion } from '@/features/gallery/components/MobileGalleryAccordion'
import type { Service } from '@/features/services/model/types'
import { Phone, Menu, X } from 'lucide-react'

type HeaderConfig = {
  logo: string
  navigation: string[]
  button: string | null
  phone: number | null
}

/**
 * Route mapping:
 * - We always use API *titles* for visible text.
 * - We map their positions to fixed local routes.
 *
 * Position → Route
 * 0 → /
 * 1 → /floor-plans
 * 2 → /gallery
 * 3 → /communities
 * 4 → /building-options
 * 5 → /contact
 */
const routeForIndex = (index: number, label: string) => {
  switch (index) {
    case 0:
      return '/' // Home
    case 1:
      return '/floor-plans'
    case 2:
      return '/gallery'
    case 3:
      return '/communities'
    case 4:
      return '/building-options'
    case 5:
      return '/contact'
    default:
      // Fallback (shouldn't happen with 6 max), just slugify label
      return `/${label.toLowerCase().replace(/\s+/g, '-')}`
  }
}

type NavItem =
  | { type: 'link'; label: string; href: string }
  | { type: 'services'; label: string }
  | { type: 'gallery'; label: string }

// Put near your helpers
const KNOWN_LOCALES = ['en', 'bg', 'fr'] // adjust to your setup

/**
 * Remove any locale prefix (e.g. /en/...) from a pathname for comparison.
 */
const stripLocale = (path: string) => {
  const m = path.match(/^\/([a-zA-Z-]+)(?=\/|$)/)
  if (!m) return path
  const locale = m[1]
  return KNOWN_LOCALES.includes(locale) ? path.slice(locale.length + 1) || '/' : path
}

/**
 * Normalize a path or href to compare:
 * - drop hash/query
 * - strip locale (pathname only)
 * - remove trailing slash except root
 */
const normalizeForCompare = (value: string, { isPathname }: { isPathname: boolean }) => {
  const noHash = value.split('#')[0]
  const noQuery = noHash.split('?')[0]
  const maybeNoLocale = isPathname ? stripLocale(noQuery) : noQuery
  const trimmed = maybeNoLocale !== '/' ? maybeNoLocale.replace(/\/+$/, '') : '/'
  return trimmed || '/'
}

/**
 * Some links should be considered active on extra prefixes (legacy rules you had before).
 * e.g. Floor Plans active on /property/* and /compare; Building Options active on /articles/*
 */
const EXTRA_ACTIVE_PREFIXES: Record<string, string[]> = {
  '/floor-plans': ['/property', '/compare'],
  '/building-options': ['/articles'],
}

/**
 * Idiomatic Next.js: compare each link's href to usePathname().
 * Also consider common "section" rules (startsWith) and extra custom prefixes.
 */
const isActiveHref = (pathname: string, href: string) => {
  const a = normalizeForCompare(pathname, { isPathname: true })
  const b = normalizeForCompare(href, { isPathname: false })

  if (a === b) return true
  if (b !== '/' && a.startsWith(b + '/')) return true

  const extras = EXTRA_ACTIVE_PREFIXES[b]
  if (extras && extras.some(prefix => a === prefix || a.startsWith(prefix + '/'))) {
    return true
  }

  return false
}

/**
 * Given headerConfig.navigation (API titles), build the final nav array and inject "Services".
 * Rule:
 * - Services is at the END
 * - UNLESS there are 6 links, then Services goes BEFORE the last one (Contact).
 */
const buildNavItems = (navigation: string[]): NavItem[] => {
  const visibleLinks = navigation.slice(0, 6)
  const linkItems: NavItem[] = visibleLinks.map((label, i) => {
    // Index 2 (Gallery) is a dropdown: "Our Projects" + "Rooms" (see GallerySelect).
    if (i === 2) {
      return { type: 'gallery', label }
    }
    return {
      type: 'link',
      label,
      href: routeForIndex(i, label),
    }
  })

  const services: NavItem = { type: 'services', label: 'Services' }

  if (linkItems.length >= 6) {
    // Insert before last (Contact)
    const insertionIndex = Math.max(0, linkItems.length - 1)
    return [...linkItems.slice(0, insertionIndex), services, ...linkItems.slice(insertionIndex)]
  }

  return [...linkItems, services]
}

export function Header({
  initialConfig = null,
  initialServices = [],
}: {
  initialConfig?: HeaderConfig | null
  initialServices?: Service[]
}) {
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig | null>(initialConfig)
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const pathname = usePathname()
  const headerRef = useRef<HTMLElement>(null)

  // Remember scrollY when menu opens to avoid closing from tiny layout jitters
  const openStartY = useRef(0)
  // Track last scroll position to derive scroll direction
  const lastScrollY = useRef(0)

  // Config is normally provided by the server (see layout.tsx). Only fetch on
  // the client as a fallback if the server didn't supply it (e.g. CMS error).
  useEffect(() => {
    if (initialConfig) return
    let mounted = true
    ;(async () => {
      try {
        const header = await homeLayoutApi.getHeader()
        if (mounted) setHeaderConfig(header)
      } catch (e) {
        console.error('Failed to load header config', e)
      }
    })()
    return () => {
      mounted = false
    }
  }, [initialConfig])

  // Capture starting scroll position when opening
  useEffect(() => {
    if (open) openStartY.current = window.scrollY
  }, [open])

  // Lock background scroll while the mobile drawer is open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // Scroll-aware header: solid background once scrolled, hide on scroll-down /
  // reveal on scroll-up, and close the drawer on meaningful scroll.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 6)

      // Hide when scrolling down past a threshold; always reveal when scrolling
      // up. Never hide while the mobile drawer is open.
      const goingDown = y > lastScrollY.current
      setHidden(!open && goingDown && y > 80)
      lastScrollY.current = y

      // Only close if user actually moved ~30px since opening
      if (open && Math.abs(y - openStartY.current) > 30) {
        setOpen(false)
      }
    }

    // Initialize once for visual state
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [open])

  const NavLink = ({
    href,
    children,
    onClick,
    isMobile = false,
    active = false,
  }: {
    href: string
    children: React.ReactNode
    onClick?: () => void
    isMobile?: boolean
    active?: boolean
  }) => {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`relative px-2 py-3 text-base font-medium transition-all duration-300 ${
          isMobile
            ? `text-[color:var(--pne-brand)] after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-0 after:bg-[color:var(--pne-accent)] after:transition-all after:duration-300 hover:text-[color:var(--pne-brand-600)] hover:after:w-full ${active ? '!text-[color:var(--pne-accent)] after:w-full' : ''}`
            : `text-white hover:-translate-y-0.5 hover:text-[color:var(--pne-accent)] ${active ? '-translate-y-0.5 !text-[color:var(--pne-accent)]' : ''}`
        }`}
      >
        {children}
      </Link>
    )
  }

  // While loading, keep header mounted (prevents CLS) with minimal placeholders
  const logoSrc = headerConfig?.logo ?? ''
  const navItems = buildNavItems(headerConfig?.navigation ?? [])

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 right-0 left-0 z-50 transition-[transform,background-color,box-shadow,backdrop-filter] duration-300 ease-out ${
          hidden ? '-translate-y-full' : 'translate-y-0'
        } ${
          scrolled
            ? 'bg-[color:var(--pne-brand)]/95 shadow-lg backdrop-blur-md'
            : 'bg-gradient-to-b from-[color:var(--pne-brand)]/70 via-[color:var(--pne-brand)]/30 to-transparent'
        }`}
        aria-label="Site Header"
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-6">
            {/* Mobile: Menu button on left, Logo on right */}
            <div className="flex w-full items-center justify-between md:hidden">
              <button
                type="button"
                aria-label="Toggle Navigation"
                aria-expanded={open}
                aria-controls="mobile-nav"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white"
                onClick={() => setOpen(s => !s)}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              <div className="flex-shrink-0">
                <Link href="/" aria-label="PNE Homes">
                  {logoSrc ? (
                    <CmsMedia
                      src={logoSrc}
                      mediaType="image"
                      alt="PNE Homes Logo"
                      width={320}
                      height={80}
                      priority
                      className="h-auto w-28 object-contain md:w-36 lg:w-48"
                      sizes="(min-width: 1024px) 12rem, (min-width: 768px) 9rem, 7rem"
                    />
                  ) : (
                    <div className="h-8 w-28 animate-pulse rounded bg-white/30 md:w-36 lg:w-48" />
                  )}
                </Link>
              </div>
            </div>

            {/* Desktop: Logo on left */}
            <div className="hidden flex-shrink-0 md:block">
              <Link href="/" aria-label="PNE Homes">
                {logoSrc ? (
                  <CmsMedia
                    src={logoSrc}
                    mediaType="image"
                    alt="PNE Homes Logo"
                    width={320}
                    height={80}
                    priority
                    className="h-auto w-28 object-contain md:w-36 lg:w-48"
                    sizes="(min-width: 1024px) 12rem, (min-width: 768px) 9rem, 7rem"
                  />
                ) : (
                  <div className="h-8 w-28 animate-pulse rounded bg-white/30 md:w-36 lg:w-48" />
                )}
              </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden items-center gap-3 md:flex lg:gap-6 xl:gap-8">
              {navItems.map((item, index) => {
                if (item.type === 'services') {
                  const activeServices = isActiveHref(pathname, '/services')
                  return (
                    <div key={`services-${index}`}>
                      <ServicesSelect
                        placeholder={item.label}
                        active={activeServices}
                        services={initialServices}
                      />
                    </div>
                  )
                }
                if (item.type === 'gallery') {
                  const activeGallery =
                    isActiveHref(pathname, '/gallery') || isActiveHref(pathname, '/our-projects')
                  return (
                    <div key={`gallery-${index}`}>
                      <GallerySelect placeholder={item.label} active={activeGallery} />
                    </div>
                  )
                }
                const active = isActiveHref(pathname, item.href)
                return (
                  <NavLink key={item.href} href={item.href} active={active}>
                    {item.label}
                  </NavLink>
                )
              })}
            </nav>

            {/* Desktop: Contact + CTA */}
            <div className="hidden items-center gap-3 xl:flex">
              {headerConfig?.phone && (
                <Button
                  asChild
                  size="default"
                  className="rounded-md border border-transparent bg-[color:var(--pne-accent)] px-4 py-2 text-base text-white shadow-sm transition-all hover:shadow hover:brightness-110 active:brightness-95"
                >
                  <a href={`tel:${headerConfig.phone}`}>
                    <Phone className="mr-2 h-5 w-5" />
                    <span>{headerConfig.phone}</span>
                  </a>
                </Button>
              )}
              {headerConfig?.button && (
                <Link href="/contact">
                  <Button
                    size="default"
                    className="rounded-md border border-transparent bg-[color:var(--pne-accent)] px-4 py-2 text-base text-white shadow-sm transition-all hover:shadow hover:brightness-110 active:brightness-95"
                  >
                    {headerConfig.button}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            className="fixed inset-0 z-[60] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <motion.button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute inset-0 cursor-default bg-[color:var(--pne-footer)]/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Panel */}
            <motion.aside
              className="absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col bg-white shadow-2xl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            >
              {/* Panel header */}
              <div className="flex items-center justify-between border-b border-[color:var(--pne-border)] px-5 py-4">
                <Link href="/" aria-label="PNE Homes" onClick={() => setOpen(false)}>
                  {logoSrc ? (
                    <CmsMedia
                      src={logoSrc}
                      mediaType="image"
                      alt="PNE Homes Logo"
                      width={200}
                      height={56}
                      className="h-auto w-28 object-contain"
                      sizes="7rem"
                    />
                  ) : (
                    <span className="text-base font-bold tracking-widest text-[color:var(--pne-brand)]">
                      PNE HOMES
                    </span>
                  )}
                </Link>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--pne-brand)] transition hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Nav items (staggered) */}
              <motion.nav
                className="flex-1 overflow-y-auto px-3 py-4"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } },
                }}
              >
                {navItems.map((item, index) => {
                  const itemVariants = {
                    hidden: { opacity: 0, x: 24 },
                    visible: { opacity: 1, x: 0 },
                  }

                  if (item.type === 'services') {
                    const activeServices = isActiveHref(pathname, '/services')
                    return (
                      <motion.div key={`m-services-${index}`} variants={itemVariants}>
                        <MobileServicesAccordion
                          label={item.label}
                          active={activeServices}
                          services={initialServices}
                          onNavigate={() => setOpen(false)}
                        />
                      </motion.div>
                    )
                  }

                  if (item.type === 'gallery') {
                    const activeGallery =
                      isActiveHref(pathname, '/gallery') || isActiveHref(pathname, '/our-projects')
                    return (
                      <motion.div key={`m-gallery-${index}`} variants={itemVariants}>
                        <MobileGalleryAccordion
                          label={item.label}
                          active={activeGallery}
                          onNavigate={() => setOpen(false)}
                        />
                      </motion.div>
                    )
                  }

                  const active = isActiveHref(pathname, item.href)
                  return (
                    <motion.div key={item.href} variants={itemVariants}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`group flex items-center justify-between rounded-lg px-4 py-3.5 text-lg font-medium transition-all ${
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
                          {item.label}
                        </span>
                        <span className="text-[color:var(--pne-muted)] opacity-0 transition-opacity group-hover:opacity-100">
                          ›
                        </span>
                      </Link>
                    </motion.div>
                  )
                })}
              </motion.nav>

              {/* CTA footer */}
              <motion.div
                className="space-y-3 border-t border-[color:var(--pne-border)] px-5 py-5"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                {headerConfig?.button && (
                  <Button
                    asChild
                    className="w-full rounded-md bg-[color:var(--pne-accent)] py-6 text-base text-white shadow-sm transition hover:brightness-110"
                  >
                    <Link href="/contact" onClick={() => setOpen(false)}>
                      {headerConfig.button}
                    </Link>
                  </Button>
                )}
                {headerConfig?.phone && (
                  <a
                    href={`tel:${headerConfig.phone}`}
                    className="flex items-center justify-center gap-2 rounded-md border border-[color:var(--pne-border)] py-3 text-base font-medium text-[color:var(--pne-brand)] transition hover:bg-gray-50"
                  >
                    <Phone className="h-5 w-5" />
                    {headerConfig.phone}
                  </a>
                )}
              </motion.div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
