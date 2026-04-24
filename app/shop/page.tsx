/**
 * Shop Page — All Products with Filtering
 *
 * Responsiveness fixes:
 * - Mobile filter drawer now actually shows the filter content (was empty before)
 * - Filter content extracted to <FilterPanel /> shared between desktop sidebar
 *   and the mobile slide-out drawer — no duplication
 * - Product grid: 2-col on mobile, 2-col on md, 3-col on lg
 * - Sort bar wraps cleanly on small screens
 */

'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { ProductCard } from '@/components/product-card'
import { Filter, X } from 'lucide-react'
import { useCatalog } from '@/lib/catalog/use-catalog'
import { motion, AnimatePresence } from 'framer-motion'

/** Props shared between desktop sidebar and mobile drawer */
interface FilterPanelProps {
  categories: Array<{ id: string; name: string }>
  selectedCategory: string | null
  onCategoryChange: (id: string | null) => void
  priceRange: [number, number]
  onPriceChange: (range: [number, number]) => void
}

/**
 * FilterPanel — Shared filter UI used in both desktop sidebar and mobile drawer.
 */
function FilterPanel({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceChange,
}: FilterPanelProps) {
  return (
    <div className="space-y-8">
      {/* Category Filter */}
      <div>
        <h3 className="font-black text-xs text-muted-foreground tracking-[0.2em] uppercase mb-4">
          Categories
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => onCategoryChange(null)}
            className={`block w-full text-left px-3 py-2.5 text-sm rounded-lg transition-colors ${
              selectedCategory === null
                ? 'bg-primary text-primary-foreground font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`block w-full text-left px-3 py-2.5 text-sm rounded-lg transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <h3 className="font-black text-xs text-muted-foreground tracking-[0.2em] uppercase mb-4">
          Price Range
        </h3>
        <div className="space-y-3">
          <input
            type="range"
            min="0"
            max="10000"
            value={priceRange[1]}
            onChange={(e) => onPriceChange([priceRange[0], Number(e.target.value)])}
            className="w-full accent-primary"
            aria-label="Maximum price"
          />
          <div className="flex justify-between text-sm font-mono text-muted-foreground">
            <span>₹{priceRange[0].toLocaleString('en-IN')}</span>
            <span>₹{priceRange[1].toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="font-black text-xs text-muted-foreground tracking-[0.2em] uppercase mb-4">
          Availability
        </h3>
        <label className="flex items-center gap-2.5 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
          <input type="checkbox" defaultChecked className="rounded accent-primary" />
          <span>In Stock Only</span>
        </label>
      </div>
    </div>
  )
}

export default function ShopPage() {
  const { data, isLoading } = useCatalog()
  const products = data?.products ?? []
  const categories = data?.categories ?? []

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
  const [sortBy, setSortBy] = useState('featured')
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  /** Filter products by selected category and price range */
  const filteredProducts = products.filter((product) => {
    const matchCategory = !selectedCategory || product.categoryId === selectedCategory
    const matchPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
    return matchCategory && matchPrice
  })

  /** Sort filtered products */
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low')  return a.price - b.price
    if (sortBy === 'price-high') return b.price - a.price
    return 0
  })

  const filterProps: FilterPanelProps = {
    categories,
    selectedCategory,
    onCategoryChange: setSelectedCategory,
    priceRange,
    onPriceChange: setPriceRange,
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16" />

      {/* Page Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-8 h-px bg-primary" />
          <span className="text-primary text-xs font-mono tracking-[0.25em] uppercase">Browse</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-2">Shop All Products</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Browse our collection of {products.length > 0 ? `${products.length} ` : ''}aesthetic products
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="flex gap-8">

          {/* ── Desktop Sidebar ── */}
          <aside className="hidden md:block w-56 flex-shrink-0">
            <div className="sticky top-24">
              <FilterPanel {...filterProps} />
            </div>
          </aside>

          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0">

            {/* Mobile filter button + sort bar */}
            <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="md:hidden flex items-center gap-2 px-4 py-2 bg-muted rounded-lg text-foreground text-sm font-medium cursor-interactive"
                id="mobile-filter-btn"
              >
                <Filter size={15} />
                Filters
                {selectedCategory && (
                  <span className="w-2 h-2 bg-primary rounded-full" />
                )}
              </button>

              <p className="text-muted-foreground text-sm">
                {isLoading ? 'Loading…' : `${sortedProducts.length} of ${products.length} products`}
              </p>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-interactive ml-auto"
                aria-label="Sort products"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
              </select>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-muted/30 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : sortedProducts.length > 0 ? (
              <motion.div
                className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                {sortedProducts.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.4 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-6">No products match your filters</p>
                <button
                  onClick={() => { setSelectedCategory(null); setPriceRange([0, 10000]) }}
                  className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors cursor-interactive"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Mobile Filter Drawer ── */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              className="fixed right-0 top-0 bottom-0 z-50 w-[280px] sm:w-[320px] bg-background border-l border-border overflow-y-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/30 sticky top-0 bg-background z-10">
                <h2 className="font-black text-foreground">Filters</h2>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-interactive"
                  aria-label="Close filters"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Actual filter content — same component as desktop */}
              <div className="p-5">
                <FilterPanel {...filterProps} />
              </div>

              {/* Apply button */}
              <div className="sticky bottom-0 p-4 border-t border-border/30 bg-background">
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-3 bg-primary text-black font-bold text-sm uppercase tracking-wider rounded-none transition-all cursor-interactive hover:bg-primary/90 active:scale-95"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
