/**
 * FeaturedProducts Component
 * 
 * Displays a curated grid of featured/top-selling products
 * Inspired by Reawaken Theory's aesthetic grid layout
 * 
 * Features:
 * - Product image showcase with hover overlay
 * - Quick preview on hover
 * - Category badges
 * - Stock status indicators
 * - Sales count visualization
 * 
 * Design Pattern: Minimal aesthetic with emphasis on product images
 */

// ! This is for Admin dashboard only, not used on the public site
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface FeaturedProduct {
  id: string
  name: string
  category: string
  image: string
  price: number
  sales: number
  stock: number
  trend: 'hot' | 'new' | 'trending'
}

export function FeaturedProducts() {
  // Sample featured products - replace with real data in production
  const featuredProducts: FeaturedProduct[] = [
    {
      id: '1',
      name: 'Premium Vinyl Collection',
      category: 'Music',
      image: '🎵',
      price: 2499,
      sales: 342,
      stock: 15,
      trend: 'hot',
    },
    {
      id: '2',
      name: 'Aesthetic Wall Posters',
      category: 'Decor',
      image: '🖼️',
      price: 599,
      sales: 1245,
      stock: 45,
      trend: 'trending',
    },
    {
      id: '3',
      name: 'Limited Edition Mirrors',
      category: 'Home',
      image: '🪞',
      price: 3999,
      sales: 189,
      stock: 8,
      trend: 'new',
    },
    {
      id: '4',
      name: 'Vintage Action Figures',
      category: 'Collectibles',
      image: '🦸',
      price: 4999,
      sales: 567,
      stock: 22,
      trend: 'hot',
    },
    {
      id: '5',
      name: 'Custom Album Prints',
      category: 'Art',
      image: '🎨',
      price: 1299,
      sales: 892,
      stock: 30,
      trend: 'trending',
    },
    {
      id: '6',
      name: 'Neon Road Signs',
      category: 'Decor',
      image: '🛣️',
      price: 2199,
      sales: 456,
      stock: 12,
      trend: 'new',
    },
  ]

  const getTrendBadgeColor = (trend: string) => {
    switch (trend) {
      case 'hot':
        return 'bg-red-500/20 text-red-600 border-red-500/30'
      case 'new':
        return 'bg-blue-500/20 text-blue-600 border-blue-500/30'
      case 'trending':
        return 'bg-amber-500/20 text-amber-600 border-amber-500/30'
      default:
        return 'bg-slate-500/20 text-slate-600 border-slate-500/30'
    }
  }

  return (
    <div className="space-y-6">
      {/* Section header with minimal aesthetic */}
      <div className="flex items-end justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Featured Products</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Top-performing items across your collection
          </p>
        </div>
        <button className="text-primary hover:text-primary/80 transition-colors font-medium text-sm">
          View All →
        </button>
      </div>

      {/* Product grid - inspired by Posterized's clean layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product} trendColor={getTrendBadgeColor(product.trend)} />
        ))}
      </div>
    </div>
  )
}

/**
 * Individual product card component
 * 
 * Props:
 * - product: FeaturedProduct object
 * - trendColor: String for badge styling
 * 
 * Features:
 * - Hover overlay effects
 * - Image placeholder with emoji icon
 * - Quick stats display (sales, stock)
 * - Trend badge positioning
 */
function ProductCard({ 
  product, 
  trendColor 
}: { 
  product: FeaturedProduct
  trendColor: string
}) {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer bg-card/50 backdrop-blur-sm border-border/50">
      {/* Image container with hover overlay */}
      <div className="relative bg-gradient-to-br from-muted to-muted/50 aspect-square overflow-hidden">
        {/* Product image placeholder */}
<div className="w-full h-full flex items-center justify-center text-6xl scale-100 group-hover:scale-125 transition-transform duration-300">
           {product.image}
        </div>

        {/* Hover overlay with quick info */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center p-4 space-y-3">
          <p className="text-white text-sm font-semibold text-center">{product.name}</p>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            Quick Edit
          </button>
        </div>

        {/* Trend badge */}
        <div className="absolute top-3 left-3 z-10">
          <Badge className={`${trendColor} border capitalize`}>
            {product.trend}
          </Badge>
        </div>

        {/* Stock status indicator */}
        <div className="absolute top-3 right-3 z-10">
          <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
            product.stock > 20 
              ? 'bg-emerald-500/20 text-emerald-600' 
              : product.stock > 10 
              ? 'bg-amber-500/20 text-amber-600'
              : 'bg-red-500/20 text-red-600'
          }`}>
            {product.stock} left
          </div>
        </div>
      </div>

      {/* Card content section */}
      <div className="p-4 space-y-3">
        {/* Product name and category */}
        <div>
          <p className="text-sm text-muted-foreground font-medium">{product.category}</p>
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </div>

        {/* Price and sales metrics */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div>
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="text-lg font-bold text-foreground">₹{product.price.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Sales</p>
            <p className="text-lg font-bold text-primary">{product.sales}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
