/**
 * Home Page — Cinematic Premium E-Commerce Hero v2
 *
 * Upgrades in this version:
 *  - Two-column hero: text left | Cinematic SVG-clipped video portal right
 *  - Hero-scoped grain overlay (5% opacity, filmic look)
 *  - rAF-throttled mouse parallax: text floats against cursor, portal floats with it
 *  - Magnetic 'Start Shopping' button (pulls toward cursor)
 *  - Bento grid rebuilt with CSS grid-template-areas + staggered entrance
 *  - next/image priority on first 2 featured product cards (LCP)
 *  - All animated elements use will-change: transform for GPU compositing
 *  - Smooth 0.5 s dark/light mode body transition (in globals.css)
 */

'use client'

import { Navbar } from '@/components/navbar'
import { ProductCard } from '@/components/product-card'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Instagram, Facebook, Youtube, Twitter, MapPin, ArrowRight, ChevronDown } from 'lucide-react'
import { BentoGridCategories } from '@/components/bento-grid-categories'
import { useCatalog } from '@/lib/catalog/use-catalog'
import { motion } from 'framer-motion'
import { useRef, useState, useEffect, useCallback } from 'react'
import { useMouseParallax } from '@/hooks/use-mouse-parallax'
import { useMagneticButton } from '@/hooks/use-animations'
import { DealOfTheDay } from '@/components/deal-of-the-day'
import { ComboDealsSection } from '@/components/combo-deals-section'

// ─── ShowcaseCard ─────────────────────────────────────────────────────────────
function ShowcaseCard({ product, index = 0 }: { product: any; index?: number }) {
  const imageUrl = product.images?.[0]?.imageUrl ?? product.imageUrl ?? null
  return (
    <Link href={`/product/${product.slug ?? product.id}`} className="group block flex-shrink-0">
      <div
        className="relative w-full overflow-hidden bg-white/[0.03] border border-white/[0.07] group-hover:border-primary/50 transition-all duration-500"
        style={{
          aspectRatio: '3/4',
          boxShadow: '0 0 0 0 rgba(212,175,55,0)',
          transition: 'border-color 0.5s, box-shadow 0.5s',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 24px rgba(212,175,55,0.12)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 0 rgba(212,175,55,0)'
        }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.title ?? product.name ?? ''}
            fill
            unoptimized
            priority={index < 12}
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 140px, 200px"
          />
        ) : (
          <div className="absolute inset-0 bg-white/5 flex items-center justify-center">
            <span className="text-white/20 text-xs uppercase tracking-widest">No Image</span>
          </div>
        )}
        {/* Bottom info overlay — appears on hover */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-400">
          <p className="text-[8px] font-black uppercase tracking-[0.15em] text-white line-clamp-1">
            {product.title ?? product.name}
          </p>
          <p className="text-[9px] font-mono font-bold text-primary mt-0.5">
            ₹{Number(product.price).toLocaleString('en-IN')}
          </p>
        </div>
        {/* Corner accent */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-primary/30 group-hover:border-primary/80 transition-colors duration-500" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-primary/30 group-hover:border-primary/80 transition-colors duration-500" />
      </div>
    </Link>
  )
}

// ─── ProductShowcase ──────────────────────────────────────────────────────────
function ProductShowcase({ products, mobile = false }: { products: any[]; mobile?: boolean }) {
  if (!products.length) return null

  // Create a large pool of products for a "continuous" random feel
  // We duplicate the array until we have a healthy amount, then shuffle.
  const pool = products.length < 20 ? [...products, ...products, ...products] : products
  const shuffled = [...pool].sort((a, b) => (a.id % 7) - (b.id % 7)) // Pseudo-random but stable for the render

  if (mobile) {
    // For a seamless horizontal loop with translateY/X(-50%), we need EXACTLY 2 identical sets.
    const track = [...shuffled, ...shuffled]
    return (
      <div
        className="relative w-full overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
        }}
      >
        <div className="flex gap-4 animate-marquee-left py-4 w-max">
          {track.map((p, i) => (
            <div key={`${p.id}-${i}`} className="w-[140px] flex-shrink-0">
              <ShowcaseCard product={p} index={i} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const mid = Math.ceil(shuffled.length / 2)
  const col1 = shuffled.slice(0, mid)
  const col2 = shuffled.slice(mid).length ? shuffled.slice(mid) : [...shuffled].reverse()
  
  // For seamless vertical loop: EXACTLY 2 identical sets
  const track1 = [...col1, ...col1]
  const track2 = [...col2, ...col2]
  
  return (
    <div
      className="relative w-full h-[520px] overflow-hidden"
      style={{
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
      }}
    >
      {/* Radial gold ambient */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(212,175,55,0.07) 0%, transparent 70%)' }}
      />
      <div className="flex gap-3 h-full px-1">
        {/* Column 1 — scrolls UP */}
        <div className="flex-1 flex flex-col gap-3 animate-marquee-up h-max">
          {track1.map((p, i) => <ShowcaseCard key={`c1-${p.id}-${i}`} product={p} index={i} />)}
        </div>
        {/* Column 2 — scrolls DOWN */}
        <div className="flex-1 flex flex-col gap-3 animate-marquee-down h-max">
          {track2.map((p, i) => <ShowcaseCard key={`c2-${p.id}-${i}`} product={p} index={i + 20} />)}
        </div>
      </div>
    </div>
  )
}


/**
 * wordReveal — staggered word reveal from below with blur.
 * GPU-safe: uses opacity + y + filter (all compositor-friendly on Chrome/Firefox).
 */
const wordReveal = {
  hidden: { opacity: 0, y: 60, filter: 'blur(12px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      delay: i * 0.12,
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
}

/** lineReveal — for subtitle, CTAs, and stats */
const lineReveal = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.55 + i * 0.15, duration: 0.7, ease: 'easeOut' as const },
  }),
}

// ─── HeroHeadline ────────────────────────────────────────────────────────────

function HeroHeadline() {
  const lines = [
    ['Collect', 'Your'],
    ['Universe'],
  ]
  let wordIdx = 0
  return (
    <h1 className="text-[clamp(2.2rem,8vw,5rem)] font-black leading-[0.88] tracking-tight text-foreground">
      {lines.map((line, li) => (
        <div key={li} className="overflow-hidden">
          <div className="flex flex-wrap gap-x-[0.18em]">
            {line.map((word) => {
              const idx = wordIdx++
              return (
                <motion.span
                  key={`${word}-${idx}`}
                  custom={idx}
                  variants={wordReveal}
                  initial="hidden"
                  animate="visible"
                  className="inline-block"
                  style={{
                    willChange: 'transform',
                    ...(word === 'Universe'
                      ? {
                        background: 'linear-gradient(135deg, #d4af37 0%, #f5e27a 50%, #d4af37 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }
                      : {}),
                  }}
                >
                  {word}
                </motion.span>
              )
            })}
          </div>
        </div>
      ))}
    </h1>
  )
}


// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const { data } = useCatalog()
  const products = data?.products ?? []
  // Take more products for the hero showcase to make it feel endless
  const showcaseProducts = products.length > 0 ? products.slice(0, 40) : []
  const featuredProducts = products.filter((p) => p.featured).slice(0, 12)
  const heroRef = useRef<HTMLElement>(null)

  // Mouse parallax
  const textParallax = useMouseParallax(-0.012, 60, 18)
  const showcaseParallax = useMouseParallax(0.010, 40, 12)

  // Magnetic CTA button
  const { ref: magneticRef, x: magneticX, y: magneticY } = useMagneticButton(0.3)

  const scrollPastHero = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ════════════════════════════════════════════════════════════════════
          HERO SECTION — Two-column: Text left | Product Showcase right
          ════════════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-20 md:pt-0"
      >
        {/* Rich gradient background — replaces video */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 90% 70% at 20% 50%, rgba(212,175,55,0.07) 0%, transparent 60%),
              radial-gradient(ellipse 50% 60% at 85% 20%, rgba(212,175,55,0.04) 0%, transparent 50%),
              radial-gradient(ellipse 40% 40% at 75% 80%, rgba(212,175,55,0.03) 0%, transparent 50%)
            `,
          }}
        />
        {/* Subtle dot-grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* Edge vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/20" />

        {/* ── Two-column content grid ── */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 w-full h-auto md:h-full md:flex items-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center w-full">

            {/* ── LEFT COLUMN: Text ── */}
            <motion.div
              className="max-w-2xl"
              style={{
                x: textParallax.x,
                y: textParallax.y,
                willChange: 'transform',
              }}
            >
              {/* Eyebrow tag */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-3 mb-4 sm:mb-8"
              >
                <div className="w-4 sm:w-8 h-px bg-primary flex-shrink-0" />
                <span className="text-black/60 dark:text-primary/90 text-[9px] sm:text-xs font-mono tracking-[0.15em] sm:tracking-[0.25em] uppercase truncate">
                  Curated Collectibles • Premium Aesthetic
                </span>
              </motion.div>

              {/* Staggered Headline */}
              <HeroHeadline />

              {/* Subtitle */}
              <motion.p
                custom={0}
                variants={lineReveal}
                initial="hidden"
                animate="visible"
                className="mt-5 text-base sm:text-lg text-black/80 dark:text-white/70 max-w-lg leading-relaxed font-light"
              >
                From anime figures to die-cast legends — discover premium pieces that turn any space into a personal gallery.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                custom={1}
                variants={lineReveal}
                initial="hidden"
                animate="visible"
                className="flex flex-col sm:flex-row gap-4 mt-8"
              >
                {/* Magnetic CTA wrapper */}
                <div ref={magneticRef} className="inline-flex">
                  <motion.div style={{ x: magneticX, y: magneticY, willChange: 'transform' }}>
                    <Link
                      href="/shop"
                      id="hero-shop-cta"
                      className="group px-8 py-4 bg-primary hover:bg-primary/90 text-black font-bold rounded-none transition-colors duration-300 active:scale-95 inline-flex items-center gap-3 justify-center cursor-interactive text-sm tracking-wider uppercase"
                    >
                      Start Shopping
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                </div>

                <Link
                  href="#categories"
                  id="hero-categories-cta"
                  className="px-8 py-4 bg-transparent hover:bg-foreground/5 text-foreground dark:text-white font-semibold rounded-none border border-border dark:border-white/30 hover:border-foreground/20 dark:hover:border-white/60 transition-all duration-300 active:scale-95 inline-flex items-center justify-center cursor-interactive text-sm tracking-wider uppercase"
                >
                  Browse Categories
                </Link>
              </motion.div>

              {/* Mobile Showcase: horizontal marquee after CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="md:hidden mt-10"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-4 h-px bg-primary/40" />
                  <span className="text-primary/60 text-[8px] font-mono tracking-[0.2em] uppercase">Featured</span>
                </div>
                <ProductShowcase products={showcaseProducts} mobile />
              </motion.div>

              {/* Floating Stats Bar */}
              <motion.div
                custom={2}
                variants={lineReveal}
                initial="hidden"
                animate="visible"
                className="flex flex-wrap gap-6 sm:gap-10 mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10"
              >
                {[
                  { value: '500+', label: 'Premium Items' },
                  { value: '2000+', label: 'Happy Customers' },
                  { value: '24/7', label: 'Customer Support' },
                ].map((stat) => (
                  <div key={stat.label} className="space-y-1">
                    <p className="text-2xl font-black text-foreground dark:text-white font-mono">{stat.value}</p>
                    <p className="text-xs text-muted-foreground dark:text-white/50 uppercase tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* ── RIGHT COLUMN: Product Showcase Marquee ── */}
            <motion.div
              className="hidden md:block overflow-hidden"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{
                x: showcaseParallax.x,
                y: showcaseParallax.y,
                willChange: 'transform',
              }}
            >
              {/* Label */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-px bg-primary/60" />
                <span className="text-primary/70 text-[9px] font-mono tracking-[0.25em] uppercase">Featured Collection</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>
              <ProductShowcase products={showcaseProducts} />
              {/* Bottom label */}
              <div className="flex items-center justify-end gap-3 mt-4">
                <Link href="/shop" className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/70 hover:text-primary transition-colors flex items-center gap-1 group">
                  View All <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.button
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 cursor-interactive"
          onClick={scrollPastHero}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          aria-label="Scroll down"
          style={{ willChange: 'transform' }}
        >
          <span className="text-[10px] text-muted-foreground dark:text-white/40 tracking-[0.3em] uppercase">Scroll</span>
          <ChevronDown size={18} className="text-muted-foreground dark:text-white/40" />
        </motion.button>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          DEAL OF THE DAY
          ════════════════════════════════════════════════════════════════════ */}
      <DealOfTheDay />
      <ComboDealsSection />

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
