'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useCatalog } from '@/lib/catalog/use-catalog'
import { useMagneticButton } from '@/hooks/use-animations'
import { ChevronLeft, ChevronRight, Zap, Clock } from 'lucide-react'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(ms: number) {
  if (ms === Infinity) return { hours: '--', minutes: '--', seconds: '--' }
  if (ms <= 0) return { hours: '00', minutes: '00', seconds: '00' }
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return {
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0'),
  }
}

function getRemainingMs(dealEndTime: string | null | undefined): number {
  if (!dealEndTime) return Infinity // No expiry set = permanent deal
  const end = new Date(dealEndTime).getTime()
  if (isNaN(end)) return Infinity
  return end - Date.now()
}

// ─── Flip Digit ──────────────────────────────────────────────────────────────

function FlipDigit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative overflow-hidden">
        <div className="w-14 h-16 sm:w-16 sm:h-20 bg-black border border-white/10 rounded-sm flex items-center justify-center relative overflow-hidden">
          {/* Top/bottom split line */}
          <div className="absolute inset-x-0 top-1/2 h-px bg-white/5 z-10" />
          {/* Top half gradient */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          <AnimatePresence mode="popLayout">
            <motion.span
              key={value}
              initial={{ y: -28, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 28, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="text-3xl sm:text-4xl font-black font-mono text-white tabular-nums"
              style={{ willChange: 'transform' }}
            >
              {value}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
      <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-white/30">{label}</span>
    </div>
  )
}

// ─── Countdown ───────────────────────────────────────────────────────────────

function Countdown({ dealEndTime }: { dealEndTime: string | null | undefined }) {
  const [timeLeft, setTimeLeft] = useState(() => formatTime(getRemainingMs(dealEndTime)))
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    const tick = () => {
      const remaining = getRemainingMs(dealEndTime)
      if (remaining <= 0) {
        setTimeLeft({ hours: '00', minutes: '00', seconds: '00' })
        setExpired(true)
      } else {
        setTimeLeft(formatTime(remaining))
      }
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [dealEndTime])

  if (expired) {
    return (
      <div className="flex items-center gap-2 text-red-400 text-xs font-mono uppercase tracking-widest">
        <Clock size={12} />
        Deal Expired
      </div>
    )
  }

  const isUrgent =
    dealEndTime && getRemainingMs(dealEndTime) < 60 * 60 * 1000 // < 1 hour

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className={`text-xs font-mono tracking-[0.2em] uppercase ${isUrgent ? 'text-red-400 animate-pulse' : 'text-white/50'}`}>
          {isUrgent ? '⚡ Ending Soon' : 'Offer Ends In'}
        </span>
        {!dealEndTime && (
          <span className="text-[10px] text-white/25 font-mono uppercase tracking-widest">Until stock lasts</span>
        )}
      </div>

      <div className="flex items-end gap-2">
        <FlipDigit value={timeLeft.hours} label="HRS" />
        <span className="text-primary text-3xl font-black mb-4 leading-none">:</span>
        <FlipDigit value={timeLeft.minutes} label="MIN" />
        <span className="text-primary text-3xl font-black mb-4 leading-none">:</span>
        <FlipDigit value={timeLeft.seconds} label="SEC" />
      </div>
    </div>
  )
}

// ─── Deal Card ───────────────────────────────────────────────────────────────

function DealCard({ product, isActive }: { product: any; isActive: boolean }) {
  const { ref: magneticRef, x: magneticX, y: magneticY } = useMagneticButton(0.3)

  const originalPrice = product.originalPrice || Math.round(product.price * 1.43)
  const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100)

  return (
    <motion.div
      key={product.id}
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center justify-between w-full"
    >
      {/* ── LEFT: Product Image ── */}
      <motion.div
        className="w-full lg:w-1/2 relative flex justify-center items-center"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Pulse Glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75%] h-[75%] rounded-full opacity-25 blur-[90px] bg-primary pointer-events-none"
          style={{ animation: 'pulse 4s ease-in-out infinite' }}
        />

        <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden border border-black/5 bg-white group p-10 shadow-2xl">
          <Image
            src={product.images[0] || '/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-contain transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={isActive}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* LIVE badge */}
        <motion.div
          className="absolute top-4 left-0 sm:-left-4 bg-black/85 backdrop-blur-md border border-white/10 text-white px-4 py-2 flex items-center gap-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
          </span>
          <span className="text-xs font-mono uppercase tracking-[0.2em]">Flash Deal</span>
        </motion.div>

        {/* Discount badge */}
        {discountPercent > 0 && (
          <div className="absolute bottom-4 right-0 sm:-right-4 bg-primary text-black px-3 py-2 text-sm font-black uppercase tracking-widest">
            -{discountPercent}%
          </div>
        )}
      </motion.div>

      {/* ── RIGHT: Info ── */}
      <motion.div
        className="w-full lg:w-1/2 space-y-7"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Label */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-px bg-primary" />
          <span className="text-primary text-xs font-mono tracking-[0.25em] uppercase font-bold flex items-center gap-1.5">
            <Zap size={10} className="fill-primary" />
            Deal of the Day
          </span>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight uppercase tracking-tight">
            {product.name}
          </h2>
          <p className="text-white/60 text-sm sm:text-base max-w-md leading-relaxed">
            {product.description || "Grab this exclusive piece before the clock runs out."}
          </p>
        </div>

        {/* Price */}
        <div className="flex items-end gap-4 flex-wrap">
          <span className="text-4xl sm:text-5xl font-black text-primary font-mono">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {originalPrice && (
            <span className="text-2xl text-white/40 line-through font-mono mb-1">
              ₹{originalPrice.toLocaleString('en-IN')}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="mb-2 px-2 py-1 bg-primary/20 text-primary border border-primary/30 text-xs font-bold uppercase tracking-wider rounded-sm">
              Save {discountPercent}%
            </span>
          )}
        </div>

        {/* Countdown */}
        <div className="p-6 bg-black/50 border border-white/8 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
          <Countdown dealEndTime={product.dealEndTime} />
        </div>

        {/* CTA */}
        <div className="pt-1">
          <div ref={magneticRef} className="inline-flex">
            <motion.div style={{ x: magneticX, y: magneticY, willChange: 'transform' }}>
              <Link
                href={`/product/${product.slug || product.id}`}
                className="group relative px-10 py-5 bg-primary text-black font-black uppercase tracking-[0.15em] text-sm overflow-hidden flex items-center justify-center cursor-interactive"
              >
                <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                <span className="relative flex items-center gap-3">
                  Claim Deal
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:translate-x-1 transition-transform">
                    <path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                  </svg>
                </span>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DealOfTheDay() {
  const { data } = useCatalog()
  const [activeIdx, setActiveIdx] = useState(0)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  // Filter to only active, non-expired deals
  const allDeals = data?.products?.filter(p => p.dealOfTheDay) ?? []
  const activeDeals = allDeals.filter(p => {
    if (!p.dealEndTime) return true // No expiry = always active
    return getRemainingMs(p.dealEndTime) > 0
  })

  // Re-check expiry every second to auto-remove expired deals from the UI
  const [, forceUpdate] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => forceUpdate(n => n + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  // Auto-advance carousel every 10s
  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    if (activeDeals.length <= 1) return
    autoPlayRef.current = setInterval(() => {
      setActiveIdx(i => (i + 1) % activeDeals.length)
    }, 10000)
  }, [activeDeals.length])

  useEffect(() => {
    startAutoPlay()
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current) }
  }, [startAutoPlay])

  // Keep activeIdx in bounds when deals expire
  useEffect(() => {
    if (activeIdx >= activeDeals.length && activeDeals.length > 0) {
      setActiveIdx(activeDeals.length - 1)
    }
  }, [activeDeals.length, activeIdx])

  const goTo = useCallback((idx: number) => {
    setActiveIdx(idx)
    startAutoPlay() // Restart timer on manual click
  }, [startAutoPlay])

  const prev = () => goTo((activeIdx - 1 + activeDeals.length) % activeDeals.length)
  const next = () => goTo((activeIdx + 1) % activeDeals.length)

  // Hide entire section if no active deals
  if (activeDeals.length === 0) return null

  const currentDeal = activeDeals[Math.min(activeIdx, activeDeals.length - 1)]

  return (
    <section className="relative w-full py-24 sm:py-32 overflow-hidden border-y border-white/5 bg-[#121212]">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">

        {/* ── Section header ── */}
        <div className="flex items-center justify-between mb-12">
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-8 h-px bg-primary" />
            <span className="text-primary text-xs font-mono tracking-[0.25em] uppercase font-bold">
              Flash Deals
            </span>
          </motion.div>

          {/* Multi-deal indicators */}
          {activeDeals.length > 1 && (
            <div className="flex items-center gap-3">
              <button
                onClick={prev}
                className="p-2 border border-white/10 hover:border-primary/50 hover:text-primary text-white/50 transition-all"
                aria-label="Previous deal"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex gap-1.5">
                {activeDeals.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`h-1 rounded-full transition-all duration-300 ${i === activeIdx ? 'w-8 bg-primary' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                    aria-label={`Deal ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={next}
                className="p-2 border border-white/10 hover:border-primary/50 hover:text-primary text-white/50 transition-all"
                aria-label="Next deal"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* ── Deal carousel ── */}
        <AnimatePresence mode="wait">
          <DealCard
            key={currentDeal.id}
            product={currentDeal}
            isActive={true}
          />
        </AnimatePresence>

        {/* ── Dot navigation for mobile ── */}
        {activeDeals.length > 1 && (
          <div className="flex justify-center gap-2 mt-10 lg:hidden">
            {activeDeals.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIdx ? 'w-6 bg-primary' : 'w-1.5 bg-white/20'}`}
                aria-label={`Deal ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
