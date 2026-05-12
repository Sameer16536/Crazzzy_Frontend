'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import { ShoppingCart, Heart, Share2, Star, ShieldCheck, ChevronRight, Truck, Wallet } from 'lucide-react'
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

export default function ProductPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const { data, isLoading: catalogLoading, toggleWishlist, wishlistIds, refresh: refreshCatalog } = useCatalog()
  const [product, setProduct] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
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
        // Fetch specific product by ID or Slug
        const found = data?.products.find((p) => String(p.id) === id || p.slug === id)
        if (found) {
          setProduct(found)
          // Fetch real reviews
          const reviewsData = await api.get<any>(`/products/${found.id}/reviews`).catch(() => ({ reviews: [] }))
          setReviews(reviewsData.reviews || [])
        }
      } catch (error) {
        console.error('Failed to fetch product details', error)
      } finally {
        setLoading(false)
      }
    }

    if (!catalogLoading) {
      fetchProductDetails()
    }
  }, [id, data, catalogLoading])

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

  const basePrice = Number(product.price) || 0
  const additionalPrice = selectedVariant ? Number(selectedVariant.additionalPrice) || 0 : 0
  const displayPrice = basePrice + additionalPrice

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
            <div className="relative aspect-square bg-muted/30 border border-border overflow-hidden group p-10">
              <Image
                src={product.images?.[selectedImage] || "/placeholder.jpg"}
                alt={product.name}
                fill
                className="object-contain transition-transform duration-1000"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none" />

              {!product.inStock && (
                <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-foreground font-black text-4xl uppercase tracking-[0.2em] border-2 border-foreground px-8 py-4">Sold Out</span>
                </div>
              )}
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {product.images?.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`
                    relative flex-shrink-0 bg-muted/30 border transition-all duration-300 overflow-hidden w-24 h-24 p-3
                    ${selectedImage === idx ? 'border-primary opacity-100' : 'border-border opacity-50 hover:opacity-100 hover:border-primary/40'}
                  `}
                >
                  <Image src={img} alt="" fill className="object-contain" />
                </button>
              ))}
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
