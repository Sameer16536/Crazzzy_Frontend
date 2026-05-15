'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import { ShoppingCart, Heart, Share2, Star, ShieldCheck, ChevronRight, Truck, Wallet, LayoutPanelTop } from 'lucide-react'
import Link from 'next/link'
import { useAppDispatch } from '@/lib/store/hooks'
import { addToCart } from '@/lib/store/slices/cart-slice'
import { useParams, useRouter } from 'next/navigation'
import { useCatalog } from '@/lib/catalog/use-catalog'
import { ProductCard } from '@/components/product-card'
import { api } from '@/lib/api-client'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth/auth-context'
import { ReviewForm } from '@/components/review-form'

// ─── WallMockup ───────────────────────────────────────────────────────────────
// Composes the poster onto a room photo entirely in CSS — zero API calls,
// zero Cloudinary/Vercel credits. The room image is a static public asset.
function WallMockup({ posterSrc, alt, roomSrc, posterStyles, showBadge = true, isLandscape = false }: { posterSrc: string; alt: string; roomSrc: string; posterStyles: React.CSSProperties; showBadge?: boolean; isLandscape?: boolean }) {
  return (
    <div className="relative w-full h-full overflow-hidden bg-[#f4f4f2]">
      {/* 1. Base Room Image */}
      <Image
        src={roomSrc}
        alt="Room mockup"
        fill
        unoptimized
        className="object-cover"
      />

      {/* 2. The Poster Container */}
      <div
        className="absolute"
        style={{
          ...posterStyles,
          zIndex: 20
        }}
      >
        {/* 3. Complex Multi-layered Shadow (Ambient Occlusion) */}
        <div className="absolute inset-0 shadow-[2px_4px_12px_rgba(0,0,0,0.15),_10px_20px_40px_rgba(0,0,0,0.1)]" />

        <div 
          className="relative w-full h-full overflow-hidden"
          style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.3), inset 0 0 1px rgba(0,0,0,0.2)' }}
        >
          {/* 4. The Actual Poster Image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src={posterSrc}
              alt={alt}
              fill={!isLandscape}
              width={isLandscape ? 1000 : undefined}
              height={isLandscape ? 1400 : undefined}
              unoptimized
              className="object-cover"
              style={{
                width: isLandscape ? '71.5%' : '100%',
                height: isLandscape ? '140%' : '100%',
                // 1. Force the browser to use a higher-quality scaling algorithm
                imageRendering: 'high-quality' as any, 
                // 2. Improves contrast and sharpness on Webkit browsers
                WebkitPrintColorAdjust: 'exact',
                // 3. The "Secret Sauce": A tiny blur and sub-pixel transform
                filter: 'blur(0.2px) contrast(1.05)',
                transform: `translateZ(0) ${isLandscape ? 'rotate(-90deg)' : ''}`, // Forces hardware acceleration + auto-rotate
                backfaceVisibility: 'hidden',
                // 4. "Warm up" the sticker white to match the room lighting
                opacity: 0.98,
              }}
            />
          </div>

          {/* 5. Realistic Lighting Overlay (Gradient) 
              Simulates light coming from the side */}
          <div 
            className="absolute inset-0 pointer-events-none" 
            style={{
              background: 'linear-gradient(105deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.05) 100%)',
            }}
          />

          {/* 6. Subtle Paper/Wall Texture Blend 
              Creates a microscopic "grain" so it doesn't look like a digital file */}
          <div 
            className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
            style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/paper-fibers.png')` }}
          />
        </div>
      </div>

      {/* Badge */}
      {showBadge && (
        <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1.5 border border-white/10 z-30">
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/90">Live Wall Preview</span>
        </div>
      )}
    </div>
  )
}


export default function ProductPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const { data, isLoading: catalogLoading, toggleWishlist, wishlistIds, refresh: refreshCatalog } = useCatalog()
  const [product, setProduct] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  // Virtual indices for the CSS mockups
  const WALL_MOCKUP_DESK_INDEX = -1
  const WALL_MOCKUP_PLANT_INDEX = -2
  const WALL_MOCKUP_CONCRETE_INDEX = -3
  const isWishlisted = product ? wishlistIds.has(String(product.id)) : false
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!id) return

    async function fetchProductDetails() {
      try {
        setLoading(true)
        // 1. Try the global catalog cache first (fast, no network)
        const found = data?.products.find((p) => String(p.id) === id || p.slug === id)
        if (found) {
          setProduct(found)
          const reviewsData = await api.get<any>(`/products/${found.id}/reviews`).catch(() => ({ reviews: [] }))
          setReviews(reviewsData.reviews || [])
          return
        }

        // 2. Fallback: fetch directly from backend by ID or slug
        // Handles products not in the initial 50-item global cache (e.g. wall posters)
        try {
          const res = await api.get<any>(`/products/${id}`)
          const p = res?.data || res
          if (p && p.id) {
            // Normalize to match catalog product shape
            const normalized = {
              id: String(p.id),
              name: p.title,
              categoryId: String(p.categoryId || p.category?.id || ''),
              categorySlug: p.category?.slug,
              price: parseFloat(p.price),
              originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : undefined,
              rating: parseFloat(p.ratingAvg || 0),
              reviews: p.reviewCount || 0,
              imageUrl: p.imageUrl,
              images: p.images?.length > 0
                ? p.images.map((img: any) => img.imageUrl)
                : [p.imageUrl],
              description: p.description || '',
              inStock: p.stock > 0,
              soldOut: p.stock === 0,
              featured: p.isFeatured,
              slug: p.slug,
              variants: p.variants,
            }
            setProduct(normalized)
            const reviewsData = await api.get<any>(`/products/${p.id}/reviews`).catch(() => ({ reviews: [] }))
            setReviews(reviewsData.reviews || [])
          }
        } catch (directErr) {
          console.error('Direct product fetch failed', directErr)
        }
      } catch (error) {
        console.error('Failed to fetch product details', error)
      } finally {
        setLoading(false)
      }
    }

    // Don't wait for catalogLoading if we can fetch directly
    fetchProductDetails()
  }, [id, data])

  // Automatically select the first variant if available
  useEffect(() => {
    if (product?.variants && product.variants.length > 0 && !selectedVariant) {
      setSelectedVariant(product.variants[0])
    }
  }, [product, selectedVariant])

  if (loading || catalogLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 max-w-7xl mx-auto px-4 text-center">
          <div className="flex flex-col items-center gap-4 py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full"
            />
            <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-black animate-pulse">Loading Universe...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="pt-32 max-w-7xl mx-auto px-4 text-center space-y-6">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground">Product not found</h1>
          <p className="text-muted-foreground/60">The universe you're looking for doesn't exist yet.</p>
          <Link href="/shop" className="inline-block bg-primary text-primary-foreground px-8 py-3 font-bold uppercase tracking-widest text-sm hover:opacity-80 transition-opacity">
            Back to Shop
          </Link>
        </div>
      </div>
    )
  }

  const fetchReviews = async () => {
    if (!product) return
    try {
      const reviewsData = await api.get<any>(`/products/${product.id}/reviews`)
      setReviews(reviewsData.reviews || [])
    } catch (error) {
      console.error('Failed to fetch reviews', error)
    }
  }

  const handleWriteReview = () => {
    if (!user) {
      toast.error('Please login to write a review')
      router.push('/login?redirect=' + window.location.pathname)
      return
    }
    setIsReviewModalOpen(true)
  }

  const handleSuccess = async () => {
    await Promise.all([
      fetchReviews(),
      refreshCatalog()
    ])
  }

  const similar = (data?.products ?? [])
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4)

  // Detect if this is a wall poster — show the room mockup slide
  const category = data?.categories?.find((c: any) => c.id === product.categoryId)
  const parentCategory = category?.parentId ? data?.categories?.find((c: any) => c.id === category.parentId) : null

  const isWallPoster = product.categorySlug === 'wall-posters' ||
    category?.slug === 'wall-posters' ||
    parentCategory?.slug === 'wall-posters' ||
    category?.name?.toLowerCase().includes('poster') ||
    parentCategory?.name?.toLowerCase().includes('poster')

  const primaryImage = product.images?.[0] || product.imageUrl || '/placeholder.jpg'

  const basePrice = Number(product.price) || 0
  const additionalPrice = selectedVariant ? Number(selectedVariant.additionalPrice) || 0 : 0
  const displayPrice = basePrice + additionalPrice

  const isLandscape = product.name?.toUpperCase().includes('LANDSCAPE')

  const totalImages = (product.images?.length || 0) + (isWallPoster ? 3 : 0)
  const currentImageIndex = selectedImage < 0 ? (product.images?.length || 0) + Math.abs(selectedImage) - 1 : selectedImage

  const nextImage = () => {
    if (selectedImage === WALL_MOCKUP_CONCRETE_INDEX) {
      setSelectedImage(0)
    } else if (selectedImage === WALL_MOCKUP_DESK_INDEX) {
      setSelectedImage(WALL_MOCKUP_PLANT_INDEX)
    } else if (selectedImage === WALL_MOCKUP_PLANT_INDEX) {
      setSelectedImage(WALL_MOCKUP_CONCRETE_INDEX)
    } else {
      const nextIdx = selectedImage + 1
      if (nextIdx >= (product.images?.length || 0)) {
        if (isWallPoster) setSelectedImage(WALL_MOCKUP_DESK_INDEX)
        else setSelectedImage(0)
      } else {
        setSelectedImage(nextIdx)
      }
    }
  }

  const prevImage = () => {
    if (selectedImage === 0) {
      if (isWallPoster) setSelectedImage(WALL_MOCKUP_CONCRETE_INDEX)
      else setSelectedImage((product.images?.length || 0) - 1)
    } else if (selectedImage === WALL_MOCKUP_DESK_INDEX) {
      setSelectedImage((product.images?.length || 0) - 1)
    } else if (selectedImage === WALL_MOCKUP_PLANT_INDEX) {
      setSelectedImage(WALL_MOCKUP_DESK_INDEX)
    } else if (selectedImage === WALL_MOCKUP_CONCRETE_INDEX) {
      setSelectedImage(WALL_MOCKUP_PLANT_INDEX)
    } else {
      setSelectedImage(selectedImage - 1)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground" style={{ isolation: 'isolate' }}>
      <Navbar />

      {/* Breadcrumbs — z-index ensures they are above any ghost animations */}
      <div className="relative z-10 pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={10} />
          <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <ChevronRight size={10} />
          <span className="text-foreground uppercase">{product.name}</span>
        </nav>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          <div className="lg:col-span-7 space-y-6">
            {/* Main Viewer */}
            <div className="relative aspect-square bg-muted/30 border border-border overflow-hidden group">
              <AnimatePresence mode="wait">
                {selectedImage === WALL_MOCKUP_DESK_INDEX ? (
                  <motion.div
                    key="mockup-desk"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <WallMockup
                      posterSrc={primaryImage}
                      alt={product.name}
                      roomSrc="/wall-mockup-room.jpg"
                      isLandscape={isLandscape}
                      posterStyles={{
                        top: '16%',
                        left: isLandscape ? '36%' : '40%',
                        width: isLandscape ? '28%' : '20%',
                        height: isLandscape ? '20%' : '28%',
                        transform: 'perspective(1000px) rotateY(-1.5deg) rotateX(0.5deg)',
                      }}
                    />
                  </motion.div>
                ) : selectedImage === WALL_MOCKUP_PLANT_INDEX ? (
                  <motion.div
                    key="mockup-plant"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <WallMockup
                      posterSrc={primaryImage}
                      alt={product.name}
                      roomSrc="/wall-mockup-plant.png"
                      isLandscape={isLandscape}
                      posterStyles={{
                        top: '15%',
                        left: isLandscape ? '25%' : '30%',
                        width: isLandscape ? '52%' : '38%',
                        height: isLandscape ? '38%' : '52%',
                        transform: 'perspective(1000px) rotateY(-1deg) rotateX(0.5deg)',
                      }}
                    />
                  </motion.div>
                ) : selectedImage === WALL_MOCKUP_CONCRETE_INDEX ? (
                  <motion.div
                    key="mockup-concrete"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <WallMockup
                      posterSrc={primaryImage}
                      alt={product.name}
                      roomSrc="/wall-mockup-concrete.png"
                      isLandscape={isLandscape}
                      posterStyles={{
                        top: '18%',
                        left: isLandscape ? '44%' : '48%',
                        width: isLandscape ? '46%' : '32%',
                        height: isLandscape ? '32%' : '46%',
                        transform: 'perspective(1000px) rotateY(-2deg) rotateX(0.5deg)',
                      }}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key={selectedImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 p-10 cursor-grab active:cursor-grabbing"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(e, { offset, velocity }) => {
                      const swipe = offset.x
                      if (swipe < -50) nextImage()
                      else if (swipe > 50) prevImage()
                    }}
                  >
                    <Image
                      src={product.images?.[selectedImage] || '/placeholder.jpg'}
                      alt={product.name}
                      fill
                      unoptimized
                      className="object-contain pointer-events-none"
                      priority
                    />
                  </motion.div>
                )}
              </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none" />
              
              {/* Navigation Arrows */}
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-3 bg-black/20 hover:bg-black/60 text-white backdrop-blur-sm transition-all rounded-full opacity-0 group-hover:opacity-100"
                aria-label="Previous image"
              >
                <ChevronRight className="rotate-180" size={20} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-3 bg-black/20 hover:bg-black/60 text-white backdrop-blur-sm transition-all rounded-full opacity-0 group-hover:opacity-100"
                aria-label="Next image"
              >
                <ChevronRight size={20} />
              </button>

              {!product.inStock && (
                <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-10">
                  <span className="text-foreground font-black text-4xl uppercase tracking-[0.2em] border-2 border-foreground px-8 py-4">Sold Out</span>
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {product.images?.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative flex-shrink-0 bg-muted/30 border transition-all duration-300 overflow-hidden w-24 h-24 p-3
                    ${selectedImage === idx ? 'border-primary opacity-100' : 'border-border opacity-50 hover:opacity-100 hover:border-primary/40'}`}
                >
                  <Image src={img} alt="" fill unoptimized className="object-contain" />
                </button>
              ))}

              {/* Wall Mockup Thumbnails — only for wall posters */}
              {isWallPoster && (
                <>
                  <button
                    onClick={() => setSelectedImage(WALL_MOCKUP_DESK_INDEX)}
                    className={`relative flex-shrink-0 border transition-all duration-300 overflow-hidden w-24 h-24
                      ${selectedImage === WALL_MOCKUP_DESK_INDEX ? 'border-primary opacity-100' : 'border-border opacity-50 hover:opacity-100 hover:border-primary/40'}`}
                  >
                    <WallMockup
                      posterSrc={primaryImage}
                      alt=""
                      roomSrc="/wall-mockup-room.jpg"
                      showBadge={false}
                      isLandscape={isLandscape}
                      posterStyles={{
                        top: '16%',
                        left: isLandscape ? '36%' : '40%',
                        width: isLandscape ? '28%' : '20%',
                        height: isLandscape ? '20%' : '28%',
                        transform: 'perspective(1000px) rotateY(-1.5deg) rotateX(0.5deg)',
                      }}
                    />
                    <div className="absolute inset-0 flex items-end justify-center pb-1.5 bg-black/20">
                      <span className="text-[7px] font-black uppercase tracking-widest text-white">Desk</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedImage(WALL_MOCKUP_PLANT_INDEX)}
                    className={`relative flex-shrink-0 border transition-all duration-300 overflow-hidden w-24 h-24
                      ${selectedImage === WALL_MOCKUP_PLANT_INDEX ? 'border-primary opacity-100' : 'border-border opacity-50 hover:opacity-100 hover:border-primary/40'}`}
                  >
                    <WallMockup
                      posterSrc={primaryImage}
                      alt=""
                      roomSrc="/wall-mockup-plant.png"
                      showBadge={false}
                      isLandscape={isLandscape}
                      posterStyles={{
                        top: '15%',
                        left: isLandscape ? '25%' : '30%',
                        width: isLandscape ? '52%' : '38%',
                        height: isLandscape ? '38%' : '52%',
                        transform: 'perspective(1000px) rotateY(-1deg) rotateX(0.5deg)',
                      }}
                    />
                    <div className="absolute inset-0 flex items-end justify-center pb-1.5 bg-black/20">
                      <span className="text-[7px] font-black uppercase tracking-widest text-white">Studio</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedImage(WALL_MOCKUP_CONCRETE_INDEX)}
                    className={`relative flex-shrink-0 border transition-all duration-300 overflow-hidden w-24 h-24
                      ${selectedImage === WALL_MOCKUP_CONCRETE_INDEX ? 'border-primary opacity-100' : 'border-border opacity-50 hover:opacity-100 hover:border-primary/40'}`}
                  >
                    <WallMockup
                      posterSrc={primaryImage}
                      alt=""
                      roomSrc="/wall-mockup-concrete.png"
                      showBadge={false}
                      isLandscape={isLandscape}
                      posterStyles={{
                        top: '18%',
                        left: isLandscape ? '44%' : '48%',
                        width: isLandscape ? '46%' : '32%',
                        height: isLandscape ? '32%' : '46%',
                        transform: 'perspective(1000px) rotateY(-2deg) rotateX(0.5deg)',
                      }}
                    />
                    <div className="absolute inset-0 flex items-end justify-center pb-1.5 bg-black/20">
                      <span className="text-[7px] font-black uppercase tracking-widest text-white">Concrete</span>
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-px bg-primary" />
                <span className="text-primary text-[10px] font-mono tracking-[0.3em] uppercase">Premium Series</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter leading-[0.9]">
                {product.name}
              </h1>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-primary">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < Math.floor(product.rating) ? 'fill-primary' : 'text-muted-foreground/20'} />
                  ))}
                </div>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold font-body">
                  {product.rating} Rating / {product.reviews} Reviews
                </span>
              </div>
            </div>

            {/* Product Description — Fixed: Added missing section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">The Overview</span>
                <div className="flex-1 h-px bg-border/40" />
              </div>
              <p className="text-sm sm:text-base text-muted-foreground/80 leading-relaxed font-medium font-body max-w-xl">
                {product.description}
              </p>
            </div>

            <div className="bg-muted/30 border border-border p-8 sm:p-12 space-y-10">
              <div className="flex items-baseline gap-4">
                <span className="text-5xl font-black text-foreground font-price">
                  ₹{displayPrice.toLocaleString('en-IN')}
                </span>
                {product.originalPrice && (
                  <span className="text-2xl text-muted-foreground line-through font-light font-price">
                    ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase font-body opacity-60">
                * Prices inclusive of all taxes. Worldwide shipping available.
              </p>
            </div>

            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                  Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v: any) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`
                        px-6 py-2 text-[10px] font-bold border rounded-full transition-all duration-300 uppercase tracking-widest
                        ${selectedVariant?.id === v.id
                          ? 'bg-foreground text-background border-foreground scale-[1.02]'
                          : 'bg-transparent text-foreground border-border hover:border-foreground/30'}
                      `}
                    >
                      {v.variantName}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-muted-foreground/80 leading-relaxed max-w-sm mt-3">
                  Note: Please check the size chart carefully before placing your order. Size change requests after ordering may not be possible.
                </p>
              </div>
            )}

            <div className="space-y-4 pt-4">
              {product.inStock && (
                <div className="flex items-center gap-6 mb-8">
                  <div className="flex items-center border border-border bg-muted overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-5 py-4 hover:bg-muted/80 transition-colors text-muted-foreground"
                    >
                      −
                    </button>
                    <span className="w-12 text-center font-black text-sm">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-5 py-4 hover:bg-muted/80 transition-colors text-muted-foreground"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-primary font-bold animate-pulse">
                    Only few pieces remaining
                  </span>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  disabled={!product.inStock}
                  onClick={() => {
                    if (!product.inStock) return
                    dispatch(
                      addToCart({
                        productId: product.id,
                        name: product.name || product.title,
                        image: product.images?.[0]?.imageUrl || product.images?.[0] || product.imageUrl,
                        price: displayPrice,
                        quantity,
                        variantId: selectedVariant?.id,
                        variantName: selectedVariant?.variantName,
                      }),
                    )
                    toast.success('Added to cart')
                  }}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-black py-5 uppercase tracking-[0.2em] text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale"
                >
                  <ShoppingCart size={18} />
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
                <button
                  onClick={() => product && toggleWishlist(String(product.id))}
                  className={`
                    p-5 border transition-all duration-300
                    ${isWishlisted ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'}
                  `}
                >
                  <Heart size={20} className={isWishlisted ? 'fill-current' : ''} />
                </button>
              </div>
            </div>

            <div className="pt-10 grid grid-cols-2 sm:grid-cols-3 gap-8 border-t border-border">
              <div className="flex flex-col gap-2 items-center text-center">
                <ShieldCheck className="text-primary shrink-0" size={20} />
                <p className="text-[9px] font-black uppercase tracking-widest leading-tight">Secure<br />Checkout</p>
              </div>
              <div className="flex flex-col gap-2 items-center text-center border-l border-border">
                <Share2 className="text-primary shrink-0" size={20} />
                <p className="text-[9px] font-black uppercase tracking-widest leading-tight">All India<br />Delivery</p>
              </div>
              <div className="flex flex-col gap-2 items-center text-center border-t pt-8 sm:pt-0 sm:border-t-0 sm:border-l sm:border-border sm:pl-4">
                <Truck className="text-primary shrink-0" size={20} />
                <p className="text-[9px] font-black uppercase tracking-widest leading-tight">Free Shipping<br />Above ₹999</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {similar.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-border">
          <div className="flex items-end justify-between mb-12">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-px bg-primary" />
                <span className="text-primary text-[10px] font-mono tracking-[0.3em] uppercase">Collection</span>
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tighter">You May Also Like</h2>
            </div>
            <Link href="/shop" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground transition-colors">
              Explore All →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 bg-muted/20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-px bg-primary" />
              <span className="text-primary text-[10px] font-mono tracking-[0.3em] uppercase">Community</span>
            </div>
            <h2 className="text-4xl font-black uppercase tracking-tighter">Collector Reviews</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-primary text-xl font-black">
                {product.rating} <Star size={20} className="fill-primary" />
              </div>
              <span className="text-muted-foreground text-xs uppercase tracking-widest">Based on {reviews.length} experiences</span>
            </div>
          </div>
          <button
            onClick={handleWriteReview}
            className="bg-background hover:bg-muted text-foreground border border-border px-8 py-4 font-black uppercase tracking-widest text-[10px] transition-all"
          >
            Write a Review
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reviews.length > 0 ? reviews.map((r, i) => (
            <div key={r.id} className="bg-background border border-border p-8 space-y-6 relative group overflow-hidden">
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <p className="font-black uppercase tracking-tighter text-lg">{r.userName || r.user?.name || 'Anonymous'}</p>
                    {true && (
                      <span className="flex items-center gap-1 text-[8px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-widest">
                        <ShieldCheck size={10} /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-0.5 text-primary">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className={i < r.rating ? 'fill-primary' : 'text-muted-foreground/20'} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed italic relative z-10">
                "{r.comment}"
              </p>
              <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )) : (
            <div className="col-span-2 py-20 text-center border border-dashed border-border">
              <p className="text-muted-foreground uppercase tracking-widest text-xs">No reviews yet. Be the first to collector.</p>
            </div>
          )}
        </div>
      </section>

      {product && (
        <ReviewForm
          productId={Number(product.id)}
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onSuccess={handleSuccess}
          initialRating={reviews.find(r => (r.userId || r.user?.id) === user?.id)?.rating}
          initialComment={reviews.find(r => (r.userId || r.user?.id) === user?.id)?.comment}
        />
      )}
    </div>
  )
}
