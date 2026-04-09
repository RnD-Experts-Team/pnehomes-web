'use client'

import { useState, useRef, useEffect } from 'react'
import { CmsMedia } from '@/components/CmsMedia'
import type { MediaType } from '@/components/CmsMedia'
import { ChevronDown } from 'lucide-react'

interface FloorPlan {
  img: string
  img_type?: MediaType
  title: string
  Description?: string
}

export function FloorPlanCollapsible({ plan }: { plan: FloorPlan }) {
  const [isOpen, setIsOpen] = useState(false)
  const [height, setHeight] = useState<number>(0)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (contentRef.current) {
      if (isOpen) {
        setHeight(contentRef.current.scrollHeight)
      } else {
        setHeight(0)
      }
    }
  }, [isOpen])

  return (
    <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-left transition-colors duration-200 hover:bg-gray-50"
        aria-expanded={isOpen}
      >
        <h3 className="font-medium">{plan.title}</h3>
        <ChevronDown
          className={`h-5 w-5 transition-transform duration-300 ease-in-out ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ height: `${height}px` }}
      >
        <div ref={contentRef} className="border-t">
          <div className="relative aspect-[4/3] transform transition-transform duration-300 ease-in-out">
            <CmsMedia
              src={plan.img}
              mediaType={plan.img_type}
              alt={plan.title}
              fill
              className="object-cover"
              sizes="(min-width:1024px) 50vw, 100vw"
            />
          </div>
          {plan.Description && (
            <div className="p-4 transform transition-all duration-300 ease-in-out">
              <p className="text-muted-foreground text-sm">{plan.Description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
