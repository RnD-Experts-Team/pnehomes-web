'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'
import { getAllServices } from '../api'
import type { Service } from '../model/types'

interface ServicesSelectProps {
  placeholder?: string
  active?: boolean
  /**
   * Services fetched on the server (see layout.tsx). When provided, the
   * dropdown renders them immediately — no client fetch, no CORS/timeout risk.
   * The client fetch below only runs as a fallback if the server sent nothing.
   */
  services?: Service[]
}

export function ServicesSelect({
  placeholder = 'Services',
  active = false,
  services: initialServices = [],
}: ServicesSelectProps) {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>(initialServices)
  const [loading, setLoading] = useState(initialServices.length === 0)

  useEffect(() => {
    // Server already supplied services — nothing to fetch.
    if (initialServices.length > 0) return

    const loadServices = async () => {
      try {
        const response = await getAllServices()
        if (response.success) {
          setServices(response.data)
        }
      } catch (error) {
        console.error('Failed to load services:', error)
      } finally {
        setLoading(false)
      }
    }

    loadServices()
  }, [initialServices])

  const handleServiceSelect = (slug: string) => {
    router.push(`/services/${slug}`)
  }

  if (loading) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button disabled className="relative px-2 py-3 text-base font-medium text-gray-500 transition-all duration-300 opacity-70">
            Loading services...
          </button>
        </DropdownMenuTrigger>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={`relative flex items-center gap-1 px-2 py-3 text-base font-medium transition-all duration-300 after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:bg-[color:var(--pne-accent)] after:transition-all after:duration-300 md:after:hidden ${
          active
            ? 'text-[color:var(--pne-accent)] after:w-full md:-translate-y-0.5 md:text-[color:var(--pne-accent)]'
            : 'text-[color:var(--pne-brand)] after:w-0 hover:text-[color:var(--pne-brand-600)] hover:after:w-full md:text-white md:hover:-translate-y-0.5 md:hover:text-[color:var(--pne-accent)]'
        }`}>
          {placeholder}
          <ChevronDown
            className={`h-4 w-4 transition-colors duration-300 ${
              active
                ? 'text-[color:var(--pne-accent)]'
                : 'text-[color:var(--pne-brand)] md:text-white'
            }`}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full max-w-xs bg-gray-200">
        <DropdownMenuLabel>Services</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {services.map(service => (
          <DropdownMenuItem
            key={service.id}
            onSelect={() => handleServiceSelect(service.slug)}
            className="cursor-pointer"
          >
            {service.title}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
