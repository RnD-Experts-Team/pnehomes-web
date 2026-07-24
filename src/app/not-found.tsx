import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="space-y-2">
        <p className="text-5xl font-extrabold text-[color:var(--pne-accent)]">404</p>
        <h1 className="text-2xl font-bold text-[color:var(--pne-brand)]">Page not found</h1>
        <p className="max-w-md text-sm text-gray-500">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  )
}
