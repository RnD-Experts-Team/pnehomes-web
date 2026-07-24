'use client'
// src/features/property/components/FilterBar.tsx

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/**
 * Controlled filter values. Empty string / "all" / "any" mean "no filter".
 */
export type FilterValues = {
  community: string
  price: string
  beds: string
  baths: string
  garages: string
}

export const EMPTY_FILTERS: FilterValues = {
  community: 'all',
  price: '',
  beds: 'any',
  baths: 'any',
  garages: 'any',
}

type FilterBarProps = {
  values: FilterValues
  communities: string[]
  onChange: (next: FilterValues) => void
  onReset: () => void
}

/**
 * Presentational filter bar. It owns no data — the parent (`FloorPlansExplorer`)
 * holds the values in state and filters the in-memory dataset instantly, so
 * changing a control never triggers a navigation or a CMS round-trip.
 */
export default function FilterBar({ values, communities, onChange, onReset }: FilterBarProps) {
  const set = (patch: Partial<FilterValues>) => onChange({ ...values, ...patch })

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {/* Community */}
        <Select value={values.community} onValueChange={(v) => set({ community: v })}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Community name" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All communities</SelectItem>
            {communities.map((communityName) => (
              <SelectItem key={communityName} value={communityName}>
                {communityName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Max price */}
        <Input
          type="number"
          placeholder="Max price"
          value={values.price}
          onChange={(e) => set({ price: e.target.value })}
          className="w-full"
          min="0"
          inputMode="numeric"
        />

        {/* Beds */}
        <Select value={values.beds} onValueChange={(v) => set({ beds: v })}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any beds" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any beds</SelectItem>
            <SelectItem value="2">2+ beds</SelectItem>
            <SelectItem value="3">3+ beds</SelectItem>
            <SelectItem value="4">4+ beds</SelectItem>
          </SelectContent>
        </Select>

        {/* Baths */}
        <Select value={values.baths} onValueChange={(v) => set({ baths: v })}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any baths" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any baths</SelectItem>
            <SelectItem value="2">2+ baths</SelectItem>
            <SelectItem value="2.5">2.5+ baths</SelectItem>
            <SelectItem value="3">3+ baths</SelectItem>
          </SelectContent>
        </Select>

        {/* Garages */}
        <Select value={values.garages} onValueChange={(v) => set({ garages: v })}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any garages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any garages</SelectItem>
            <SelectItem value="1">1+ garages</SelectItem>
            <SelectItem value="2">2+ garages</SelectItem>
            <SelectItem value="3">3+ garages</SelectItem>
          </SelectContent>
        </Select>

        {/* Actions */}
        <div className="col-span-1 flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:gap-3 lg:col-span-3 xl:col-span-1">
          <Button
            variant="outline"
            onClick={onReset}
            className="flex-1 sm:min-w-[80px] sm:flex-none"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  )
}
