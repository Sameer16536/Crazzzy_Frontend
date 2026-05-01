'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { ProductCard } from '@/components/product-card'
import { Filter, X, Search, ChevronDown, SlidersHorizontal, ChevronRight } from 'lucide-react'
import { useCatalog } from '@/lib/catalog/use-catalog'
import { motion, AnimatePresence } from 'framer-motion'
import { CatalogCategory } from '@/lib/catalog/use-catalog'

interface FilterPanelProps {
  rootCategories: CatalogCategory[]
  getSubcategories: (id: string) => CatalogCategory[]
  selectedCategoryId: string | null
  onCategoryChange: (id: string | null) => void
  priceRange: [number, number]
  onPriceChange: (range: [number, number]) => void
  inStockOnly: boolean
  onInStockChange: (val: boolean) => void
}

/**
 * Filter Sidebar for the Shop.
 * Organized by hierarchy to separate Main Collections from Sub-categories.
 */
function FilterPanel({
  rootCategories,
  getSubcategories,
  selectedCategoryId,
  onCategoryChange,
  priceRange,
  onPriceChange,
  inStockOnly,
  onInStockChange,
}: FilterPanelProps) {
  return (
    <div className="space-y-10">
      {/* Category Filter */}
      <div className="space-y-6">
        <h3 className="font-black text-[10px] text-muted-foreground tracking-[0.3em] uppercase border-b border-border pb-3">
          Collections
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => onCategoryChange(null)}
            className={`block w-full text-left px-3 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
              selectedCategoryId === null
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Droplets
          </button>
          
          {rootCategories.map((root) => {
            const subs = getSubcategories(root.id)
            const isSelected = selectedCategoryId === root.slug
            const hasSelectedSub = subs.some(s => s.slug === selectedCategoryId)
            const isOpen = isSelected || hasSelectedSub

            return (
              <div key={root.id} className="space-y-1">
                <button
                  onClick={() => onCategoryChange(root.slug)}
                  className={`flex items-center justify-between w-full text-left px-3 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
                    isSelected || hasSelectedSub
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {root.name}
                  {subs.length > 0 && (
                    <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  )}
                </button>
                
                {/* Sub-categories (Collapsible) */}
                <AnimatePresence>
                  {isOpen && subs.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pl-4 border-l border-border ml-3 space-y-1"
                    >
                      {subs.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => onCategoryChange(sub.slug)}
                          className={`block w-full text-left px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                            selectedCategoryId === sub.slug
                              ? 'text-primary'
                              : 'text-muted-foreground/60 hover:text-foreground'
                          }`}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>

      {/* Price Filter */}
      <div className="space-y-6">
        <h3 className="font-black text-[10px] text-muted-foreground tracking-[0.3em] uppercase border-b border-border pb-3">
          Price Range
        </h3>
        <div className="space-y-4 px-3">
          <input
            type="range"
            min="0"
            max="5000"
            step="50"
            value={priceRange[1]}
            onChange={(e) => onPriceChange([priceRange[0], Number(e.target.value)])}
            className="w-full accent-primary h-1 bg-muted rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono font-bold text-muted-foreground">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Availability */}
      <div className="space-y-6">
        <h3 className="font-black text-[10px] text-muted-foreground tracking-[0.3em] uppercase border-b border-border pb-3">
          Status
        </h3>
        <label className="flex items-center gap-3 px-3 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={inStockOnly}
            onChange={(e) => onInStockChange(e.target.checked)}
            className="w-4 h-4 rounded-none border-border bg-muted accent-primary" 
          />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">In Stock Only</span>
        </label>
      </div>
    </div>
  )
}

export default function ShopPage() {
  const { data, isLoading, isSyncing, refresh, rootCategories, getSubcategories } = useCatalog()
  const searchParams = useSearchParams()
  const router = useRouter()

  const products = data?.products ?? []
  const allCategories = data?.categories ?? []

  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000])
  const [sortBy, setSortBy] = useState('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // Initialize from URL
  useEffect(() => {
    const cat = searchParams.get('category')
    const search = searchParams.get('search')
    if (cat) {
      setSelectedCategorySlug(cat)
      refresh(cat) // Fetch specific category data on load
    } else {
      setSelectedCategorySlug(null)
      refresh() // Fetch all
    }
    if (search) setSearchQuery(search)
  }, [searchParams])

  // Update URL when category changes
  const handleCategoryChange = (slug: string | null) => {
    setSelectedCategorySlug(slug)
    const params = new URLSearchParams(searchParams.toString())
    if (slug) params.set('category', slug)
    else params.delete('category')
    router.push(`/shop?${params.toString()}`, { scroll: false })
    // Refresh will be triggered by the useEffect observing searchParams
  }

  // Memoized filter logic: includes sub-category inheritance (if parent is selected, show all children)
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      let matchesCategory = true
      if (selectedCategorySlug) {
        const category = allCategories.find(c => c.slug === selectedCategorySlug)
        if (category) {
          const isParent = !category.parentId
          if (isParent) {
            // If parent selected, show products from parent AND all its children
            const childrenIds = getSubcategories(category.id).map(s => s.id)
            matchesCategory = p.categoryId === category.id || childrenIds.includes(p.categoryId)
          } else {
            // If sub-category selected, show only that
            matchesCategory = p.categoryId === category.id
          }
        }
      }

      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1]
      const category = allCategories.find(c => c.id === p.categoryId)
      const matchesSearch = !searchQuery || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category?.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStock = !inStockOnly || p.inStock
      
      return matchesCategory && matchesPrice && matchesSearch && matchesStock
    })
  }, [products, selectedCategorySlug, priceRange, searchQuery, inStockOnly, allCategories, getSubcategories])

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price
      if (sortBy === 'price_desc') return b.price - a.price
      if (sortBy === 'popularity') return (b.reviews || 0) - (a.reviews || 0)
      if (sortBy === 'newest') return Number(b.id) - Number(a.id)
      return 0
    })
  }, [filteredProducts, sortBy])

  const filterProps: FilterPanelProps = {
    rootCategories,
    getSubcategories,
    selectedCategoryId: selectedCategorySlug,
    onCategoryChange: handleCategoryChange,
    priceRange,
    onPriceChange: setPriceRange,
    inStockOnly,
    onInStockChange: setInStockOnly,
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navbar />
      
      {/* Header Section */}
      <section className="pt-32 pb-16 border-b border-border relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-px bg-primary" />
                <span className="text-primary text-[10px] font-mono tracking-[0.3em] uppercase">Universe</span>
              </div>
              <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter leading-none text-foreground">
                THE SHOP
              </h1>
              <p className="text-muted-foreground text-sm max-w-md font-light italic">
                {selectedCategorySlug 
                  ? `Exploring ${allCategories.find(c => c.slug === selectedCategorySlug)?.name}`
                  : `Discover ${products.length} exclusive droplets curated for your premium aesthetic.`
                }
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="relative group w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search Universe..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-muted/30 border border-border px-12 py-4 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/30"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
               <FilterPanel {...filterProps} />
            </div>
          </aside>

          {/* Main List */}
          <div className="flex-1 space-y-12">
            {/* Toolbar */}
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
              <button 
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary"
              >
                <SlidersHorizontal size={14} />
                Filters
              </button>

              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                {isLoading || isSyncing ? 'Scanning...' : `${sortedProducts.length} Results Found`}
              </p>

              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sort By:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-muted border border-border px-4 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary/50 cursor-pointer"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popularity">Most Popular</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {isLoading || isSyncing ? (
               <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-8">
                 {[...Array(6)].map((_, i) => (
                   <div key={i} className="aspect-square bg-muted animate-pulse border border-border" />
                 ))}
               </div>
            ) : sortedProducts.length > 0 ? (
              <motion.div 
                className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <AnimatePresence mode="popLayout">
                  {sortedProducts.map((p, i) => (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <ProductCard product={p} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="py-32 text-center border border-dashed border-border">
                <p className="text-muted-foreground text-xs uppercase tracking-[0.3em] mb-6 font-light">No artifacts match your search parameters.</p>
                <button 
                  onClick={() => { setSelectedCategorySlug(null); setPriceRange([0, 5000]); setSearchQuery(''); setInStockOnly(false); }}
                  className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline"
                >
                  Reset Universe
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
              className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 z-[70] w-full max-w-xs bg-background p-8 shadow-2xl border-l border-border overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground">Filters</h2>
                <button onClick={() => setMobileFilterOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X size={24} />
                </button>
              </div>
              <FilterPanel {...filterProps} />
              <button 
                onClick={() => setMobileFilterOpen(false)}
                className="w-full bg-primary text-black font-black py-4 uppercase tracking-widest text-xs mt-12"
              >
                Apply Filters
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
