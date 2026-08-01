'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight, Clock, Clapperboard, ChevronLeft, ChevronRight, Zap, ShoppingBag, CheckCircle2 } from 'lucide-react'
import { api } from '@/lib/api-client'
import { useAppDispatch } from '@/lib/store/hooks'
import { addBundle } from '@/lib/store/slices/cart-slice'
import { toast } from 'sonner'

// ─── Types ───────────────────────────────────────────────────────────────────

interface SpotlightSection {
  id: number
  title: string
  subtitle: string | null
  bannerUrl: string
  ctaText: string | null
  ctaUrl: string | null
  productIds: (number | string)[]
  bundlePrice: number | null
  isActive: boolean
  endsAt: string | null
}

interface SpotlightProduct {
  id: string
  name: string
  price: number
  imageUrl: string
  slug: string
}

// ─── Countdown ───────────────────────────────────────────────────────────────

function useCountdown(endsAt: string | null) {
  const [timeLeft, setTimeLeft] = useState<{ h: string; m: string; s: string } | null>(null)

  useEffect(() => {
    if (!endsAt) return
    const end = new Date(endsAt).getTime()
    if (isNaN(end)) return

    const tick = () => {
      const diff = end - Date.now()
      if (diff <= 0) {
        setTimeLeft({ h: '00', m: '00', s: '00' })
        return
      }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft({
        h: String(h).padStart(2, '0'),
        m: String(m).padStart(2, '0'),
        s: String(s).padStart(2, '0'),
      })
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endsAt])

  return timeLeft
}

// ─── TimeBlock ───────────────────────────────────────────────────────────────

function TimeBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-2xl sm:text-3xl font-black font-mono text-white tabular-nums"
          >
            {value}
          </motion.span>
        </AnimatePresence>
        {/* Divider line */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-white/5" />
      </div>
      <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-white/40 mt-1">{label}</span>
    </div>
  )
}

// ─── Product Rail Card ────────────────────────────────────────────────────────

function SpotlightCard({ product, index }: { product: SpotlightProduct; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className="flex-shrink-0"
      style={{ width: 'clamp(120px, 35vw, 160px)', scrollSnapAlign: 'start' }}
    >
      <Link
        href={`/product/${product.slug || product.id}`}
        className="group relative block"
      >
        {/* Card */}
        <div className="relative overflow-hidden bg-zinc-950 border border-white/5 transition-all duration-500 group-hover:border-yellow-400/30">
          {/* Product image */}
          <div className="relative w-full" style={{ height: 'clamp(170px, 28vw, 220px)' }}>
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              unoptimized
              className="object-contain p-2 transition-transform duration-700 group-hover:scale-110"
              sizes="160px"
            />
          </div>

          {/* Bottom info — slides up on hover */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/90 to-transparent pt-8 pb-3 px-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <p className="text-white text-[10px] font-bold leading-snug line-clamp-2 uppercase tracking-tight">
              {product.name}
            </p>
            <p className="text-yellow-400 font-mono text-[11px] font-black mt-1">&#8377;{product.price}</p>
          </div>

          {/* Gold bottom border glow */}
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Ambient glow */}
        <div className="absolute -inset-1 bg-yellow-400/5 opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500 -z-10 rounded" />
      </Link>
    </motion.div>
  )
}

// ─── Constants ───────────────────────────────────────────────────────────────
const SLIDE_DURATION = 6000 // ms per slide

// ─── Main Component ───────────────────────────────────────────────────────────

export function SpotlightSection() {
  const [sections, setSections] = useState<SpotlightSection[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [products, setProducts] = useState<SpotlightProduct[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [paused, setPaused] = useState(false)
  const railRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const dispatch = useAppDispatch()

  // Parallax — use page-level scroll (no target ref needed, avoids SSR hydration mismatch)
  const { scrollYProgress } = useScroll()
  const bgY = useTransform(scrollYProgress, [0, 0.3], ['0%', '15%'])

  useEffect(() => { setMounted(true) }, [])

  // Auto-advance slider
  useEffect(() => {
    if (sections.length <= 1 || paused) return
    const id = setInterval(() => {
      setActiveIndex(i => (i + 1) % sections.length)
    }, SLIDE_DURATION)
    return () => clearInterval(id)
  }, [sections.length, paused])

  // Re-fetch when: component mounts, user navigates back (pathname change), or tab regains focus
  const fetchSections = useCallback(() => {
    api.get<SpotlightSection[]>('/settings/spotlight')
      .then(data => {
        const list = Array.isArray(data) ? data : []
        setSections(list.filter(s => s.isActive))
        // Reset index if active sections changed
        setActiveIndex(0)
      })
      .catch(() => {})
  }, [])

  useEffect(() => { fetchSections() }, [fetchSections, pathname])

  useEffect(() => {
    const onFocus = () => fetchSections()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [fetchSections])

  const current = sections[activeIndex]
  const countdown = useCountdown(current?.endsAt ?? null)

  // Fetch products for current section
  useEffect(() => {
    if (!current || current.productIds.length === 0) {
      setProducts([])
      return
    }
    setLoadingProducts(true)
    const ids = current.productIds.slice(0, 12)

    Promise.all(
      ids.map(id =>
        api.get<any>(`/products/${id}`).then(p => {
          const data = p?.data ?? p
          return {
            id: String(data.id),
            name: data.title ?? '',
            price: parseFloat(data.price ?? '0'),
            imageUrl: data.imageUrl ?? data.images?.[0]?.imageUrl ?? '',
            slug: data.slug ?? String(data.id),
          }
        }).catch(() => null)
      )
    ).then(results => {
      setProducts(results.filter(Boolean) as SpotlightProduct[])
    }).finally(() => setLoadingProducts(false))
  }, [current])

  // Savings calculation if bundlePrice is set
  const originalTotal = products.reduce((sum, p) => sum + p.price, 0)
  const savings = current?.bundlePrice ? originalTotal - current.bundlePrice : 0

  const handleClaimBundle = () => {
    if (!current || !current.bundlePrice) return
    dispatch(addBundle({
      bundleId: current.id,
      price: current.bundlePrice,
      items: products.map(p => ({
        productId: String(p.id),
        name: p.name,
        price: p.price,
        image: p.imageUrl,
        categorySlug: p.slug,
        slug: p.slug
      }))
    }))
    toast.success(`${current.title} added to cart!`, {
      icon: <CheckCircle2 className="text-yellow-400" size={16} />
    })
  }

  // Rail scroll controls
  const scrollRail = useCallback((dir: 'left' | 'right') => {
    if (!railRef.current) return
    railRef.current.scrollBy({ left: dir === 'right' ? 340 : -340, behavior: 'smooth' })
  }, [])

  if (!mounted || sections.length === 0) return null

  return (
    <section
      className="relative w-full overflow-hidden bg-black"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >

      {/* ── Background banner with parallax ─────────────────────────────── */}
      {/* Mobile: shorter banner; desktop: 78vh */}
      <div className="relative w-full" style={{ minHeight: 'clamp(480px, 78vh, 860px)' }}>

        {/* Parallax BG image */}
        <motion.div
          className="absolute inset-0 scale-[1.08]"
          style={{ y: bgY }}
        >
          <Image
            src={current.bannerUrl}
            alt={current.title}
            fill
            unoptimized
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          {/* Layered overlays — heavier on mobile so text is readable over any banner */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/98 via-black/70 to-black/30 sm:from-black/95 sm:via-black/55 sm:to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
          {/* Subtle vignette */}
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)'
          }} />
        </motion.div>


        {/* Section switcher dots + progress bar */}
        {sections.length > 1 && (
          <div className="absolute top-8 right-6 sm:right-12 flex items-center gap-2 z-10">
            {sections.map((_, i) => (
              <button
                key={i}
                onClick={() => { setActiveIndex(i); setPaused(true) }}
                className="relative overflow-hidden h-1.5 transition-all duration-300 rounded-full bg-white/20"
                style={{ width: i === activeIndex ? 32 : 8 }}
              >
                {i === activeIndex && (
                  <motion.div
                    key={`progress-${activeIndex}`}
                    className="absolute inset-y-0 left-0 bg-yellow-400 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: paused ? undefined : '100%' }}
                    transition={{ duration: SLIDE_DURATION / 1000, ease: 'linear' }}
                  />
                )}
              </button>
            ))}
          </div>
        )}

        {/* ── Decorative vertical gold line ────────────────────────────── */}
        <div className="absolute left-6 sm:left-12 top-20 bottom-48 w-px hidden sm:block"
          style={{ background: 'linear-gradient(to bottom, rgba(250,204,21,0.5), rgba(250,204,21,0.05), transparent)' }}
        />

        {/* ── Hero text content ────────────────────────────────────────── */}
        <div className="relative z-10 flex flex-col justify-end sm:justify-center h-full"
          style={{
            minHeight: 'clamp(480px, 78vh, 860px)',
            paddingLeft: 'clamp(1.5rem, 5vw, 6rem)',
            paddingRight: 'clamp(1.5rem, 5vw, 6rem)',
            paddingTop: 'clamp(4rem, 8vw, 6rem)',
            paddingBottom: current.bundlePrice
              ? 'clamp(11rem, 18vw, 16rem)'
              : 'clamp(9rem, 15vw, 13rem)',
          }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              className="max-w-xl space-y-4 sm:space-y-6"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.55 }}
            >
              {/* ── Spotlight eyebrow label ─────────────────────────────── */}
              <motion.div
                className="flex items-center gap-2.5"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-5 h-px bg-yellow-400" />
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400" />
                </span>
                <span className="text-[9px] font-black uppercase tracking-[0.45em] text-yellow-400/80">
                  Spotlight
                </span>
              </motion.div>

              {/* ── Title — editorial style ──────────────────────────────── */}
              <div>
                {(() => {
                  const words = current.title.split(' ')
                  // Last word gets the gold accent; all others are white
                  return (
                    <motion.h2
                      className="font-black leading-[0.88] tracking-tight"
                      style={{ fontSize: 'clamp(2.2rem, 7vw, 6rem)', textShadow: '0 4px 40px rgba(0,0,0,0.8)' }}
                    >
                      {words.map((word, i) => (
                        <span
                          key={i}
                          className="block"
                          style={{ color: i === words.length - 1 ? 'rgb(250,204,21)' : 'white' }}
                        >
                          {word}
                        </span>
                      ))}
                    </motion.h2>
                  )
                })()}
              </div>

              {/* Subtitle */}
              {current.subtitle && (
                <motion.p
                  className="text-white/65 text-base sm:text-lg font-medium max-w-md leading-relaxed"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                >
                  {current.subtitle}
                </motion.p>
              )}

              {/* Countdown timer — compact on mobile */}
              {countdown && (
                <motion.div
                  className="flex flex-wrap items-center gap-3"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.25 }}
                >
                  <div className="flex items-center gap-1.5">
                    <Clock size={11} className="text-yellow-400/60" />
                    <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/35">Ends in</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TimeBlock value={countdown.h} label="hrs" />
                    <span className="text-white/25 font-black text-base sm:text-xl pb-3 sm:pb-4">:</span>
                    <TimeBlock value={countdown.m} label="min" />
                    <span className="text-white/25 font-black text-base sm:text-xl pb-3 sm:pb-4">:</span>
                    <TimeBlock value={countdown.s} label="sec" />
                  </div>
                </motion.div>
              )}

              {/* Bundle Pricing UI (if bundlePrice exists) */}
              {current.bundlePrice ? (
                <motion.div
                  className="space-y-3 pt-2"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.35 }}
                >
                  {/* Price row */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Original total */}
                    {originalTotal > 0 && (
                      <div className="flex flex-col">
                        <span className="text-[9px] font-mono text-white/40 uppercase tracking-[0.25em]">Total Value</span>
                        <span className="text-base font-black text-white/35 line-through tracking-tighter">&#8377;{originalTotal}</span>
                      </div>
                    )}
                    {originalTotal > 0 && <div className="w-px h-8 bg-white/10" />}
                    {/* Offer price */}
                    <div className="flex flex-col">
                      <span className="text-[9px] font-mono text-yellow-400/70 uppercase tracking-[0.25em] font-black">Offer Price</span>
                      <span className="text-3xl font-black text-yellow-400 tracking-tighter">&#8377;{current.bundlePrice}</span>
                    </div>
                    {/* Savings badge */}
                    {originalTotal > 0 && originalTotal > current.bundlePrice && (
                      <div className="ml-1 bg-yellow-400 px-2.5 py-1.5 rotate-2 flex flex-col items-center border-2 border-black shadow-[3px_3px_0_rgba(0,0,0,0.5)]">
                        <span className="text-[8px] font-black text-black uppercase leading-none">SAVE</span>
                        <span className="text-sm font-black text-black tracking-tighter leading-none">&#8377;{Math.round(originalTotal - current.bundlePrice)}</span>
                      </div>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleClaimBundle}
                      className="group inline-flex w-full sm:w-auto items-center justify-center sm:justify-start gap-3 px-6 sm:px-8 py-3.5 sm:py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-[10px] sm:text-xs tracking-[0.15em] uppercase transition-all duration-300 active:scale-95"
                      style={{ boxShadow: '0 0 40px rgba(250,204,21,0.25)' }}
                    >
                      <ShoppingBag size={14} />
                      Claim Bundle Offer
                    </button>
                    {current.ctaUrl && (
                      <Link
                        href={current.ctaUrl}
                        className="flex items-center justify-center px-6 py-3.5 sm:py-4 border border-white/10 text-white/60 font-black text-[10px] uppercase tracking-[0.25em] hover:bg-white/5 hover:text-white transition-all whitespace-nowrap"
                      >
                        {current.ctaText || 'Browse All'}
                        <ArrowRight size={12} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    )}
                  </div>
                </motion.div>
              ) : (
                /* Regular CTA if no bundle price */
                current.ctaUrl && (
                  <motion.div
                    className="pt-1"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.35 }}
                  >
                    <Link
                      href={current.ctaUrl}
                      id={`spotlight-cta-${current.id}`}
                      className="group inline-flex w-full sm:w-auto items-center justify-center sm:justify-start gap-3 px-6 sm:px-8 py-3.5 sm:py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-[10px] sm:text-xs tracking-[0.15em] uppercase transition-all duration-300 active:scale-95"
                      style={{ boxShadow: '0 0 40px rgba(250,204,21,0.25)' }}
                    >
                      {current.ctaText || 'Shop Now'}
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                )
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Product spotlight rail ─────────────────────────────────────────── */}
      {(products.length > 0 || loadingProducts) && (
        <div className="relative -mt-28 sm:-mt-36 md:-mt-44 z-20">
          <div className="relative bg-gradient-to-b from-transparent via-black to-black pt-4">

            {/* Top gold glow line */}
            <div
              className="absolute top-4 inset-x-0 h-px"
              style={{ background: 'linear-gradient(to right, transparent, rgba(250,204,21,0.25), rgba(250,204,21,0.5), rgba(250,204,21,0.25), transparent)' }}
            />

            {/* Rail header row */}
            <div className="flex items-center justify-between px-4 sm:px-12 pb-4 pt-7">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 sm:w-6 h-px"
                  style={{ background: 'linear-gradient(to right, rgba(250,204,21,0.8), transparent)' }}
                />
                <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.25em] sm:tracking-[0.35em] text-yellow-400/75">
                  Featured in Spotlight
                </span>
              </div>
              {/* Nav arrows — hidden on mobile (touch scrollable) */}
              {products.length > 4 && (
                <div className="hidden sm:flex gap-2">
                  <button
                    onClick={() => scrollRail('left')}
                    id="spotlight-rail-prev"
                    className="w-8 h-8 border border-white/10 hover:border-yellow-400/40 flex items-center justify-center text-white/30 hover:text-yellow-400 transition-all duration-200"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => scrollRail('right')}
                    id="spotlight-rail-next"
                    className="w-8 h-8 border border-white/10 hover:border-yellow-400/40 flex items-center justify-center text-white/30 hover:text-yellow-400 transition-all duration-200"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Scrollable product strip — smaller cards on mobile */}
            <div
              ref={railRef}
              className="flex gap-3 sm:gap-4 overflow-x-auto pb-8 sm:pb-10 px-4 sm:px-12 scrollbar-hide"
              style={{
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
                maskImage: 'linear-gradient(to right, transparent 0%, black 4%, black 92%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 4%, black 92%, transparent 100%)',
              }}
            >
              {loadingProducts
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 bg-white/5 animate-pulse rounded"
                      style={{ width: 'clamp(120px, 35vw, 160px)', height: 'clamp(170px, 28vw, 220px)' }}
                    />
                  ))
                : products.map((p, i) => (
                    <SpotlightCard key={p.id} product={p} index={i} />
                  ))
              }
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
