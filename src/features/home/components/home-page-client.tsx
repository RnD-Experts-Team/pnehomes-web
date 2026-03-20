'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'
import { Calendar, Pencil, Home as HomeIcon } from 'lucide-react'
import { ResponsiveMedia } from '@/features/home/components/ResponsiveMedia'
import { HomeContent, Testimonial } from '@/features/home/model/home_content.types'

// --- Testimonials Carousel (unchanged) ---
function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)
  const autoPlayRef = React.useRef<NodeJS.Timeout | null>(null)

  const stopAutoPlay = React.useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
      autoPlayRef.current = null
    }
  }, [])

  const startAutoPlay = React.useCallback(() => {
    if (!api) return
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
      autoPlayRef.current = null
    }
    autoPlayRef.current = setInterval(() => {
      api.scrollNext()
    }, 4000)
  }, [api])

  useEffect(() => {
    if (!api) return
    const update = () => {
      setCurrent(api.selectedScrollSnap())
      setCount(api.scrollSnapList().length)
    }
    update()
    api.on('reInit', update)
    api.on('select', update)

    startAutoPlay()

    const handleVisibility = () => {
      if (document.hidden) stopAutoPlay()
      else startAutoPlay()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      api.off('reInit', update)
      api.off('select', update)
      document.removeEventListener('visibilitychange', handleVisibility)
      stopAutoPlay()
    }
  }, [api, startAutoPlay, stopAutoPlay])

  return (
    <div className="relative">
      <Carousel
        setApi={setApi}
        className="mx-auto w-full max-w-3xl"
        opts={{ align: 'start', loop: true }}
        onMouseEnter={stopAutoPlay}
        onMouseLeave={startAutoPlay}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {testimonials.map((testimonial: Testimonial, index: number) => (
            <CarouselItem key={index} className="basis-full pl-2 md:pl-4">
              <div className="h-full rounded-xl bg-white p-8 shadow-sm">
                <p className="mb-6 text-lg text-gray-700 italic">
                  &ldquo;{testimonial.description}&rdquo;
                </p>
                <p className="font-semibold text-gray-900">- {testimonial.by}</p>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>

      <div className="mt-6 flex items-center justify-center gap-2">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => api?.scrollTo(i)}
            className={[
              'h-2.5 w-2.5 rounded-full transition',
              i === current ? 'bg-[color:var(--pne-accent)]' : 'bg-gray-300 hover:bg-gray-400',
            ].join(' ')}
          />
        ))}
      </div>
    </div>
  )
}

export default function HomePageClient({ content }: { content: HomeContent }) {
  // State to track when component is mounted on client
  const [isLoaded, setIsLoaded] = useState(false)

  // Wait for client-side mount to avoid hydration mismatch
  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const firstSection = content['first-section']
  const hero = content.hero
  const services = content.services
  const gridSection = content['grid-section']
  const testimonials = content.testimonials
  const contact = content.contact

  const hasFirstSectionSubtitle = !!firstSection.subtitle
  const hasBookButton = !!firstSection['book-button']
  const hasHeroSubtitle = !!hero.subtitle
  const hasServicesDescription = !!services.description

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white">
      {/* Full Page Services Background Image */}
      {isLoaded && services.cover && (
        <div className="fixed inset-0 z-0">
          <Image
            src={services.cover}
            alt="Services background"
            fill
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>
      )}
      {/* HERO */}
      <section className="relative z-10 h-[100svh] min-h-[560px] w-full overflow-hidden">
        {/* Solid gray cover for md+ screens (under video/image) */}
        <div className="absolute inset-0 hidden md:block bg-gray-300" aria-hidden />
        {/* Video for larger screens */}
        <ResponsiveMedia
          src={firstSection.video}
          className="absolute inset-0 hidden h-full w-full object-cover sm:block"
        />
        {/* Cover image for mobile screens */}
        <div className="absolute inset-0 h-full w-full bg-gray-100 sm:hidden">
          {isLoaded && firstSection['cover-for-mobile'] && (
            <Image
              src={firstSection['cover-for-mobile']}
              alt="Mobile cover image"
              fill
              className="object-cover object-center"
              priority
              sizes="100vw"
            />
          )}
        </div>
        <div className="absolute inset-0 bg-black/50 [mask-image:linear-gradient(to_bottom,black,black,transparent)]" />

        <div className="relative z-10 flex h-full items-center justify-center px-4 pt-16">
          <div className="mx-auto max-w-4xl text-center text-white">
            {firstSection.logo && (
              <div className="mb-8">
                <Image
                  src={firstSection.logo}
                  alt="PNE Homes Logo"
                  width={100}
                  height={40}
                  className="mx-auto h-auto w-[240px] object-contain sm:w-[100px] md:w-[100px]"
                  priority
                />
              </div>
            )}

            <h1
              className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
              style={{ fontFamily: '"New Caslon SB Bold", serif' }}
            >
              {firstSection.title}
            </h1>

            {hasFirstSectionSubtitle && (
              <p
                className="mx-auto mb-8 max-w-3xl text-base text-white/90 sm:text-lg md:text-xl"
                style={{ fontFamily: '"New Caslon SB Bold", serif' }}
              >
                {firstSection.subtitle}
              </p>
            )}

            {hasBookButton && (
              <Button
                asChild
                size="lg"
                className="rounded-md bg-[color:var(--pne-accent)] px-8 py-6 text-base text-white shadow-sm transition hover:shadow-md hover:brightness-110 md:text-lg"
              >
                <Link href="/contact">{firstSection['book-button']}</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Why PNE */}
      <section className="relative z-10 overflow-hidden bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-7xl text-[color:var(--pne-brand)]">
          <div className="mb-12 text-center">
            <h2
              className="text-3xl font-bold sm:text-6xl"
              style={{ fontFamily: '"New Caslon SB Bold", serif' }}
            >
              {hero.title}
            </h2>
            {hasHeroSubtitle && (
              <p
                className="mx-auto mt-3 max-w-3xl text-4xl"
                style={{ fontFamily: '"New Caslon SB Bold", serif' }}
              >
                {hero.subtitle}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {hero.sections.map((section, i) => {
              const Icon =
                section.icon === 'date' ? Calendar : section.icon === 'pen' ? Pencil : HomeIcon
              return (
                <div
                  key={i}
                  className="rounded-xl bg-white p-8 text-center text-xl transition hover:shadow-sm"
                >
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
                    <Icon aria-hidden className="h-12 w-12 text-[color:var(--pne-accent)]" />
                  </div>
                  <h3
                    className="mb-4 text-2xl font-semibold md:text-3xl"
                    style={{ fontFamily: '"New Caslon SB Bold", serif' }}
                  >
                    {section.title}
                  </h3>
                  {section.description && (
                    <p
                      className="text-lg opacity-90 md:text-xl"
                      style={{ fontFamily: '"New Caslon SB Bold", serif' }}
                    >
                      {section.description}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Services */}
      <motion.section
        className="relative z-10 overflow-hidden px-4 py-16 md:py-20"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <h2
              className="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl"
              style={{ fontFamily: '"New Caslon SB Bold", serif' }}
            >
              {services.title}
            </h2>
            {hasServicesDescription && (
              <p
                className="max-w-2xl text-xl text-gray-900 md:text-2xl"
                style={{ fontFamily: '"New Caslon SB Bold", serif' }}
              >
                {services.description}
              </p>
            )}
          </motion.div>
          <motion.div
            className="w-full space-y-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            viewport={{ once: true, amount: 0.3 }}
          >
            {services.links.map((link, i) => (
              <motion.div
                key={i}
                className="w-full"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + i * 0.1, ease: 'easeOut' }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="h-auto w-full max-w-full justify-start rounded-lg border-none py-6 text-left shadow-none ring-0 hover:bg-white"
                >
                  <Link href={`/services/${link.slug}`} className="block w-full">
                    <span
                      className="block w-full text-xl md:text-2xl"
                      style={{ fontFamily: '"New Caslon SB Bold", serif' }}
                    >
                      {link.title}
                    </span>
                  </Link>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Media Grid */}
      <div className="relative z-10 w-full bg-white">
        <motion.section
          className="bg-white px-4 py-16 md:py-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="mx-auto max-w-7xl">
            <motion.div
              className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              viewport={{ once: true, amount: 0.3 }}
            >
              {/* Communities */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <Link href="/communities" className="group block">
                  <div className="relative h-64 overflow-hidden rounded-xl bg-gray-100">
                    {isLoaded && gridSection.links[0].cover && (
                      <Image
                        src={gridSection.links[0].cover}
                        alt={gridSection.links[0].title}
                        fill
                        className="object-cover object-center"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/40 transition group-hover:bg-black/30" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3
                        className="text-3xl font-bold text-white md:text-4xl"
                        style={{ fontFamily: '"New Caslon SB Bold", serif' }}
                      >
                        {gridSection.links[0].title}
                      </h3>
                    </div>
                  </div>
                </Link>
              </motion.div>

              {/* Center video - hidden on small screens */}
              <motion.div
                className="relative hidden h-64 overflow-hidden rounded-xl md:block"
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <ResponsiveMedia
                  src={gridSection.video}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-black/5" />
              </motion.div>

              {/* Kitchens */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <Link href="/gallery/kitchens" className="group block">
                  <div className="relative h-64 overflow-hidden rounded-xl bg-gray-100">
                    {isLoaded && gridSection.links[2].cover && (
                      <Image
                        src={gridSection.links[2].cover}
                        alt={gridSection.links[2].title}
                        fill
                        className="object-cover object-center"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/40 transition group-hover:bg-black/30" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3
                        className="text-3xl font-bold text-white md:text-4xl"
                        style={{ fontFamily: '"New Caslon SB Bold", serif' }}
                      >
                        {gridSection.links[2].title}
                      </h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </motion.div>

            {/* Row 2 */}
            <motion.div
              className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
              viewport={{ once: true, amount: 0.3 }}
            >
              {/* Events */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7, ease: 'easeOut' }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <Link href="/events" className="group block">
                  <div className="relative h-64 overflow-hidden rounded-xl bg-gray-100">
                    {isLoaded && gridSection.links[1].cover && (
                      <Image
                        src={gridSection.links[1].cover}
                        alt={gridSection.links[1].title}
                        fill
                        className="object-cover object-center"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/40 transition group-hover:bg-black/30" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3
                        className="text-3xl font-bold text-white md:text-4xl"
                        style={{ fontFamily: '"New Caslon SB Bold", serif' }}
                      >
                        {gridSection.links[1].title}
                      </h3>
                    </div>
                  </div>
                </Link>
              </motion.div>

              {/* Logo tile */}
              <motion.div
                className="relative hidden h-64 overflow-hidden rounded-xl md:block"
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8, ease: 'easeOut' }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <ResponsiveMedia
                  src={gridSection.logo}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-black/5" />
                {/* <Image
                  src={gridSection.logo}
                  alt="PNE Homes Logo"
                  width={320}
                  height={160}
                  className="h-auto w-[200px] object-contain md:w-[260px] lg:w-[320px]"
                /> */}
              </motion.div>

              {/* Custom Homes */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9, ease: 'easeOut' }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <Link href="/services/custom-homes" className="group block">
                  <div className="relative h-64 overflow-hidden rounded-xl bg-gray-100">
                    {isLoaded && gridSection.links[3].cover && (
                      <Image
                        src={gridSection.links[3].cover}
                        alt={gridSection.links[3].title}
                        fill
                        className="object-cover object-center"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/40 transition group-hover:bg-black/30" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3
                        className="text-3xl font-bold text-white md:text-4xl"
                        style={{ fontFamily: '"New Caslon SB Bold", serif' }}
                      >
                        {gridSection.links[3].title}
                      </h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
      </div>

      {/* Testimonials */}
      <section className="relative z-10 w-full overflow-hidden bg-white px-4 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-10 text-center text-3xl font-bold text-gray-900 sm:text-4xl">
            What Our Clients Say
          </h2>
          <TestimonialsCarousel testimonials={testimonials} />
        </div>
      </section>

      {/* Contact CTA */}
      <section className="relative z-10 overflow-hidden bg-white px-4 py-16 text-center md:py-20">
        <div className="mx-auto max-w-3xl">
          <Button
            asChild
            size="lg"
            className="rounded-md bg-[color:var(--pne-accent)] px-12 py-6 text-base text-white shadow-sm transition hover:shadow-md hover:brightness-110 md:text-lg"
          >
            <Link href="/contact">{contact}</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
