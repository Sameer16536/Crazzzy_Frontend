/**
 * Product Detail Page
 * Shows full product details with:
 * - Large product image with hover effects
 * - Alternate image gallery
 * - Specs and details
 * - Add to cart functionality
 * - Rating and reviews
 */

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import { ShoppingCart, Heart, Share2, Star } from 'lucide-react'
import Link from 'next/link'
import { useAppDispatch } from '@/lib/store/hooks'
import { addToCart } from '@/lib/store/slices/cart-slice'
import { useParams } from 'next/navigation'
import { useCatalog } from '@/lib/catalog/use-catalog'
import { ProductCard } from '@/components/product-card'

type Review = {
  id: string
  name: string
  rating: number
  date: string
  text: string
}

function buildMockReviews(productId: string, count: number): Review[] {
  const base: Review[] = [
    { id: 'r1', name: 'Aarav', rating: 5, date: '2026-03-14', text: 'Looks premium in-hand. Great packaging.' },
    { id: 'r2', name: 'Isha', rating: 4, date: '2026-02-22', text: 'Exactly as shown. Fast delivery.' },
    { id: 'r3', name: 'Kabir', rating: 5, date: '2026-01-09', text: 'Perfect for gifting. Quality is solid.' },
    { id: 'r4', name: 'Meera', rating: 4, date: '2025-12-28', text: 'Nice product. Would buy again.' },
  ]
  const n = Math.max(0, Math.min(6, Math.floor(count / 20) + 2))
  return Array.from({ length: n }).map((_, i) => ({
    ...base[i % base.length],
    id: `${productId}-${base[i % base.length].id}-${i}`,
  }))
}

export default function ProductPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const { data, isLoading } = useCatalog()
  const product = data?.products.find((p) => p.id === id)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const dispatch = useAppDispatch()

  if (!product && !isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Product not found</h1>
          <Link href="/shop" className="text-primary hover:text-primary/80">
            Back to shop
          </Link>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Loading…</h1>
        </div>
      </div>
    )
  }

  const similar = (data?.products ?? [])
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 6)

  const reviews = buildMockReviews(product.id, product.reviews)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16" />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image Section */}
          <div className="space-y-4">
            {/* Main Image with Hover Animation */}
            <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-card">
              {product.images?.[selectedImage] ? (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover w-300 h-300"
                />
              ) : (
                <div className="absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground">
                  <span className="text-sm font-medium">Image soon</span>
                </div>
              )}
              {product.soldOut && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">Sold Out</span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-primary' : 'border-border'
                    }`}
                  >
                    <Image
                      src={product.images[index]}
                      alt={`Thumbnail ${index + 1}`}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details Section */}
          <div className="space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.floor(product.rating) ? 'fill-primary text-primary' : 'text-muted-foreground'}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-2 border-b border-border pb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-foreground">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {/* Tax Info */}
              <p className="text-xs text-muted-foreground">
                Tax included. Free shipping on orders over ₹1,999
              </p>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="font-bold text-foreground mb-2">About this product</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Specifications */}
            {/* Specs can be added once backend supports structured attributes */}

            {/* Stock Status */}
            {!product.inStock && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                <p className="text-destructive font-semibold">Currently out of stock</p>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4 border-t border-border pt-6">
              {product.inStock && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-muted rounded-lg p-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-background rounded transition-colors"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 hover:bg-background rounded transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.reviews === 0 ? 'Only a few left' : 'In stock'}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
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
                      }),
                    )
                  }}
                  className="flex-1 py-4 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground font-bold rounded-lg transition-colors flex items-center justify-center gap-2 active:scale-95"
                >
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="px-6 py-4 border border-border hover:border-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  <Heart size={20} className={isWishlisted ? 'fill-primary text-primary' : 'text-muted-foreground'} />
                </button>
                <button className="px-6 py-4 border border-border hover:border-primary hover:bg-primary/10 rounded-lg transition-colors">
                  <Share2 size={20} className="text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-card rounded-lg p-4 space-y-3 text-sm">
              <div className="flex gap-3">
                <span className="text-primary font-bold">✓</span>
                <span className="text-muted-foreground">Order via Instagram DM or reach out for customs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Similar Products */}
      {similar.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Similar products</h2>
              <p className="text-sm text-muted-foreground">More from the same category</p>
            </div>
            <Link href={`/shop/${data?.categories.find((c) => c.id === product.categoryId)?.slug ?? 'shop'}`} className="text-primary hover:text-primary/80 font-semibold">
              View category →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border/10">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Reviews</h2>
            <p className="text-sm text-muted-foreground">
              {product.rating} average • {product.reviews} total
            </p>
          </div>
          <button className="px-4 py-2 rounded-lg border border-border/40 hover:bg-muted transition-colors text-sm font-semibold">
            Write a review
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl border border-border/30 bg-card/50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-foreground">{r.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{r.date}</p>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < r.rating ? 'fill-primary text-primary' : 'text-muted-foreground'}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4 leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
