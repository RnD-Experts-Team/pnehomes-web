'use client'

import { CmsMedia, type MediaType } from '@/components/CmsMedia'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface ServicePageClientProps {
  service: {
    title: string
    sub_title?: string
    description?: string
    content: Array<{
      sub_title: string
      description: string
      img: string
      img_type?: MediaType
    }>
    contact: {
      title: string
      message: string
    }
  }
  coverImage: string | null
  coverType?: MediaType
}

export default function ServicePageClient({ service, coverImage, coverType }: ServicePageClientProps) {
  return (
    <div className="relative min-h-full">
      {/* Hero Section with Cover Image */}
      {coverImage && (
        <section className="relative isolate overflow-hidden h-[60vh]">
          {/* Parallax background image container */}
          <div className="fixed inset-0 -z-10 bg-gray-100">
            <CmsMedia
              src={coverImage}
              mediaType={coverType}
              isCover
              alt="Service Cover"
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
            <h1 className="text-pne-brand text-4xl font-extrabold tracking-tight uppercase sm:text-5xl">
              {service.title}
            </h1>
          </div>
        </section>
      )}

      {/* Content wrapper with white background */}
      <div className="relative z-10 bg-white min-h-full">
        <div className="px-4 py-16 pb-16">
        <div className="mx-auto max-w-6xl">
          {/* Service Title - Only show if no cover */}
          {!coverImage && (
            <div className="mb-8 text-center">
              <h1 className="text-foreground text-4xl leading-tight font-bold md:text-5xl lg:text-6xl">
                {service.title}
              </h1>
            </div>
          )}

          {/* Service Sub-title (if exists) */}
          {service.sub_title && (
            <div className="mb-8 text-center">
              <h2 className="text-muted-foreground text-xl font-medium md:text-2xl lg:text-3xl">
                {service.sub_title}
              </h2>
            </div>
          )}

          {/* Service Description (if exists) */}
          {service.description && (
            <div className="mx-auto mb-16 max-w-4xl text-center">
              <p className="text-muted-foreground text-lg leading-relaxed md:text-xl">
                {service.description}
              </p>
            </div>
          )}

          {/* Service Content with Alternating Layout */}
          <div className="space-y-16">
            {service.content.map((item, index) => {
              const isEven = index % 2 === 0

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12 ${
                    isEven ? '' : 'lg:grid-flow-col-dense'
                  }`}
                >
                  {/* Image */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: index * 0.1 + 0.2 }}
                    className={`relative h-64 w-full overflow-hidden rounded-xl md:h-80 lg:h-96 ${
                      isEven ? '' : 'lg:col-start-2'
                    }`}
                  >
                    <CmsMedia
                      src={item.img}
                      mediaType={item.img_type}
                      alt={item.sub_title}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 50vw, 100vw"
                    />
                  </motion.div>

                  {/* Text Content */}
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                    className={`space-y-4 ${isEven ? '' : 'lg:col-start-1 lg:row-start-1'}`}
                  >
                    <h3 className="text-foreground text-2xl font-bold md:text-3xl">
                      {item.sub_title}
                    </h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {item.description}
                    </p>
                  </motion.div>
                </motion.div>
              )
            })}
          </div>

          {/* Contact Us Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 text-center"
          >
            <Button 
              asChild 
              size="lg" 
              className="px-12 py-4 text-lg bg-pne-accent hover:bg-pne-brand text-white font-semibold transition-colors duration-300"
            >
              <Link
                href={`/contact?message=${encodeURIComponent(service.contact.message.replace('{title}', service.title))}`}
              >
                {service.contact.title}
              </Link>
            </Button>
          </motion.div>
        </div>
        </div>
      </div>
    </div>
  )
}