import { getOurTeamData, TeamMember } from '@/features/ourTeam/api'
import Image from 'next/image'
import Link from 'next/link'

export const dynamic = 'force-dynamic' // ✅ always dynamic rendering (no stale server cache)

export default async function OurTeamPage() {
  const teamData = await getOurTeamData()

  // ✅ avoid double-fetch: cover is already part of teamData
  const coverImage = teamData?.cover || null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== Hero ===== */}
      {coverImage && (
        <section className="relative isolate h-[60vh] overflow-hidden">
          {/* Parallax background image container */}
          <div className="fixed inset-0 -z-10 bg-gray-100">
            <Image
              src={coverImage}
              alt="Our Team Hero"
              fill
              className="object-cover object-center"
              priority
              sizes="100vw"
              style={{
                transform: 'translateZ(0)', // Force hardware acceleration
              }}
            />
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-white/10 to-black/10" />
          </div>

          {/* Centered content */}
          <div className="relative z-20 container mx-auto flex h-full items-center justify-center px-6 text-center">
            <h1 className="text-pne-brand mx-auto max-w-[800px] text-4xl font-extrabold tracking-tight break-words uppercase sm:text-5xl">
              {teamData?.title || 'Our Team'}
            </h1>
          </div>
        </section>
      )}

      {/* Slogan section */}
      {teamData?.slogan && (
        <div className="relative z-10 bg-white py-2 text-center">
          <div className="container mx-auto px-6">
            <p className="text-pne-brand mb-3 text-lg font-bold tracking-[0.2em] uppercase">
              {teamData.slogan}
            </p>
          </div>
        </div>
      )}

      {/* Content wrapper with white background */}
      <div className="relative z-10 min-h-full bg-white">
        <div className="px-4 py-16 pb-16">
          <div className="mx-auto max-w-6xl">
            {/* Title section when no cover image */}
            {!coverImage && (
              <div className="pb-16 text-center">
                <div className="container mx-auto px-6">
                  {teamData?.slogan && (
                    <p className="text-pne-brand mb-3 text-xs font-semibold tracking-[0.2em] uppercase">
                      {teamData.slogan}
                    </p>
                  )}
                  <h1 className="text-pne-brand mb-4 text-4xl font-extrabold tracking-tight uppercase sm:text-5xl">
                    {teamData?.title || 'Our Team'}
                  </h1>
                </div>
              </div>
            )}

            {/* Description section */}
            {teamData?.description && (
              <div className="py-2 text-center">
                <div className="container mx-auto px-6">
                  <p className="text-pne-brand mx-auto max-w-3xl text-base/7 sm:text-lg/8">
                    {teamData.description}
                  </p>
                </div>
              </div>
            )}

            {/* ===== Team Grid ===== */}
            <section className="py-16 sm:py-20">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {teamData?.team?.map((member: TeamMember, index: number) => (
                    <article
                      key={`${member.name}-${index}`}
                      className="group relative overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/5 transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl"
                    >
                      {/* Media */}
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <Image
                          src={member.cover}
                          alt={member.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          priority={index < 3}
                        />
                        {/* Overlays */}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-95" />
                        {/* Top-right subtle badge line (decorative) */}
                        <div className="pointer-events-none absolute top-4 right-4 h-8 w-8 rounded-full border border-white/30 opacity-70 backdrop-blur-[2px] group-hover:opacity-100" />
                      </div>

                      {/* Text block over image, pinned to bottom */}
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6">
                        <h3 className="text-white drop-shadow-sm">
                          <span className="block text-xl font-bold tracking-tight">
                            {member.name}
                          </span>
                        </h3>
                        <p className="text-pne-accent mt-1 font-semibold">{member.position}</p>

                        {/* Slide-up bio on hover (clamped when not hovered) */}
                        {member.description && (
                          <p className="mt-3 max-h-0 overflow-hidden text-sm text-white/90 transition-[max-height] duration-500 ease-out group-hover:max-h-40">
                            {member.description}
                          </p>
                        )}
                      </div>

                      {/* Card underline accent on hover */}
                      <span className="from-pne-accent via-pne-brand to-pne-accent absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </article>
                  ))}
                </div>

                {/* ===== Contact CTA ===== */}
                {teamData?.contact && (
                  <div className="mt-12 border-t border-gray-200 pt-8">
                    <div className="text-center">
                      <Link
                        href={`/contact?message=${encodeURIComponent(teamData.contact.message)}`}
                        className="bg-pne-accent hover:bg-pne-brand focus:ring-pne-accent inline-flex items-center rounded-md border border-transparent px-6 py-3 text-base font-medium text-white transition-colors duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none"
                      >
                        {teamData.contact.title}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
