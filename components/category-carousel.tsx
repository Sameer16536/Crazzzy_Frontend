'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { useCatalog } from '@/lib/catalog/use-catalog'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { cn } from '@/lib/utils'
import Image from 'next/image'

export function CategoryCarousel() {
  const { data, isLoading } = useCatalog()
  const reduceMotion = useReducedMotion()

  const categories = data?.categories ?? []

  return (
    <div className="relative">
      <Carousel
        opts={{
          align: 'start',
          loop: true,
          dragFree: true,
        }}
        className="px-12"
      >
        <CarouselContent className="-ml-4">
          {(isLoading ? Array.from({ length: 8 }) as typeof categories : categories).map((category, idx) => {
            const key = isLoading ? `skeleton-${idx}` : (category as {id:string}).id
            const href = isLoading ? '#' : `/shop/${(category as {slug:string}).slug}`
            const name = isLoading ? 'Loading…' : (category as {name:string}).name
            const description = isLoading ? '' : (category as {description:string}).description
            const image = isLoading ? '' : (category as {image:string}).image

            return (
              <CarouselItem
                key={key}
                className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/5"
              >
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
                  viewport={{ amount: 0.4, once: true }}
                  transition={{ duration: 0.35, ease: 'easeOut' as const }}
                >
                  <Link
                    href={href}
                    aria-disabled={isLoading}
                    className={cn('block', isLoading && 'pointer-events-none')}
                  >
                    <motion.div
                      whileHover={reduceMotion ? {} : { y: -2 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                      className="group"
                    >
                      <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-white border border-black/5 p-6">
                        {image ? (
                          <Image
                            src={image}
                            alt={name}
                            fill
                            className="object-contain transition-transform duration-500"
                          />
                        ) : (
                          <div
                            className={cn(
                              'w-full h-full flex items-center justify-center',
                              isLoading
                                ? 'animate-pulse bg-muted'
                                : 'text-foreground/20 group-hover:text-foreground/35 transition-colors',
                            )}
                            style={
                              isLoading
                                ? undefined
                                : {
                                  background: `radial-gradient(60% 60% at 50% 35%, ${(category as {color:string}).color}22 0%, transparent 70%)`,
                                }
                            }
                          >
                            <span className="text-4xl">⬡</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      <div className="text-center min-h-[44px]">
                        <h3 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-tight">
                          {name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1 min-h-4">
                          {description || ' '}
                        </p>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              </CarouselItem>
            )
          })}
        </CarouselContent>

        <CarouselPrevious className="-left-1 top-1/2 -translate-y-1/2" />
        <CarouselNext className="-right-1 top-1/2 -translate-y-1/2" />
      </Carousel>
    </div>
  )
}

