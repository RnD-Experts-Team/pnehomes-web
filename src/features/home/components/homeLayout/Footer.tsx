'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { homeLayoutApi } from '@/features/home/api'
import { Phone, ExternalLink } from 'lucide-react'

// ✅ Brand icons (modern replacements)
import {
  FaFacebookF,
  FaYoutube,
  FaLinkedinIn,
  FaInstagram,
  FaXTwitter,
  FaTiktok,
  FaPinterest,
} from 'react-icons/fa6'
import { SiZillow } from 'react-icons/si'

type FooterConfig = {
  navigation: string[]
  phone: number | null
  social: { icon: string; url: string }[]
}

const socialIcons = {
  facebook: FaFacebookF,
  youtube: FaYoutube,
  x: FaXTwitter,
  linkedIn: FaLinkedinIn,
  instagram: FaInstagram,
  tiktok: FaTiktok,
  pinterest: FaPinterest,
  zillow: SiZillow,
  other: ExternalLink, // ✅ fallback for unknown socials
} as const

/**
 * Route mapping for footer quick links (by position)
 * 0 -> /about-us
 * 1 -> /our-team
 * 2 -> /events
 * 3 -> /privacy-policy
 */
const routeForIndex = (index: number, label: string) => {
  switch (index) {
    case 0:
      return '/about-us'
    case 1:
      return '/our-team'
    case 2:
      return '/events'
    case 3:
      return '/privacy-policy'
    default:
      // Fallback: slugify the CMS title (not expected, but safe)
      return `/${label.toLowerCase().replace(/\s+/g, '-')}`
  }
}

export function Footer({ initialConfig = null }: { initialConfig?: FooterConfig | null }) {
  const [footerConfig, setFooterConfig] = useState<FooterConfig | null>(initialConfig)

  // Config is normally provided by the server (see layout.tsx). Only fetch on
  // the client as a fallback if the server didn't supply it (e.g. CMS error).
  useEffect(() => {
    if (initialConfig) return
    let mounted = true
    ;(async () => {
      try {
        const footer = await homeLayoutApi.getFooter()
        if (mounted) setFooterConfig(footer)
      } catch (e) {
        console.error('Failed to load footer config', e)
      }
    })()
    return () => {
      mounted = false
    }
  }, [initialConfig])

  const nav = footerConfig?.navigation?.slice(0, 4) ?? []
  const phone = footerConfig?.phone ?? null
  const socials = footerConfig?.social ?? []

  return (
    <footer className="bg-[color:var(--pne-footer)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 text-center">
          {/* Quick Links */}
          <div>
            <ul className="flex flex-wrap justify-center gap-6 md:gap-8">
              {nav.length === 0 ? (
                // Minimal skeleton while loading
                <>
                  <li><span className="inline-block h-5 w-24 animate-pulse rounded bg-white/20" /></li>
                  <li><span className="inline-block h-5 w-24 animate-pulse rounded bg-white/20" /></li>
                  <li><span className="inline-block h-5 w-24 animate-pulse rounded bg-white/20" /></li>
                  <li><span className="inline-block h-5 w-24 animate-pulse rounded bg-white/20" /></li>
                </>
              ) : (
                nav.map((item: string, index: number) => (
                  <li key={`${item}-${index}`}>
                    <Link
                      href={routeForIndex(index, item)}
                      className="relative inline-block text-lg text-gray-300 transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-0 after:bg-[color:var(--pne-accent)] after:transition-all after:duration-300 hover:text-white hover:after:w-full"
                    >
                      {item}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Company / Phone */}
          <div>
            {phone ? (
              <div className="flex items-center justify-center text-xl text-[color:var(--pne-accent)]">
                <a
                  href={`tel:${phone}`}
                  className="flex items-center text-xl transition-colors hover:text-white"
                >
                  <span className="mr-2 text-xl">Call Us :</span>
                  <Phone className="h-6 w-6" />
                  <span className="ml-2 text-xl">{phone}</span>
                </a>
              </div>
            ) : (
              <div className="h-6" />
            )}
          </div>

          {/* Social */}
          <div>
            <div className="flex flex-wrap justify-center gap-3">
              {socials.length === 0 ? (
                <>
                  <span className="inline-flex h-10 w-10 animate-pulse rounded-full bg-white/10" />
                  <span className="inline-flex h-10 w-10 animate-pulse rounded-full bg-white/10" />
                  <span className="inline-flex h-10 w-10 animate-pulse rounded-full bg-white/10" />
                </>
              ) : (
                socials.map((social) => {
                  const key = `${social.icon}-${social.url}`
                  const platform =
                    social.icon?.toLowerCase() === 'other'
                      ? 'other'
                      : (social.icon as keyof typeof socialIcons)
                  const IconComponent = socialIcons[platform] || ExternalLink
                  return (
                    <a
                      key={key}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Follow us on ${social.icon}`}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-[color:var(--pne-accent)] ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white hover:ring-white/20"
                    >
                      <IconComponent className="h-5 w-5" />
                    </a>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-5 border-t border-white/10 pt-5 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} PNE Homes. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
