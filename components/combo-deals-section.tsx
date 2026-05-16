'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
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
import { api } from '@/lib/api-client'

export function ComboDealsSection() {
  const { activeDeals, mounted, isLoading } = useComboDeals()
  const { data: catalogData } = useCatalog()
  const dispatch = useAppDispatch()

  const allProducts = catalogData?.products ?? []
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [extraProducts, setExtraProducts] = useState<any[]>([])
  const autoPlayTimer = useRef<NodeJS.Timeout | null>(null)


  // Carousel controls
  const next = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % activeDeals.length)
  }, [activeDeals.length])

  const prev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + activeDeals.length) % activeDeals.length)
  }, [activeDeals.length])

  // Stable auto-advance function
  const startAutoPlay = useCallback(() => {
    if (autoPlayTimer.current) clearInterval(autoPlayTimer.current)
    if (activeDeals.length <= 1 || isHovered) return

    autoPlayTimer.current = setInterval(() => {
      setActiveIndex(i => (i + 1) % activeDeals.length)
    }, 10000)
  }, [activeDeals.length, isHovered])

  useEffect(() => {
    startAutoPlay()
    return () => { if (autoPlayTimer.current) clearInterval(autoPlayTimer.current) }
  }, [startAutoPlay])

  // Safety: Keep index in bounds
  useEffect(() => {
    if (activeIndex >= activeDeals.length && activeDeals.length > 0) {
      setActiveIndex(0)
    }
  }, [activeDeals.length, activeIndex])


  // Combine global products with extra fetched products
  const combinedProducts = useMemo(() => {
    const map = new Map<string, any>()
    allProducts.forEach(p => map.set(String(p.id), p))
    extraProducts.forEach(p => map.set(String(p.id), p))
    return Array.from(map.values())
  }, [allProducts, extraProducts])

  const currentDeal = activeDeals[activeIndex]

  // Robust filtering: compare as strings to avoid type issues
  const dealProducts = useMemo(() => {
    if (!currentDeal) return []
    const eligibleIds = currentDeal.eligibleProductIds.map(String)
    return combinedProducts.filter(p => eligibleIds.includes(String(p.id)))
  }, [currentDeal, combinedProducts])

  // Fetch missing products if needed
  useEffect(() => {
    if (!currentDeal || currentDeal.eligibleProductIds.length === 0) return

    const eligibleIds = currentDeal.eligibleProductIds.map(String)
    const existingIds = new Set(combinedProducts.map(p => String(p.id)))
    const missingIds = eligibleIds.filter(id => !existingIds.has(id))

    if (missingIds.length > 0) {
      const fetchMissing = async () => {
        try {
          const res = await api.get<any>(`/products?ids=${missingIds.join(',')}&limit=100`)
          const products = res?.data || []
          const mapped = products.map((p: any) => ({
            id: String(p.id),
            name: p.title,
            price: parseFloat(p.price),
            imageUrl: p.imageUrl,
            images: p.images?.length > 0 ? p.images.map((img: any) => img.imageUrl) : [p.imageUrl],
            categorySlug: p.category?.slug,
            slug: p.slug
          }))
          setExtraProducts(prev => [...prev, ...mapped])
        } catch (error) {
          console.error('Failed to fetch missing bundle items', error)
        }
      }
      fetchMissing()
    }
  }, [currentDeal, combinedProducts])

  // Savings calculation
  const originalTotal = dealProducts.reduce((sum, p) => sum + p.price, 0)
  const savings = originalTotal - (currentDeal?.bundlePrice || 0)

  const handleClaim = (deal: any, items: any[]) => {
    dispatch(addBundle({
      bundleId: deal.id,
      price: deal.bundlePrice,
      items: items.map(p => ({
        productId: p.id,
        name: p.name,
        price: p.price,
        image: p.imageUrl,
        categorySlug: p.categorySlug,
        slug: p.slug
      }))
    }))
    toast.success(`${deal.title} added to cart!`, {
      icon: <CheckCircle2 className="text-primary" size={16} />
    })
  }

  if (!mounted || isLoading || activeDeals.length === 0) return null

  return (
    <section
      className="relative py-10 sm:py-16 overflow-hidden border-y border-white/5 bg-black"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] pointer-events-none -z-10 opacity-30" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] pointer-events-none -z-10 opacity-30" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 sm:mb-10 gap-4 sm:gap-6">
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
              className="text-3xl sm:text-7xl font-black text-white leading-tight uppercase tracking-tighter"
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

        <div className="relative min-h-[300px] sm:min-h-[450px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentDeal.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="w-full"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left: Bundle Info */}
                <div className="lg:col-span-5 space-y-6 sm:space-y-8 order-2 lg:order-1">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-3 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full">
                      <Gift className="text-primary" size={16} />
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Curated Bundle Deal</span>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight leading-[0.95]">
                        {currentDeal.title.replace(/POSTER\b/i, dealProducts.length > 1 ? "POSTERS" : "POSTER")}
                      </h3>
                      <p className="text-white/60 text-lg leading-[1.6] font-medium">
                        {currentDeal.description || `Claim this hand-picked set of ${dealProducts.length} items for a unified flat price.`}
                      </p>
                    </div>
                  </div>

                   <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 sm:p-6 bg-white/[0.03] border border-white/5 rounded-3xl space-y-2">
                      <p className="text-[9px] font-mono text-white/50 uppercase tracking-[0.3em]">Total Value</p>
                      <p className="text-xl sm:text-2xl font-black text-white/40 line-through tracking-tighter font-price">₹{originalTotal}</p>
                    </div>
                    <div className="p-4 sm:p-6 bg-primary/10 border border-primary/20 rounded-3xl space-y-2 relative overflow-hidden group">
                      <Zap className="absolute -right-4 -bottom-4 w-16 h-16 text-primary/5 -rotate-12" />
                      <p className="text-[9px] font-mono text-primary/80 uppercase tracking-[0.3em] font-black">Bundle Price</p>
                      <p className="text-3xl sm:text-4xl font-black text-primary tracking-tighter font-price">₹{currentDeal.bundlePrice}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      onClick={() => handleClaim(currentDeal, dealProducts)}
                      className="w-full py-3.5 sm:py-5 bg-primary text-black font-bold text-sm sm:text-base rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_30px_rgba(212,175,55,0.4)] flex items-center justify-center gap-3"
                    >
                      <ShoppingBag size={20} className="sm:w-5 sm:h-5" strokeWidth={2} />
                      Claim Bundle Deal
                    </button>
                    <Link
                      href={`/deals/${currentDeal.id}`}
                      className="flex items-center justify-center px-6 py-3.5 sm:py-5 border border-white/10 text-white/60 font-black text-[10px] uppercase tracking-[0.25em] rounded-2xl hover:bg-white/5 hover:text-white transition-all whitespace-nowrap"
                    >
                      Learn More
                    </Link>
                  </div>

                  <div className="flex items-center gap-8 pt-4">
                    <div className="flex -space-x-3">
                      {dealProducts.slice(0, 4).map((p, i) => (
                        <Link
                          key={p.id}
                          href={`/product/${p.slug || p.id}`}
                          className="w-10 h-10 rounded-full border-2 border-black bg-zinc-900 overflow-hidden relative hover:z-10 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                        </Link>
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

                {/* Right: Streetwear Collage Visuals */}
                <div className="lg:col-span-7 order-1 lg:order-2">
                  <div className="relative aspect-[4/3] lg:aspect-square w-full flex items-center justify-center p-4">

                    {/* Center savings badge (Price Sticker) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-28 sm:h-28 bg-[#facc15] shadow-[4px_4px_0px_#000,0_10px_30px_rgba(0,0,0,0.4)] flex flex-col items-center justify-center z-50 border-2 border-black rotate-12 transition-transform hover:rotate-6 cursor-default">
                      <p className="text-[8px] sm:text-[10px] font-black text-black uppercase leading-none mb-0.5 sm:mb-1">SAVE</p>
                      <p className="text-xl sm:text-3xl font-black text-black tracking-tighter font-price">₹{savings}</p>
                      <p className="text-[7px] sm:text-[8px] font-bold text-black/60 uppercase mt-0.5 sm:mt-1">OFF TOTAL</p>
                      <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-black/10 rounded-full" />
                    </div>

                    {/* Dynamic Layout System */}
                    <div className="relative w-full h-full max-w-2xl mx-auto">
                      {/* 2 ITEMS: SIDE BY SIDE PORTRAIT */}
                      {dealProducts.length === 2 && (
                        <div className="grid grid-cols-2 gap-8 w-full h-full p-4">
                          {dealProducts.map((p, i) => {
                            const rotations = [-3, 3];
                            return (
                              <motion.div
                                key={p.id}
                                initial={{ opacity: 0, scale: 0.9, rotate: rotations[i] * 2 }}
                                animate={{ opacity: 1, scale: 1, rotate: rotations[i] }}
                                className="relative aspect-[3/4] border-[3px] border-white shadow-[12px_12px_30px_rgba(0,0,0,0.5)] overflow-hidden group self-center"
                              >
                                <Link href={`/product/${p.slug || p.id}`} className="absolute inset-0 z-10" />
                                <Image src={p.imageUrl} alt={p.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                              </motion.div>
                            );
                          })}
                        </div>
                      )}

                      {/* 3 ITEMS: STACK LAYOUT */}
                      {dealProducts.length === 3 && (
                        <div className="relative w-full h-full">
                          {dealProducts.map((p, i) => {
                            const rotations = [-4, 2, 5];
                            const positions = [
                              "top-[10%] left-[10%] w-[65%]",
                              "top-[20%] right-[5%] w-[60%] z-10",
                              "bottom-[10%] left-[20%] w-[60%] z-20"
                            ];
                            return (
                              <motion.div
                                key={p.id}
                                initial={{ opacity: 0, scale: 0.8, rotate: rotations[i] - 10 }}
                                animate={{ opacity: 1, scale: 1, rotate: rotations[i] }}
                                className={cn(
                                  "absolute aspect-[3/4] border-[3px] border-white shadow-[8px_8px_20px_rgba(0,0,0,0.4)] overflow-hidden group",
                                  positions[i]
                                )}
                              >
                                <Link href={`/product/${p.slug || p.id}`} className="absolute inset-0 z-10" />
                                <Image src={p.imageUrl} alt={p.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                              </motion.div>
                            );
                          })}
                        </div>
                      )}

                      {/* 4 ITEMS: UNEVEN GRID */}
                      {dealProducts.length === 4 && (
                        <div className="grid grid-cols-2 gap-6 w-full h-full p-8">
                          {dealProducts.map((p, i) => {
                            const rotations = [-2, 3, 2, -3];
                            return (
                              <motion.div
                                key={p.id}
                                initial={{ opacity: 0, y: 20, rotate: rotations[i] * 2 }}
                                animate={{ opacity: 1, y: 0, rotate: rotations[i] }}
                                className={cn(
                                  "relative aspect-square border-[3px] border-white shadow-[10px_10px_25px_rgba(0,0,0,0.5)] overflow-hidden group",
                                  i === 1 ? "translate-y-8" : "",
                                  i === 2 ? "-translate-y-8" : ""
                                )}
                              >
                                <Link href={`/product/${p.slug || p.id}`} className="absolute inset-0 z-10" />
                                <Image src={p.imageUrl} alt={p.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                              </motion.div>
                            );
                          })}
                        </div>
                      )}

                      {/* 5 ITEMS: MOSAIC */}
                      {dealProducts.length >= 5 && (
                        <div className="relative w-full h-full grid grid-cols-6 grid-rows-6 gap-3 p-4">
                          {/* Large Hero */}
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                            animate={{ opacity: 1, scale: 1, rotate: -1 }}
                            className="col-span-4 row-span-4 border-[3px] border-white shadow-[15px_15px_30px_rgba(0,0,0,0.6)] overflow-hidden relative group z-10"
                          >
                            <Link href={`/product/${dealProducts[0].slug || dealProducts[0].id}`} className="absolute inset-0 z-10" />
                            <Image src={dealProducts[0].imageUrl} alt={dealProducts[0].name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                          </motion.div>

                          {/* Smaller ones around */}
                          {dealProducts.slice(1, 5).map((p, i) => {
                            const gridPos = [
                              "col-span-2 row-span-2 col-start-5 row-start-1 rotate-3",
                              "col-span-2 row-span-2 col-start-5 row-start-3 -rotate-2",
                              "col-span-2 row-span-2 col-start-1 row-start-5 rotate-2",
                              "col-span-2 row-span-2 col-start-3 row-start-5 rotate-4"
                            ];
                            return (
                              <motion.div
                                key={p.id}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={cn(
                                  "border-2 border-white shadow-[8px_8px_15px_rgba(0,0,0,0.4)] overflow-hidden relative group",
                                  gridPos[i]
                                )}
                              >
                                <Link href={`/product/${p.slug || p.id}`} className="absolute inset-0 z-10" />
                                <Image src={p.imageUrl} alt={p.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                              </motion.div>
                            );
                          })}
                        </div>
                      )}

                      {/* Fallback for other counts */}
                      {![2, 3, 4, 5].includes(dealProducts.length) && dealProducts.length > 0 && (
                        <div className="grid grid-cols-2 gap-4 h-full w-full">
                          {dealProducts.slice(0, 4).map((p, i) => (
                            <div key={p.id} className="relative border-2 border-white shadow-xl overflow-hidden aspect-square">
                              <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
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
