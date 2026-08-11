'use client'

import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'

interface GallerySelectProps {
  placeholder?: string
  active?: boolean
}

/**
 * Desktop "Gallery" dropdown. Two static options:
 *  - "Our Projects" → /our-projects (house-first view)
 *  - "Rooms"        → /gallery      (existing category-first view)
 *
 * Mirrors ServicesSelect's trigger styling, but with no data fetch.
 */
const OPTIONS = [
  { label: 'Our Projects', href: '/our-projects' },
  { label: 'Rooms', href: '/gallery' },
] as const

export function GallerySelect({ placeholder = 'Gallery', active = false }: GallerySelectProps) {
  const router = useRouter()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`relative flex items-center gap-1 px-2 py-3 text-base font-medium transition-all duration-300 after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:bg-[color:var(--pne-accent)] after:transition-all after:duration-300 md:after:hidden ${
            active
              ? 'text-[color:var(--pne-accent)] after:w-full md:-translate-y-0.5 md:text-[color:var(--pne-accent)]'
              : 'text-[color:var(--pne-brand)] after:w-0 hover:text-[color:var(--pne-brand-600)] hover:after:w-full md:text-white md:hover:-translate-y-0.5 md:hover:text-[color:var(--pne-accent)]'
          }`}
        >
          {placeholder}
          <ChevronDown
            className={`h-4 w-4 transition-colors duration-300 ${
              active ? 'text-[color:var(--pne-accent)]' : 'text-[color:var(--pne-brand)] md:text-white'
            }`}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full max-w-xs bg-gray-200">
        <DropdownMenuLabel>Gallery</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {OPTIONS.map(option => (
          <DropdownMenuItem
            key={option.href}
            onSelect={() => router.push(option.href)}
            className="cursor-pointer"
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
