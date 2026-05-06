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

// ─── Local video sources (both loop; switch every 10 s) ─────────────────────

const HERO_VIDEOS = [
  'https://res.cloudinary.com/dirjsc8qf/video/upload/v1777052147/14160348_3840_2160_25fps_jtarm7.mp4',
  'https://res.cloudinary.com/dirjsc8qf/video/upload/v1777052120/3116506-hd_1920_1080_25fps_iaej0f.mp4',
] as const

/**
 * useVideoCycle — cycles through an array of video URLs every `interval` ms.
 * Returns the active index and the previous index so callers can crossfade.
 */
function useVideoCycle(count: number, interval: number = 10_000) {
  const [active, setActive] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const id = setInterval(() => {
      setFading(true)
      const timer = setTimeout(() => {
        setActive((cur) => (cur + 1) % count)
        setFading(false)
      }, 800) // Match crossfade duration
      return () => clearTimeout(timer)
    }, interval)
    return () => clearInterval(id)
  }, [count, interval])

  return { active, fading }
}

// ─── Animation Variants ──────────────────────────────────────────────────────

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
    <h1 className="text-[clamp(3rem,7vw,5rem)] font-black leading-[0.88] tracking-tight text-foreground">
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

// ─── CinematicPortal (SVG-clipped dual-video crossfade) ────────────────────────

/**
 * CinematicPortal — a pair of <video> elements crossfading every 10 s,
 * masked inside an organic SVG blob with a gold glow ring.
 * The portal offsets its cycle by 5 s from the background so they
 * don't always show the same clip at the same time.
 */
function CinematicPortal({ activeIdx, fading }: { activeIdx: number; fading: boolean }) {
  const CLIP_ID = 'portal-clip'
  const GLOW_ID = 'portal-glow'
  const nextIdx = (activeIdx + 1) % HERO_VIDEOS.length

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* SVG definitions — clip path + glow filter */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <clipPath id={CLIP_ID} clipPathUnits="objectBoundingBox">
            <path d="M0.5,0.02 C0.72,0.02 0.93,0.18 0.97,0.38 C1.02,0.60 0.94,0.84 0.76,0.94 C0.60,1.03 0.38,1.01 0.22,0.90 C0.06,0.79 -0.01,0.57 0.04,0.36 C0.09,0.16 0.28,0.02 0.5,0.02 Z" />
          </clipPath>
          <filter id={GLOW_ID} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="18" floodColor="#d4af37" floodOpacity="0.55" />
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#f5e27a" floodOpacity="0.35" />
          </filter>
        </defs>
      </svg>

      {/* Portal shape wrapper */}
      <div
        className="relative"
        style={{
          width: 'min(420px, 90%)',
          aspectRatio: '0.85',
          filter: `url(#${GLOW_ID})`,
          willChange: 'transform',
        }}
      >
        {/* Clipped video container */}
        <div
          style={{ clipPath: `url(#${CLIP_ID})`, width: '100%', height: '100%' }}
          className="relative overflow-hidden bg-black"
        >
          {/* Stable Video Elements - no keys, no re-mounting */}
          <video
            src={HERO_VIDEOS[0]}
            autoPlay muted loop playsInline preload="metadata"
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover scale-110"
            style={{
              willChange: 'opacity',
              opacity: activeIdx === 0 ? (fading ? 0 : 1) : (fading && activeIdx === 1 ? 1 : 0),
              transition: 'opacity 0.8s ease-in-out',
            }}
          />
          <video
            src={HERO_VIDEOS[1]}
            autoPlay muted loop playsInline preload="metadata"
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover scale-110"
            style={{
              willChange: 'opacity',
              opacity: activeIdx === 1 ? (fading ? 0 : 1) : (fading && activeIdx === 0 ? 1 : 0),
              transition: 'opacity 0.8s ease-in-out',
            }}
          />
          {/* Inner scrim */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/40" style={{ zIndex: 1 }} />
          {/* Hero-scoped grain (5% opacity) */}
          <div className="hero-grain" style={{ zIndex: 2 }} />
        </div>

        {/* Gold border ring */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 118"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M50,2.4 C72,2.4 93,18 97,38 C102,60 94,84 76,94 C60,103 38,101 22,90 C6,79 -1,57 4,36 C9,16 28,2.4 50,2.4 Z"
            fill="none"
            stroke="url(#gold-stroke)"
            strokeWidth="1.5"
          />
          <defs>
            <linearGradient id="gold-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d4af37" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#f5e27a" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#d4af37" stopOpacity="0.9" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212,175,55,0.12) 0%, transparent 70%)' }}
      />
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const { data } = useCatalog()
  const products = data?.products ?? []
  const featuredProducts = products.filter((p) => p.featured).slice(0, 8)
  const heroRef = useRef<HTMLElement>(null)

  // Video cycle — background and portal share the same timing
  // but use different initial videos for visual variety
  const bgCycle = useVideoCycle(HERO_VIDEOS.length, 10_000)
  // Portal uses the same active index (same clip in both, different framing)
  // or swap the order: portal starts on video [1] by cycling offset
  const portalActive = bgCycle.active
  const portalFading = bgCycle.fading
  const bgNext = (bgCycle.active + 1) % HERO_VIDEOS.length

  // Mouse parallax — tiny fractional strength so movement is subtle, not jarring.
  // The hook formula: offset = (cursor - 0.5) * strength * viewportSize
  // e.g. strength=0.012 → max ≈16px drift at screen edge. Just a gentle float.
  const textParallax = useMouseParallax(-0.012, 60, 18)  // text drifts slightly AGAINST cursor
  const portalParallax = useMouseParallax(0.020, 50, 16)  // portal drifts WITH cursor

  // Magnetic CTA button
  const { ref: magneticRef, x: magneticX, y: magneticY } = useMagneticButton(0.3)

  const scrollPastHero = () => {
    heroRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ════════════════════════════════════════════════════════════════════
          HERO SECTION — Two-column: Text left | Cinematic Portal right
          ════════════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative h-screen w-full flex items-center justify-center overflow-hidden"
      >
        {/* ── Full-bleed crossfading background videos ── */}
        {/* Stable Background Videos - no keys, no re-mounting */}
        <video
          src={HERO_VIDEOS[0]}
          autoPlay muted loop playsInline preload="metadata"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            willChange: 'opacity',
            opacity: bgCycle.active === 0 ? (bgCycle.fading ? 0 : 1) : (bgCycle.fading && bgCycle.active === 1 ? 1 : 0),
            transition: 'opacity 1s ease-in-out',
            zIndex: 0,
          }}
        />
        <video
          src={HERO_VIDEOS[1]}
          autoPlay muted loop playsInline preload="metadata"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            willChange: 'opacity',
            opacity: bgCycle.active === 1 ? (bgCycle.fading ? 0 : 1) : (bgCycle.fading && bgCycle.active === 0 ? 1 : 0),
            transition: 'opacity 1s ease-in-out',
            zIndex: 0,
          }}
        />

        {/* Multi-layer overlay */}
        <div className="absolute inset-0 bg-background/60 dark:bg-black/55" style={{ zIndex: 1 }} />
        <div className="absolute inset-0 backdrop-blur-[2px]" style={{ zIndex: 1 }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 dark:via-black/20 to-background/90 dark:to-black/80" style={{ zIndex: 1 }} />
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 dark:from-black/50 via-transparent to-transparent" style={{ zIndex: 1 }} />

        {/* ── Two-column content grid ── */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full h-full flex items-center">
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
                className="flex items-center gap-3 mb-6 sm:mb-8"
              >
                <div className="w-6 sm:w-8 h-px bg-primary flex-shrink-0" />
                <span className="text-black/60 dark:text-primary/90 text-[10px] sm:text-xs font-mono tracking-[0.2em] sm:tracking-[0.25em] uppercase truncate">
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
                  { value: '10k+', label: 'Happy Customers' },
                  { value: '24/7', label: 'Customer Support' },
                ].map((stat) => (
                  <div key={stat.label} className="space-y-1">
                    <p className="text-2xl font-black text-foreground dark:text-white font-mono">{stat.value}</p>
                    <p className="text-xs text-muted-foreground dark:text-white/50 uppercase tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* ── RIGHT COLUMN: Cinematic Portal (hidden on mobile) ── */}
            <motion.div
              className="hidden md:flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{
                x: portalParallax.x,
                y: portalParallax.y,
                willChange: 'transform',
              }}
            >
              <CinematicPortal activeIdx={portalActive} fading={portalFading} />
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

      {/* ════════════════════════════════════════════════════════════════════
          FOOTER
          ════════════════════════════════════════════════════════════════════ */}
      <footer className="bg-card border-t border-border/20 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative w-56 sm:w-64 h-16 flex items-center justify-center overflow-hidden">
                <Image
                  src="/logo-light.png"
                  alt="Crazzzy Collectibles"
                  fill
                  className="object-contain mix-blend-multiply dark:invert dark:mix-blend-screen scale-[2.5]"
                />
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Curating premium aesthetic pieces for modern spaces. New‑age meets vintage in every collection.
              </p>
            </motion.div>

            {/* Resources */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3 className="text-xs font-mono text-muted-foreground tracking-[0.2em] uppercase">Resources</h3>
              <ul className="space-y-2.5 text-sm">
                {[
                  { label: 'Track Order', href: '/track' },
                  { label: 'Support', href: '/contact' },
                  { label: 'Shipping Info', href: '#' },
                  { label: 'B2B Enquiries', href: '/contact' },
                  { label: 'Returns', href: '#' },
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-muted-foreground hover:text-primary transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Legal */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-xs font-mono text-muted-foreground tracking-[0.2em] uppercase">Legal</h3>
              <ul className="space-y-2.5 text-sm">
                {['Terms & Conditions', 'Privacy Policy', 'Refund Policy', 'Cookies'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Connect */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="text-xs font-mono text-muted-foreground tracking-[0.2em] uppercase">Connect</h3>
              <div className="flex gap-2 flex-wrap">
                {[
                  { icon: Facebook, label: 'Facebook' },
                  { icon: Instagram, label: 'Instagram' },
                  { icon: Youtube, label: 'YouTube' },
                  { icon: Twitter, label: 'Twitter' },
                ].map(({ icon: Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    className="p-2.5 bg-muted hover:bg-primary/20 transition-colors group cursor-interactive"
                    title={label}
                    aria-label={label}
                  >
                    <Icon size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </a>
                ))}
              </div>

              <div className="space-y-2 pt-2 border-t border-border/20">
                <div className="flex gap-2 items-center">
                  <Mail size={14} className="text-primary flex-shrink-0" />
                  <a href="mailto:storecrazzzy@gmail.com" className="text-muted-foreground hover:text-primary transition-colors text-sm font-mono">
                    storecrazzzy@gmail.com
                  </a>
                </div>
                <div className="flex gap-2 items-center">
                  <MapPin size={14} className="text-primary flex-shrink-0" />
                  <p className="text-muted-foreground text-sm">India 🇮🇳</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-border/20 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-xs font-mono">
              © {new Date().getFullYear()} CRAZZZY STORE. Curating the extraordinary.
            </p>
            <span className="text-xs text-muted-foreground font-mono">India 🇮🇳</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
