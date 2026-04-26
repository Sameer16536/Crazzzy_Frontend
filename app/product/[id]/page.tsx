'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import { ShoppingCart, Heart, Share2, Star, ShieldCheck, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useAppDispatch } from '@/lib/store/hooks'
import { addToCart } from '@/lib/store/slices/cart-slice'
import { useParams } from 'next/navigation'
import { useCatalog } from '@/lib/catalog/use-catalog'
import { ProductCard } from '@/components/product-card'
import { api } from '@/lib/api-client'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

export default function ProductPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const { data, isLoading: catalogLoading } = useCatalog()
  const [product, setProduct] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!id) return

    async function fetchProductDetails() {
      try {
        setLoading(true)
        // Fetch specific product by ID or Slug (backend guide says /products/:slug but usually ID works too or we can find it in catalog)
        // For now, let's find it in catalog to get the full object, then fetch reviews
        const found = data?.products.find((p) => p.id === id)
        if (found) {
          setProduct(found)
          // Fetch real reviews
          const reviewsData = await api.get<any[]>(`/products/${id}/reviews`)
          setReviews(reviewsData)
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

  const handleVariantChange = (name: string, value: string) => {
    setSelectedVariants((prev) => ({ ...prev, [name]: value }))
  }

  if (loading || catalogLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="pt-32 max-w-7xl mx-auto px-4 text-center">
          <Loader loading />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="pt-32 max-w-7xl mx-auto px-4 text-center space-y-6">
          <h1 className="text-4xl font-black uppercase tracking-tighter">Product not found</h1>
          <p className="text-white/50">The universe you're looking for doesn't exist yet.</p>
          <Link href="/shop" className="inline-block bg-primary text-black px-8 py-3 font-bold uppercase tracking-widest text-sm hover:opacity-80 transition-opacity">
            Back to Shop
          </Link>
        </div>
      </div>
    )
  }

  const similar = (data?.products ?? [])
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4)

  // Group variants by name
  const variantsByName = product.variants?.reduce((acc: any, v: any) => {
    if (!acc[v.name]) acc[v.name] = []
    acc[v.name].push(v)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black">
      <Navbar />
      
      {/* Breadcrumbs */}
      <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/40 mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={10} />
          <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <ChevronRight size={10} />
          <span className="text-white/80">{product.name}</span>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Column: Image Gallery (lg:7) */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div 
              layoutId={`product-image-${product.id}`}
              className="relative aspect-square bg-zinc-900 border border-white/5 overflow-hidden group"
            >
              <Image
                src={product.images?.[selectedImage] || "/placeholder.jpg"}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              
              {!product.inStock && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-white font-black text-4xl uppercase tracking-[0.2em] border-2 border-white px-8 py-4">Sold Out</span>
                </div>
              )}
            </motion.div>

            {/* Thumbnails */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {product.images?.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`
                    relative flex-shrink-0 w-24 aspect-square border-2 transition-all duration-300
                    ${selectedImage === idx ? 'border-primary opacity-100' : 'border-white/5 opacity-50 hover:opacity-100'}
                  `}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Details (lg:5) */}
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
                    <Star key={i} size={14} className={i < Math.floor(product.rating) ? 'fill-primary' : 'text-white/20'} />
                  ))}
                </div>
                <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                  {product.rating} Rating / {product.reviews} Reviews
                </span>
              </div>
            </div>

            <div className="space-y-4 border-y border-white/5 py-8">
              <div className="flex items-baseline gap-4">
                <span className="text-5xl font-black text-white">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice && (
                  <span className="text-2xl text-white/30 line-through font-light">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <p className="text-xs text-white/40 font-light tracking-wide italic">
                * Prices inclusive of all taxes. Worldwide shipping available.
              </p>
            </div>

            {/* Variant Selectors */}
            {variantsByName && Object.keys(variantsByName).length > 0 && (
              <div className="space-y-8">
                {Object.entries(variantsByName).map(([name, items]: [string, any]) => (
                  <div key={name} className="space-y-4">
                    <label className="text-[10px] uppercase tracking-[0.3em] text-white/60 font-black">
                      Select {name}
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {items.map((item: any) => (
                        <button
                          key={item.value}
                          onClick={() => handleVariantChange(name, item.value)}
                          className={`
                            px-6 py-3 text-xs font-bold border transition-all duration-300 uppercase tracking-widest
                            ${selectedVariants[name] === item.value 
                              ? 'bg-primary text-black border-primary scale-105' 
                              : 'bg-transparent text-white border-white/10 hover:border-white/30'}
                          `}
                        >
                          {item.value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA Section */}
            <div className="space-y-4 pt-4">
              {product.inStock && (
                <div className="flex items-center gap-6 mb-8">
                  <div className="flex items-center border border-white/10 bg-zinc-900 overflow-hidden">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-5 py-4 hover:bg-white/5 transition-colors text-white/50"
                    >
                      −
                    </button>
                    <span className="w-12 text-center font-black text-sm">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-5 py-4 hover:bg-white/5 transition-colors text-white/50"
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
                        name: product.name,
                        image: product.images?.[0],
                        price: product.price,
                        quantity,
                        variants: selectedVariants,
                      }),
                    )
                    toast.success('Added to cart')
                  }}
                  className="flex-1 bg-primary hover:bg-primary/90 text-black font-black py-5 uppercase tracking-[0.2em] text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale"
                >
                  <ShoppingCart size={18} />
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`
                    p-5 border transition-all duration-300
                    ${isWishlisted ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 text-white/40 hover:text-white hover:border-white/30'}
                  `}
                >
                  <Heart size={20} className={isWishlisted ? 'fill-current' : ''} />
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="pt-10 grid grid-cols-2 gap-8 border-t border-white/5">
              <div className="flex gap-4 items-start">
                <ShieldCheck className="text-primary shrink-0" size={20} />
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest">Secure Checkout</p>
                  <p className="text-[10px] text-white/30 leading-relaxed font-light">Razorpay verified safe transactions.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <Share2 className="text-primary shrink-0" size={20} />
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest">Global Delivery</p>
                  <p className="text-[10px] text-white/30 leading-relaxed font-light">Doorstep delivery across the universe.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Similar Items */}
      {similar.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-white/5">
          <div className="flex items-end justify-between mb-12">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-px bg-primary" />
                <span className="text-primary text-[10px] font-mono tracking-[0.3em] uppercase">Collection</span>
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tighter">You May Also Like</h2>
            </div>
            <Link href="/shop" className="text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-primary transition-colors">
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

      {/* Reviews Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 bg-zinc-900/30">
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
               <span className="text-white/30 text-xs uppercase tracking-widest">Based on {reviews.length} experiences</span>
            </div>
          </div>
          <button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-4 font-black uppercase tracking-widest text-[10px] transition-all">
            Write a Review
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reviews.length > 0 ? reviews.map((r, i) => (
            <motion.div 
              key={r.id} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-black border border-white/5 p-8 space-y-6 relative group overflow-hidden"
            >
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <p className="font-black uppercase tracking-tighter text-lg">{r.userName || r.user?.name || 'Anonymous'}</p>
                    {r.isVerified && (
                      <span className="flex items-center gap-1 text-[8px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-widest">
                        <ShieldCheck size={10} /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-0.5 text-primary">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className={i < r.rating ? 'fill-primary' : 'text-white/10'} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-white/60 leading-relaxed italic relative z-10">
                "{r.comment}"
              </p>
              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          )) : (
            <div className="col-span-2 py-20 text-center border border-dashed border-white/10">
              <p className="text-white/30 uppercase tracking-widest text-xs">No reviews yet. Be the first to collector.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function Loader({ loading }: { loading: boolean }) {
  return (
    <AnimatePresence>
      {loading && (
        <div className="flex flex-col items-center gap-4 py-20">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full"
          />
          <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-black animate-pulse">Loading Universe...</p>
        </div>
      )}
    </AnimatePresence>
  )
}
