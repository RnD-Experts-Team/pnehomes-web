import { EventsAPI } from '@/features/events/api'
import type { Event } from '@/features/events/model/types'
import ImageGallery from '@/components/ImageGallery'
import Image from 'next/image'
import Link from 'next/link'

export default async function EventsPage() {
  // Fetch events data
  const eventsResponse = await EventsAPI.getEventsData()

  if (!eventsResponse.success || !eventsResponse.data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-600">Error Loading Events</h1>
          <p className="text-gray-600">{eventsResponse.error || 'Failed to load events data'}</p>
        </div>
      </div>
    )
  }

  const { title, slogan, events, contact, cover } = eventsResponse.data

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Cover Image */}
      {cover && (
        <section className="relative isolate overflow-hidden h-[60vh]">
          {/* Parallax background image container */}
          <div className="fixed inset-0 -z-10 bg-gray-100">
            <Image
              src={cover}
              alt="Events Hero"
              fill
              className="object-cover object-center"
              priority
              sizes="100vw"
              style={{
                transform: 'translateZ(0)', // Force hardware acceleration
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-white/10 to-black/10 z-10" />
          </div>

          {/* Centered content */}
          <div className="relative z-20 container mx-auto flex h-full items-center justify-center px-6 text-center">
            <h1 className="text-pne-brand text-4xl font-extrabold tracking-tight uppercase sm:text-5xl max-w-[800px] mx-auto break-words">
              {title}
            </h1>
          </div>
        </section>
      )}

      {/* Content Wrapper with White Background */}
      <div className="relative z-30 bg-white">
        {/* Slogan Section */}
        <section className="bg-gray-50 py-8">
          <div className="container mx-auto px-6 text-center">
            <p className="text-gray-800 text-xl font-medium md:text-2xl lg:text-3xl">
              {slogan}
            </p>
          </div>
        </section>

        {/* Events Section */}
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-16">
          {events.map((event: Event, index: number) => {
            const isEven = index % 2 === 0
            
            return (
              <div key={index} className="overflow-hidden rounded-lg bg-white shadow-lg">
                <div className={`grid gap-8 lg:grid-cols-2 ${isEven ? '' : 'lg:grid-cols-2'}`}>
                  {/* Content Section */}
                  <div className={`p-6 md:p-8 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                    <h2 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">{event.title}</h2>
                    {event.description && (
                      <p className="leading-relaxed text-gray-700">{event.description}</p>
                    )}
                  </div>

                  {/* Images Section */}
                  {event.gallery && event.gallery.length > 0 && (
                    <div className={`p-6 md:p-8 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                      <ImageGallery 
                        images={event.gallery.map(g => typeof g === 'string' ? g : g.url)} 
                        title={event.title}
                        maxVisibleImages={4}
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Contact Section */}
        {contact && (
          <div className="mt-12 border-t border-gray-200 pt-8">
            <div className="text-center">
              <Link
                href={`/contact?message=${encodeURIComponent(contact.message)}`}
                className="inline-flex items-center rounded-md border border-transparent bg-pne-accent px-6 py-3 text-base font-medium text-white transition-colors duration-200 hover:bg-pne-brand focus:ring-2 focus:ring-pne-accent focus:ring-offset-2 focus:outline-none"
              >
                {contact.title}
              </Link>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
