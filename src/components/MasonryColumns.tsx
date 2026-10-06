'use client'

import { useEffect, useState, type ReactNode } from 'react'

type ColumnBreakpoints = { base: number; sm?: number; md?: number; lg?: number; xl?: number }

const MIN_WIDTH = { sm: 640, md: 768, lg: 1024, xl: 1280 } as const

function widest(bp: ColumnBreakpoints): number {
  return bp.xl ?? bp.lg ?? bp.md ?? bp.sm ?? bp.base
}

function columnsForWidth(bp: ColumnBreakpoints, width: number): number {
  let count = bp.base
  for (const key of ['sm', 'md', 'lg', 'xl'] as const) {
    const value = bp[key]
    if (value && width >= MIN_WIDTH[key]) count = value
  }
  return count
}

/**
 * Pinterest-style masonry that keeps the upload order reading left-to-right:
 * item 1 → column 1, item 2 → column 2, ... then wraps. Plain CSS columns
 * fill each column top-to-bottom instead, so the top row read 1, 7, 12.
 *
 * Starts at the widest column count (same on server and client, so no
 * hydration mismatch), then adjusts to the real viewport after mount.
 */
export default function MasonryColumns<T>({
  items,
  columns,
  className = '',
  columnClassName = '',
  renderItem,
}: {
  items: T[]
  columns: ColumnBreakpoints
  className?: string
  columnClassName?: string
  renderItem: (item: T, index: number) => ReactNode
}) {
  const { base, sm, md, lg, xl } = columns
  const [count, setCount] = useState(() => widest(columns))

  useEffect(() => {
    const bp = { base, sm, md, lg, xl }
    const update = () => setCount(columnsForWidth(bp, window.innerWidth))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [base, sm, md, lg, xl])

  const columnCount = Math.max(1, Math.min(count, items.length))
  const cols: { item: T; index: number }[][] = Array.from({ length: columnCount }, () => [])
  items.forEach((item, index) => cols[index % columnCount].push({ item, index }))

  return (
    <div className={`flex items-start ${className}`}>
      {cols.map((col, c) => (
        <div key={c} className={`flex min-w-0 flex-1 flex-col ${columnClassName}`}>
          {col.map(({ item, index }) => renderItem(item, index))}
        </div>
      ))}
    </div>
  )
}
