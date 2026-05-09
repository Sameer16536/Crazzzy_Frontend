'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useComboDeals } from '@/hooks/use-combo-deals'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Zap, ArrowRight, Sparkles, CheckCircle2, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useCatalog } from '@/lib/catalog/catalog-context'
import { useAppDispatch } from '@/lib/store/hooks'
import { addBundle } from '@/lib/store/slices/cart-slice'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function ComboDealsSection() {
  const { activeDeals, mounted, isLoading } = useComboDeals()
  const { data: catalogData } = useCatalog()
  const dispatch = useAppDispatch()
  
  const allProducts = catalogData?.products ?? []
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const autoPlayTimer = useRef<NodeJS.Timeout | null>(null)

  // Carousel controls
  const next = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % activeDeals.length)
  }, [activeDeals.length])

  const prev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + activeDeals.length) % activeDeals.length)
  }, [activeDeals.length])

  // Auto-play
  useEffect(() => {
    if (activeDeals.length <= 1 || isHovered) {
      if (autoPlayTimer.current) clearInterval(autoPlayTimer.current)
      return
    }
    autoPlayTimer.current = setInterval(next, 8000)
    return () => {
      if (autoPlayTimer.current) clearInterval(autoPlayTimer.current)
    }
  }, [activeDeals.length, isHovered, next])

  if (!mounted || isLoading || activeDeals.length === 0) return null

  const currentDeal = activeDeals[activeIndex]
  const dealProducts = allProducts.filter(p => currentDeal.eligibleProductIds.includes(p.id))
  
  // Savings calculation
  const originalTotal = dealProducts.reduce((sum, p) => sum + p.price, 0)
  const savings = originalTotal - currentDeal.bundlePrice

  const handleClaim = (deal: any, items: any[]) => {
    dispatch(addBundle({
      bundleId: deal.id,
      price: deal.bundlePrice,
      items: items.map(p => ({
        productId: p.id,
        name: p.name,
        price: p.price,
        image: p.imageUrl,
        categorySlug: p.categorySlug
      }))
    }))
    toast.success(`${deal.title} added to cart!`, {
      icon: <CheckCircle2 className="text-primary" size={16} />
    })
  }

  return (
    <section 
      className="relative py-24 overflow-hidden border-y border-white/5 bg-black"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] pointer-events-none -z-10 opacity-30" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] pointer-events-none -z-10 opacity-30" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-4">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="w-8 h-px bg-primary" />
              <span className="text-primary text-xs font-mono tracking-[0.3em] uppercase font-black flex items-center gap-2">
                <Sparkles size={12} />
                Special Bundles
              </span>
            </motion.div>
            <motion.h2 
              className="text-5xl sm:text-7xl font-black text-white leading-tight uppercase tracking-tighter"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Combo <span className="text-primary">Deals</span>
            </motion.h2>
          </div>
          
          {activeDeals.length > 1 && (
            <div className="flex items-center gap-3">
              <button 
                onClick={prev}
                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors text-white/60 hover:text-white"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={next}
                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors text-white/60 hover:text-white"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}
        </div>

        <div className="relative min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentDeal.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-full"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Left: Bundle Info */}
                <div className="lg:col-span-5 space-y-10 order-2 lg:order-1">
                  <div className="space-y-6">
                    <div className="inline-flex items-center gap-3 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full">
                      <Gift className="text-primary" size={16} />
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Curated Bundle Deal</span>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tight leading-[0.95]">
                        {currentDeal.title}
                      </h3>
                      <p className="text-white/60 text-lg leading-relaxed font-medium">
                        {currentDeal.description || `Claim this hand-picked set of ${dealProducts.length} items for a unified flat price.`}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl space-y-1">
                      <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">Total Value</p>
                      <p className="text-2xl font-black text-white/40 line-through tracking-tighter">₹{originalTotal}</p>
                    </div>
                    <div className="p-6 bg-primary/10 border border-primary/20 rounded-3xl space-y-1 relative overflow-hidden group">
                      <Zap className="absolute -right-4 -bottom-4 w-16 h-16 text-primary/5 -rotate-12" />
                      <p className="text-[10px] font-mono text-primary uppercase tracking-[0.2em] font-black">Bundle Price</p>
                      <p className="text-4xl font-black text-primary tracking-tighter">₹{currentDeal.bundlePrice}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button 
                      onClick={() => handleClaim(currentDeal, dealProducts)}
                      className="flex-1 py-5 bg-primary text-black font-black text-sm uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_40px_rgba(212,175,55,0.3)] flex items-center justify-center gap-3"
                    >
                      <ShoppingBag size={18} />
                      Claim Bundle Deal
                    </button>
                    <Link 
                      href={`/deals/${currentDeal.id}`}
                      className="flex items-center justify-center px-8 py-5 border border-white/10 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-white/5 transition-all"
                    >
                      Learn More
                    </Link>
                  </div>

                  <div className="flex items-center gap-8 pt-4">
                    <div className="flex -space-x-3">
                      {dealProducts.slice(0, 4).map((p, i) => (
                        <div key={p.id} className="w-10 h-10 rounded-full border-2 border-black bg-zinc-900 overflow-hidden relative">
                          <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                        </div>
                      ))}
                      {dealProducts.length > 4 && (
                        <div className="w-10 h-10 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center text-[10px] font-black text-primary">
                          +{dealProducts.length - 4}
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">
                      <span className="text-white">{dealProducts.length}</span> Premium items included
                    </p>
                  </div>
                </div>

                {/* Right: Large Bundle Visuals */}
                <div className="lg:col-span-7 order-1 lg:order-2">
                  <div className="relative aspect-[4/3] lg:aspect-square w-full">
                    {/* Visual Grid of Products */}
                    <div className="grid grid-cols-2 gap-4 h-full">
                      {dealProducts.slice(0, 4).map((p, i) => (
                        <motion.div 
                          key={p.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className={cn(
                            "relative overflow-hidden rounded-[2rem] border border-white/10 group/img shadow-2xl",
                            i === 0 && "rounded-tl-[5rem]",
                            i === 1 && "rounded-tr-[5rem]",
                            i === 2 && "rounded-bl-[5rem]",
                            i === 3 && "rounded-br-[5rem]"
                          )}
                        >
                          <Image 
                            src={p.imageUrl} 
                            alt={p.name} 
                            fill 
                            className="object-cover transition-transform duration-700 group-hover/img:scale-110" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-500 p-6 flex flex-col justify-end">
                            <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">{p.name}</p>
                            <p className="text-[10px] font-bold text-white/60 uppercase">Original: ₹{p.price}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Center savings badge */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary rounded-full flex flex-col items-center justify-center shadow-[0_0_50px_rgba(212,175,55,0.5)] z-20 border-4 border-black">
                      <p className="text-[10px] font-black text-black uppercase leading-none">Save</p>
                      <p className="text-2xl font-black text-black tracking-tighter">₹{savings}</p>
                      <p className="text-[8px] font-bold text-black/60 uppercase">Off Total</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots Indicator */}
          {activeDeals.length > 1 && (
            <div className="flex justify-center gap-2 mt-16">
              {activeDeals.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    "h-1.5 transition-all duration-300 rounded-full",
                    i === activeIndex ? "w-12 bg-primary" : "w-3 bg-white/10 hover:bg-white/20"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
