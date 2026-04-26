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

  return (
    <motion.div
      className={cn('absolute top-4 right-4 z-20 px-3 py-2 rounded-full text-xs font-bold text-white', bgColor, 'border', borderColor, 'backdrop-blur-sm')}
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

  return (
    <Link href={`/product/${product.id}`}>
      <motion.div
        className="group cursor-pointer h-full flex flex-col"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {/* Image Container with Hover Animation */}
        <motion.div
          className="relative w-full aspect-square bg-card rounded-2xl overflow-hidden mb-4 flex-shrink-0"
          onMouseEnter={() => setIsImageHovered(true)}
          onMouseLeave={() => setIsImageHovered(false)}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          {/* Main Image */}
          {product.images?.[0] ? (
            <motion.div
              className="absolute inset-0 p-6 bg-white"
              animate={{
                opacity: isImageHovered && product.images[1] ? 0 : 1,
              }}
              transition={{ duration: 0.4 }}
            >
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-contain transition-transform duration-700"
                quality={75}
                priority={priority}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            </motion.div>
          ) : (
            <div className="absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground">
              <span className="text-sm font-medium">No Image</span>
            </div>
          )}

          {/* Secondary Image - Cross-fade on hover */}
          {product.images?.[1] && (
            <motion.div
              className="absolute inset-0 p-6 bg-white"
              animate={{
                opacity: isImageHovered ? 1 : 0,
              }}
              transition={{ duration: 0.4 }}
            >
              <Image
                src={product.images[1]}
                alt={`${product.name} alternate`}
                fill
                className="object-contain transition-transform duration-700"
                quality={75}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            </motion.div>
          )}

          {/* Overlay Gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
            animate={{
              opacity: isImageHovered ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Status Badges */}
          {product.soldOut && <PremiumBadge label="Sold Out" variant="sold" />}
          {product.limited && product.inStock && <PremiumBadge label="Limited" variant="limited" />}

          {/* Wishlist Button */}
          <motion.button
            className="absolute bottom-4 right-4 z-20 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all cursor-interactive"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            <Heart size={18} className="text-white" />
          </motion.button>
        </motion.div>

        {/* Product Info Section */}
        <div className="flex flex-1 flex-col gap-2.5">
          {/* Product Name */}
          <div className="min-h-[44px]">
            <h3 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </div>

          {/* Rating Stars */}
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className="text-xs"
                >
                  {i < Math.floor(product.rating) ? '★' : '☆'}
                </span>
              ))}
            </div>
            <span className="text-xs text-muted-foreground ml-auto">
              {product.rating}
              <span className="text-muted-foreground/60 ml-1">({product.reviews})</span>
            </span>
          </div>

          {/* Price Section */}
          <div className="flex items-baseline gap-2 py-1">
            <span className="text-base sm:text-lg font-bold text-foreground">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-sm text-muted-foreground line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-semibold text-primary ml-auto">
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

          {/* Magnetic Add to Cart Button */}
          <div ref={magneticRef} className="relative">
            <motion.button
              onClick={(e) => {
                e.preventDefault()
                if (product.inStock) {
                  dispatch(
                    addToCart({
                      productId: product.id,
                      name: product.name,
                      image: product.images?.[0],
                      price: product.price,
                      quantity: 1,
                    }),
                  )
                }
              }}
              className={cn(
                'w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-interactive',
                product.inStock
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl'
                  : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50',
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
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 150, damping: 15 }}
            >
              <ShoppingCart size={16} className="flex-shrink-0" />
              <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
