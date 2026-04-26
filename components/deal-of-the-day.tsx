'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useCatalog } from '@/lib/catalog/use-catalog'
import { useMagneticButton } from '@/hooks/use-animations'

function formatTime(ms: number) {
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

export function DealOfTheDay() {
  const { data } = useCatalog()
  
  // Find a product with dealOfTheDay flag
  const product = data?.products?.find(p => p.dealOfTheDay) || data?.products?.[0]
  
  // Magnetic CTA
  const { ref: magneticRef, x: magneticX, y: magneticY } = useMagneticButton(0.3)

  // Countdown logic (mocking a 24-hour cycle)
  const [timeLeft, setTimeLeft] = useState({ hours: '23', minutes: '59', seconds: '59' })
  
  useEffect(() => {
    // Set a fixed target time 24 hours from when component mounts, OR just cycle 24h
    // To make it look consistent, let's just make a ticking timer
    const target = new Date().getTime() + 24 * 60 * 60 * 1000 - 1500000 // Random offset
    
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const distance = target - now
      
      if (distance < 0) {
        clearInterval(interval)
        setTimeLeft({ hours: '00', minutes: '00', seconds: '00' })
      } else {
        setTimeLeft(formatTime(distance))
      }
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])

  if (!product) return null

  // Calculate pricing (mocking a "deal" if not present)
  const originalPrice = product.originalPrice || Math.round(product.price * 1.43) // Roughly 30% off
  const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100)

  return (
    <section className="relative w-full py-24 sm:py-32 overflow-hidden border-y border-white/5 bg-[#121212]">
      {/* Subtle ambient background mix */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center justify-between">
          
          {/* ── LEFT SIDE: Product Showcase ── */}
          <motion.div 
            className="w-full lg:w-1/2 relative flex justify-center items-center"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Pulse Glow Behind Image */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full opacity-30 blur-[80px] bg-primary animate-pulse pointer-events-none" style={{ animationDuration: '4s' }} />
            
            <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden border border-black/5 bg-white group p-12 shadow-2xl">
              <Image 
                src={product.images[0] || "/placeholder.jpg"} 
                alt={product.name}
                fill
                className="object-contain transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              {/* Overlay vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </div>
            
            {/* Floating Badge on Image */}
            <motion.div 
              className="absolute top-6 left-0 sm:-left-6 bg-black/80 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-none flex items-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              <span className="text-xs font-mono uppercase tracking-[0.2em]">Limited Stock</span>
            </motion.div>
          </motion.div>

          {/* ── RIGHT SIDE: Offer Info ── */}
          <motion.div 
            className="w-full lg:w-1/2 space-y-8"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            <div className="space-y-4">
              {/* Category / Label */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-px bg-primary" />
                <span className="text-primary text-xs font-mono tracking-[0.25em] uppercase font-bold">
                  24-Hour Exclusive Drop
                </span>
              </div>
              
              {/* Title */}
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight uppercase tracking-tight">
                {product.name}
              </h2>
              
              <p className="text-white/60 text-sm sm:text-base max-w-md leading-relaxed">
                {product.description || "Grab this extremely limited piece before the clock runs out. Once it's gone, it likely won't return."}
              </p>
            </div>

            {/* Pricing UI */}
            <div className="flex items-end gap-4">
              <span className="text-5xl font-black text-primary font-price">
                ₹{product.price}
              </span>
              <span className="text-2xl text-white/40 line-through font-price mb-1">
                ₹{originalPrice}
              </span>
              <span className="mb-2 px-2 py-1 bg-primary/20 text-primary border border-primary/30 text-xs font-bold uppercase tracking-wider rounded-sm">
                Save {discountPercent}%
              </span>
            </div>

            {/* Countdown + Progress Bar */}
            <div className="p-6 bg-black/40 border border-white/5 backdrop-blur-md rounded-none w-full max-w-sm relative overflow-hidden group">
              {/* Subtle hover gleam */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
              
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs text-white/50 font-mono tracking-[0.2em] uppercase">Offer Ends In</span>
                
                {/* The Countdown Numbers */}
                <div className="flex items-center gap-2 text-2xl sm:text-3xl font-price font-bold text-white">
                  {/* We use motion.div with a slight re-render pop to simulate "flicker/scroll" */}
                  <motion.span key={`h-${timeLeft.hours}`} initial={{ y: -5, opacity: 0.5 }} animate={{ y: 0, opacity: 1 }} className="inline-block min-w-[2ch] text-center w-[1.5em]">{timeLeft.hours}</motion.span>
                  <span className="text-primary/50 -translate-y-0.5">:</span>
                  <motion.span key={`m-${timeLeft.minutes}`} initial={{ y: -5, opacity: 0.5 }} animate={{ y: 0, opacity: 1 }} className="inline-block min-w-[2ch] text-center w-[1.5em]">{timeLeft.minutes}</motion.span>
                  <span className="text-primary/50 -translate-y-0.5">:</span>
                  <motion.span key={`s-${timeLeft.seconds}`} initial={{ y: -5, opacity: 0.5 }} animate={{ y: 0, opacity: 1 }} className="inline-block min-w-[2ch] text-center w-[1.5em] text-primary">{timeLeft.seconds}</motion.span>
                </div>
              </div>

              {/* Progress UI: Social Proof / Scarcity */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider">
                  <span className="text-white/70">85% Claimed</span>
                  <span className="text-primary">Only 3 Left</span>
                </div>
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-primary/50 to-primary"
                    initial={{ width: 0 }}
                    whileInView={{ width: '85%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                  />
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <div ref={magneticRef} className="inline-flex">
                <motion.div style={{ x: magneticX, y: magneticY, willChange: 'transform' }}>
                  <Link
                    href={`/product/${product.id}`}
                    className="group relative px-10 py-5 bg-primary text-black font-black uppercase tracking-[0.15em] text-sm overflow-hidden flex items-center justify-center cursor-interactive"
                  >
                    {/* Hover effect background */}
                    <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                    <span className="relative flex items-center gap-3">
                      Claim Deal
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:translate-x-1 transition-transform">
                        <path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                      </svg>
                    </span>
                  </Link>
                </motion.div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  )
}
