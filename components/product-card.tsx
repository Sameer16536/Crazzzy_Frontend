/**
 * Premium Product Card Component
 * Features:
 * - Image cross-fade animation on hover (primary ↔ secondary)
 * - Magnetic "Add to Cart" button (pulls toward cursor)
 * - Digital badge stickers (Limited Edition, Sold Out)
 * - Premium glassmorphism overlays
 * - Smooth animations and transitions
 */

'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppDispatch } from '@/lib/store/hooks'
import { addToCart } from '@/lib/store/slices/cart-slice'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useMagneticButton } from '@/hooks/use-animations'
import { useCatalog } from '@/lib/catalog/catalog-context'
import { toast } from 'sonner'

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    originalPrice?: number
    rating: number
    reviews: number
    images: string[]
    inStock: boolean
    soldOut?: boolean
    limited?: boolean
    categoryId?: string
    /** Used for combo offer eligibility (e.g. 'wall-posters') */
    categorySlug?: string
    variants?: {
      id: number
      variantName: string
      additionalPrice: string
      stock: number
    }[]
  }
  /** Pass true for the first 1-2 cards visible above the fold (LCP optimization) */
  priority?: boolean
}

/**
 * PremiumBadge - Digital sticker overlay for product status
 */
function PremiumBadge({ label, variant = 'limited' }: { label: string; variant?: 'limited' | 'sold' }) {
  const bgColor = variant === 'sold' ? 'bg-red-500/90' : 'bg-primary/90'
  const borderColor = variant === 'sold' ? 'border-red-400' : 'border-primary/30'
  const textColor = variant === 'sold' ? 'text-white' : 'text-primary-foreground'

  return (
    <motion.div
      className={cn('absolute top-4 right-4 z-20 px-3 py-2 rounded-full text-xs font-bold', textColor, bgColor, 'border', borderColor, 'backdrop-blur-sm')}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      whileHover={{ scale: 1.05 }}
    >
      {label}
    </motion.div>
  )
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [isImageHovered, setIsImageHovered] = useState(false)
  const dispatch = useAppDispatch()
  const buttonRef = useRef<HTMLDivElement>(null)
  const { ref: magneticRef, x: magneticX, y: magneticY } = useMagneticButton(0.25)
  const { wishlistIds, toggleWishlist } = useCatalog()
  
  const isWishlisted = wishlistIds.has(String(product.id))

  return (
    <Link href={`/product/${product.id}`}>
      <motion.div
        className="group cursor-pointer h-full flex flex-col active:scale-[0.98] md:active:scale-100 transition-transform"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {/* Image Container */}
        <div
          className="relative w-full aspect-square bg-card rounded-xl md:rounded-2xl overflow-hidden mb-3 md:mb-4 flex-shrink-0 transition-transform duration-300 group-hover:scale-[1.02]"
          onMouseEnter={() => setIsImageHovered(true)}
          onMouseLeave={() => setIsImageHovered(false)}
        >
          {/* Main Image */}
          {product.images?.[0] ? (
            <div
              className="absolute inset-0 p-6 bg-white transition-opacity duration-400"
              style={{ opacity: isImageHovered && product.images[1] ? 0 : 1 }}
            >
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-contain"
                quality={75}
                priority={priority}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            </div>
          ) : (
            <div className="absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground">
              <span className="text-sm font-medium">No Image</span>
            </div>
          )}

          {/* Secondary Image - Cross-fade on hover */}
          {product.images?.[1] && (
            <div
              className="absolute inset-0 p-6 bg-white transition-opacity duration-400"
              style={{ opacity: isImageHovered ? 1 : 0 }}
            >
              <Image
                src={product.images[1]}
                alt={`${product.name} alternate`}
                fill
                className="object-contain"
                quality={75}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            </div>
          )}

          {/* Overlay Gradient */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent transition-opacity duration-300"
            style={{ opacity: isImageHovered ? 1 : 0 }}
          />

          {/* Status Badges */}
          {product.soldOut && <PremiumBadge label="Sold Out" variant="sold" />}
          {product.limited && product.inStock && <PremiumBadge label="Limited" variant="limited" />}

          {/* Wishlist Button */}
          <button
            className={cn(
              "absolute bottom-2 right-2 md:bottom-4 md:right-4 z-20 p-2 md:p-3 rounded-full backdrop-blur-sm transition-all cursor-interactive border",
              isWishlisted 
                ? "bg-primary border-primary text-primary-foreground" 
                : "bg-white/20 border-white/10 text-black hover:bg-white/40"
            )}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              toggleWishlist(String(product.id))
            }}
          >
            <Heart 
              size={16} 
              className={cn("md:w-[18px] md:h-[18px] transition-transform duration-300", isWishlisted && "fill-current scale-110")} 
            />
          </button>
        </div>

        {/* Product Info Section */}
        <div className="flex flex-1 flex-col gap-1.5 md:gap-2.5">
          {/* Product Name */}
          <div className="min-h-[36px] md:min-h-[44px]">
            <h3 className="text-[13px] md:text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight md:leading-snug uppercase">
              {product.name}
            </h3>
          </div>

          {/* Rating Stars */}
          <div className="flex items-center gap-1 md:gap-2">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className="text-[10px] md:text-xs"
                >
                  {i < Math.floor(product.rating) ? '★' : '☆'}
                </span>
              ))}
            </div>
            <span className="text-[10px] md:text-xs text-muted-foreground ml-auto">
              {product.rating}
              <span className="hidden md:inline text-muted-foreground/60 ml-1">({product.reviews})</span>
            </span>
          </div>

          {/* Price Section */}
          <div className="flex items-baseline gap-1.5 md:gap-2 py-0.5 md:py-1">
            <span className="text-sm md:text-lg font-bold text-foreground">
              ₹{(() => {
                const allPrices = [
                  product.price,
                  ...(product.variants || []).map(v => product.price + (Number(v.additionalPrice) || 0))
                ]
                return Math.max(...allPrices).toLocaleString('en-IN')
              })()}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-[10px] md:text-sm text-muted-foreground line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
                <span className="hidden md:inline text-xs font-semibold text-primary ml-auto">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          {/* Stock Status */}
          {!product.inStock && (
            <p className="text-xs font-semibold text-destructive">Out of Stock</p>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Add to Cart Button - Responsive */}
          <div ref={magneticRef} className="relative mt-auto">
            <motion.button
              onClick={(e) => {
                e.preventDefault()
                if (product.inStock) {
                  // Find default variant for Wall Posters (13 x 19)
                  let finalPrice = product.price
                  let variantId = undefined
                  let variantName = undefined

                  // Check if it's a Wall Poster (by name or searching category)
                  const isPoster = product.name.toLowerCase().includes('poster')
                  
                  if (isPoster && product.variants && product.variants.length > 0) {
                    // Match '13x19', '13 x 19', etc. by removing spaces
                    const defaultVariant = product.variants.find(v => 
                      v.variantName.replace(/\s+/g, '').toLowerCase() === '13x19'
                    )
                    
                    if (defaultVariant) {
                      variantId = defaultVariant.id
                      variantName = defaultVariant.variantName
                      // Correctly handles negative additionalPrice: 180 + (-60) = 120
                      finalPrice = product.price + (Number(defaultVariant.additionalPrice) || 0)
                    }
                  }

                  dispatch(
                    addToCart({
                      productId: product.id,
                      name: product.name,
                      image: product.images?.[0],
                      price: finalPrice,
                      quantity: 1,
                      variantId,
                      variantName,
                      categorySlug: product.categorySlug,
                    }),
                  )
                  toast.success(`Added ${variantName ? `${product.name} (${variantName})` : product.name} to cart`)
                }
              }}
              className={cn(
                'w-full transition-all duration-200 flex items-center justify-center gap-2 cursor-interactive rounded-xl',
                product.inStock
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md'
                  : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50',
                // Responsive sizing
                'h-9 md:h-12 text-[11px] md:text-sm font-semibold'
              )}
              disabled={!product.inStock}
              style={
                product.inStock
                  ? {
                    x: magneticX,
                    y: magneticY,
                  }
                  : undefined
              }
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <ShoppingCart size={14} className="md:w-4 md:h-4 flex-shrink-0" />
              <span>{product.inStock ? (
                <>
                  <span className="md:hidden">Add</span>
                  <span className="hidden md:inline">Add to Cart</span>
                </>
              ) : 'Out of Stock'}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
