/**
 * Home Page — Poster Marquee Hero
 *
 * Hero: full-width two-row horizontal right-to-left poster card marquee.
 * No text column — pure product imagery with a floating title overlay.
 */

'use client'

import { Navbar } from '@/components/navbar'
import { ProductCard } from '@/components/product-card'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { BentoGridCategories } from '@/components/bento-grid-categories'
import { useCatalog } from '@/lib/catalog/use-catalog'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { DealOfTheDay } from '@/components/deal-of-the-day'
import { ComboDealsSection } from '@/components/combo-deals-section'
import { PromotionTicker } from '@/components/promotion-ticker'
import { SpotlightSection } from '@/components/spotlight-section'

// ─── useCardSize ──────────────────────────────────────────────────────────────
// Returns responsive card dimensions so mobile users see 2.5–3 cards at once
// (the "peek" effect signals there's more to scroll/explore).
// SSR-safe: defaults to desktop size on server to avoid hydration mismatch.
function useCardSize() {
  const [size, setSize] = useState({ w: 220, h: 310 })

  useEffect(() => {
    function update() {
      const vw = window.innerWidth
      if (vw < 480) {
        setSize({ w: 120, h: 170 })   // mobile:  ~3 cards visible at once
      } else if (vw < 768) {
        setSize({ w: 150, h: 210 })   // large phone / small tablet
      } else if (vw < 1024) {
        setSize({ w: 180, h: 255 })   // tablet
      } else {
        setSize({ w: 220, h: 310 })   // desktop
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return size
}


// One row of big rectangular poster cards scrolling continuously.
function PosterMarqueeRow({
  posters,
  speed = 40,
  reverse = false,
  cardW = 220,
  cardH = 310,
}: {
  posters: any[]
  speed?: number
  reverse?: boolean
  cardW?: number
  cardH?: number
}) {
  if (!posters.length) {
    // Skeleton placeholders — same dimensions as real cards
    return (
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 bg-white/[0.05] animate-pulse"
            style={{ width: cardW, height: cardH }}
          />
        ))}
      </div>
    )
  }

  // Duplicate exactly 2× — the marqueeLeft/Right keyframes translate by
  // -50%, which means the track must be 2× the content width to loop
  // seamlessly. 3× would put the reset point mid-track and cause a jump.
  const track = [...posters, ...posters]

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
      }}
    >
      <div
        className="flex gap-3"
        style={{
          animation: `${reverse ? 'marqueeRight' : 'marqueeLeft'} ${speed}s linear infinite`,
          willChange: 'transform',
          width: 'max-content',
        }}
      >
        {track.map((p, i) => {
          const img = p.images?.[0] ?? p.imageUrl ?? null
          return (
            <Link
              key={`${p.id}-${i}`}
              href={`/product/${p.slug ?? p.id}`}
              className="group relative flex-shrink-0 overflow-hidden bg-zinc-950"
              style={{ width: cardW, height: cardH }}
            >
              {img ? (
                <Image
                  src={img}
                  alt={p.name ?? ''}
                  fill
                  unoptimized
                  priority={i < 6}
                  loading={i < 6 ? 'eager' : 'lazy'}
                  className="object-contain transition-transform duration-700 group-hover:scale-105"
                  sizes={`${cardW}px`}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                  <span className="text-white/20 text-xs uppercase tracking-widest">No Image</span>
                </div>
              )}
              {/* Hover / tap overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end px-3 py-2 z-10">
                <p className="text-white text-[10px] font-bold leading-snug line-clamp-1">{p.name}</p>
                <p className="text-primary font-mono text-[10px] mt-0.5">₹{p.price}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}


// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const { data } = useCatalog()
  const products = data?.products ?? []
  const { w: cardW, h: cardH } = useCardSize()

  // ── Poster marquee: single fetch, client-side category grouping ──────────
  // ONE request fires immediately on mount — no waiting for catalog categories.
  // The backend includes `category` in every product row, so we group by
  // p.category.slug client-side, then round-robin interleave the groups.
  // Result: zero waterfall, zero extra requests, full subcategory diversity.
  const [row1Posters, setRow1Posters] = useState<any[]>([])
  const [row2Posters, setRow2Posters] = useState<any[]>([])

  // Round-robin interleave: [A1,B1,C1, A2,B2,C2, A3,B3…]
  function roundRobin<T>(buckets: T[][]): T[] {
    const result: T[] = []
    const maxLen = Math.max(0, ...buckets.map(b => b.length))
    for (let i = 0; i < maxLen; i++) {
      for (const bucket of buckets) {
        if (i < bucket.length) result.push(bucket[i])
      }
    }
    return result
  }

  useEffect(() => {
    // Single flat request — starts immediately, no dependency on categories
    api.get<any>('/products?category=wall-posters&limit=80')
      .then((res) => {
        const raw: any[] = res?.data || []

        // Map — preserve category slug from the embedded `category` object
        const mapped = raw.map((p: any) => ({
          id: String(p.id),
          name: p.title,
          slug: p.slug,
          price: parseFloat(p.price),
          categorySlug: p.category?.slug ?? 'wall-posters',
          imageUrl: p.imageUrl,
          images: p.images?.length > 0
            ? p.images.map((img: any) => img.imageUrl)
            : [p.imageUrl],
        }))

        // Group by subcategory slug client-side (O(n), no extra requests)
        const bucketMap = new Map<string, typeof mapped>()
        for (const poster of mapped) {
          const key = poster.categorySlug
          if (!bucketMap.has(key)) bucketMap.set(key, [])
          bucketMap.get(key)!.push(poster)
        }
        const buckets = [...bucketMap.values()]

        // Round-robin so the strip alternates: Sports, Anime, Movies, Sports…
        const interleaved = buckets.length > 1
          ? roundRobin(buckets)
          : mapped // single category → use as-is

        if (interleaved.length >= 8) {
          const mid = Math.ceil(interleaved.length / 2)
          setRow1Posters(interleaved.slice(0, mid))
          setRow2Posters(interleaved.slice(mid))
        } else {
          // Tiny catalog fallback
          setRow1Posters(interleaved.filter((_, i) => i % 2 === 0))
          setRow2Posters(interleaved.filter((_, i) => i % 2 !== 0))
        }
      })
      .catch(() => { /* skeleton stays visible on error */ })
  }, []) // empty dep array — fires once on mount, no waterfall



  const featuredProducts = products.filter((p) => p.featured).slice(0, 8)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <PromotionTicker />
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          HERO — Full-bleed poster marquee (no text overlay)
          ════════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-background overflow-hidden">

        {/* Tiny eyebrow heading — stays outside, above the rows */}
        <motion.div
          className="text-center py-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-foreground/80 text-sm sm:text-base font-black tracking-[0.08em] uppercase">
            Wall Posters That Hit Different
          </p>
        </motion.div>

        {/* Row 1 — first half of catalog, scrolls left */}
        <PosterMarqueeRow posters={row1Posters} speed={80} cardW={cardW} cardH={cardH} />

        {/* Row 2 — second half of catalog, scrolls right */}
        <div className="mt-3">
          <PosterMarqueeRow posters={row2Posters} speed={65} reverse cardW={cardW} cardH={cardH} />
        </div>

        {/* CTA below the marquee */}
        <motion.div
          className="flex justify-center px-4 pt-5 pb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link
            href="/shop?category=wall-posters"
            id="hero-shop-cta"
            className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 sm:px-10 sm:py-4 bg-primary hover:bg-primary/90 text-black font-black text-xs sm:text-sm tracking-widest uppercase whitespace-nowrap transition-all duration-300 active:scale-95"
          >
            Shop All Posters
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform flex-shrink-0" />
          </Link>
        </motion.div>
      </section>


      {/* ════════════════════════════════════════════════════════════════════
          DEAL OF THE DAY
          ════════════════════════════════════════════════════════════════════ */}
      <DealOfTheDay />
      <ComboDealsSection />

      {/* ════════════════════════════════════════════════════════════════════
          SPOTLIGHT — Admin-configured cinematic offer banner
          ════════════════════════════════════════════════════════════════════ */}
      <SpotlightSection />

      {/* ════════════════════════════════════════════════════════════════════
          SHOP BY CATEGORIES — Bento Grid
          ════════════════════════════════════════════════════════════════════ */}
      <section
        id="categories"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 relative"
      >
        {/* Section Label */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-8 h-px bg-primary" />
          <span className="text-primary text-xs font-mono tracking-[0.25em] uppercase">Collections</span>
        </div>

        <div className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <motion.h2
              className="text-3xl sm:text-5xl lg:text-6xl font-black text-foreground leading-[1.1] sm:leading-none tracking-tight"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              style={{ willChange: 'transform' }}
            >
              SHOP BY<br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #d4af37 0%, #f5e27a 50%, #d4af37 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                CATEGORIES
              </span>
            </motion.h2>
            <motion.p
              className="text-muted-foreground max-w-xs text-sm leading-relaxed"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              Explore our curated collections and find exactly what defines your aesthetic.
            </motion.p>
          </div>

          <BentoGridCategories />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          FEATURED PRODUCTS
          ════════════════════════════════════════════════════════════════════ */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          {/* Section Label */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-8 h-px bg-primary" />
            <span className="text-primary text-xs font-mono tracking-[0.25em] uppercase">Hand-Picked</span>
          </div>

          <div className="space-y-10">
            <div className="flex items-end justify-between">
              <motion.h2
                className="text-3xl sm:text-5xl font-black text-foreground leading-[1.1] sm:leading-none tracking-tight"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                style={{ willChange: 'transform' }}
              >
                FEATURED<br />PRODUCTS
              </motion.h2>
              <Link
                href="/shop"
                id="featured-view-all"
                className="text-primary hover:text-primary/80 font-semibold transition-colors flex items-center gap-1 group cursor-interactive text-sm"
              >
                View All
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {featuredProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  style={{ willChange: 'transform' }}
                >
                  {/* priority on first 2 cards for LCP optimization */}
                  <ProductCard product={product} priority={idx < 2} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          NEWSLETTER
          ════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
        <motion.div
          className="space-y-8 backdrop-blur-md border border-border/50 rounded-none p-12 text-center relative overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.02)', willChange: 'transform' }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Corner accent lines */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary" />

          <div className="space-y-4">
            <p className="text-primary text-xs font-mono tracking-[0.25em] uppercase">Exclusive Access</p>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground">
              Stay Updated
            </h2>
            <p className="text-muted-foreground max-w-sm mx-auto text-sm leading-relaxed">
              New drops, limited editions, and insider content — delivered straight to your inbox.
            </p>
          </div>

          <form
            className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              id="newsletter-email"
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-5 py-3.5 bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all rounded-none font-mono"
            />
            <button
              type="submit"
              id="newsletter-submit"
              className="px-6 py-3.5 bg-primary hover:bg-primary/90 text-black font-bold text-sm tracking-wider uppercase transition-all duration-300 active:scale-95 whitespace-nowrap cursor-interactive rounded-none"
            >
              Subscribe
            </button>
          </form>

          <p className="text-xs text-muted-foreground">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </motion.div>
      </section>
    </div>
  )
}
