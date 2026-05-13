'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { ProductCard } from '@/components/product-card'
import { Filter, X, Search, ChevronDown, SlidersHorizontal, ChevronRight } from 'lucide-react'
import { useCatalog, CatalogCategory } from '@/lib/catalog/catalog-context'
import { motion, AnimatePresence } from 'framer-motion'
import { useCustomFilters } from '@/hooks/use-custom-filters'

interface FilterPanelProps {
  rootCategories: CatalogCategory[]
  getSubcategories: (id: string) => CatalogCategory[]
  selectedCategoryId: string | null
  onCategoryChange: (id: string | null) => void
  priceRange: [number, number]
  onPriceChange: (range: [number, number]) => void
  inStockOnly: boolean
  onInStockChange: (val: boolean) => void
  currentSearchQuery: string
  onSearchChange: (search: string) => void
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
  currentSearchQuery,
  onSearchChange,
}: FilterPanelProps) {
  // Local state to track which categories are expanded
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({})
  const { getFilters, mounted } = useCustomFilters()

  // Auto-expand if the selected category is within this root
  useEffect(() => {
    if (selectedCategoryId) {
      const rootToExpand = rootCategories.find(root => {
        if (root.slug === selectedCategoryId) return true
        const subs = getSubcategories(root.id)
        return subs.some(s => s.slug === selectedCategoryId)
      })
      if (rootToExpand) {
        setExpandedCats(prev => ({ ...prev, [rootToExpand.id]: true }))
      }
    }
  }, [selectedCategoryId, rootCategories, getSubcategories])

  const toggleExpand = (e: React.MouseEvent, id: string) => {
    e.stopPropagation() // Prevent category selection when just toggling
    setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }))
  }

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
            className={`block w-full text-left px-3 py-3 text-xs font-bold uppercase tracking-widest transition-all ${selectedCategoryId === null
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
            const isOpen = expandedCats[root.id] || false

            return (
              <div key={root.id} className="space-y-1">
                <div
                  className={`flex items-center justify-between w-full group cursor-pointer px-3 py-3 ${isSelected || hasSelectedSub ? 'text-primary' : 'text-muted-foreground'}`}
                  onClick={() => onCategoryChange(root.slug)}
                >
                  <span className="text-xs font-bold uppercase tracking-widest transition-all group-hover:text-foreground">
                    {root.name}
                  </span>
                  {subs.length > 0 && (
                    <button
                      onClick={(e) => toggleExpand(e, root.id)}
                      className="p-1 hover:bg-muted/50 rounded transition-colors"
                    >
                      <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>

                {/* Sub-categories (Collapsible) */}
                <AnimatePresence>
                  {isOpen && subs.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden pl-4 border-l border-border ml-3 space-y-1"
                    >
                      {subs.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => onCategoryChange(sub.slug)}
                          className={`block w-full text-left px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${selectedCategoryId === sub.slug
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

                {/* Custom Filter Chips (Admin defined via localStorage) */}
                {mounted && selectedCategoryId === root.slug && getFilters(root.slug).length > 0 && (
                  <div className="mt-3 pl-2 pr-2">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50 mb-2 font-bold">Quick Filters</p>
                    <div className="flex flex-wrap gap-1.5">
                      {getFilters(root.slug).map(tag => {
                        const isActive = currentSearchQuery.toLowerCase() === tag.toLowerCase()
                        return (
                          <button
                            key={tag}
                            onClick={() => onSearchChange(isActive ? '' : tag)}
                            className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-widest transition-colors ${
                              isActive 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary'
                            }`}
                          >
                            {tag}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
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
  const { data, isLoading, isSyncing, refresh, loadMore, pagination, rootCategories, getSubcategories, shopFilters, setShopFilter } = useCatalog()
  const searchParams = useSearchParams()
  const router = useRouter()

  const {
    category: selectedCategorySlug,
    search: searchQuery,
    priceRange,
    inStockOnly,
    sortBy
  } = shopFilters

  const setSelectedCategorySlug = (category: string | null) => setShopFilter({ category })
  const setSearchQuery = (search: string) => setShopFilter({ search })
  const setPriceRange = (range: [number, number]) => setShopFilter({ priceRange: range })
  const setSortBy = (sort: string) => setShopFilter({ sortBy: sort })
  const setInStockOnly = (val: boolean) => setShopFilter({ inStockOnly: val })

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // ── Local shop products state ─────────────────────────────────────────────
  // Fetches products PER CATEGORY from the API (same as admin panel).
  // Never poisons the global catalog cache.
  const [shopProducts, setShopProducts] = useState<any[]>([])
  const [shopLoading, setShopLoading] = useState(false)

  // ── In-memory category cache (useRef = survives re-renders, not re-mounts) ─
  // Key: category slug or '__all__'. Cleared on full page refresh automatically.
  const shopCache = useRef<Map<string, any[]>>(new Map())

  // Map raw API product to CatalogProduct shape
  const mapProduct = (p: any) => ({
    id: String(p.id),
    name: p.title,
    categoryId: String(p.categoryId || p.category_id || p.category?.id || ''),
    categorySlug: p.category?.slug || undefined,
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
    dealOfTheDay: p.isDealOfTheDay,
    slug: p.slug,
    variants: p.variants,
  })

  // Infinite Scroll Observer
  const observer = useRef<IntersectionObserver | null>(null)
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading || isSyncing || shopLoading) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && pagination.hasMore) {
        loadMore(selectedCategorySlug || undefined)
      }
    }, { rootMargin: '400px' })
    if (node) observer.current.observe(node)
  }, [isLoading, isSyncing, shopLoading, pagination.hasMore, loadMore, selectedCategorySlug])

  // Initialize from URL — fetch server-side per category (mirrors admin panel)
  useEffect(() => {
    const cat = searchParams.get('category')
    const search = searchParams.get('search')
    if (cat) {
      setSelectedCategorySlug(cat)
    } else {
      setSelectedCategorySlug(null)
    }
    if (search) setSearchQuery(search)

    const cacheKey = cat || '__all__'

    // ── Cache hit: serve instantly from memory ──────────────────────────────
    if (shopCache.current.has(cacheKey)) {
      setShopProducts(shopCache.current.get(cacheKey)!)
      return
    }

    // ── Cache miss: fetch from backend then store ───────────────────────────
    const fetchShopProducts = async () => {
      setShopLoading(true)
      try {
        const params = new URLSearchParams({ limit: '200', page: '1' })
        if (cat) params.set('category', cat)
        const res = await import('@/lib/api-client').then(m =>
          m.api.get<any>(`/products?${params.toString()}`)
        )
        const raw = res?.data || []
        const mapped = raw.map(mapProduct)
        shopCache.current.set(cacheKey, mapped)  // store in cache
        setShopProducts(mapped)
      } catch (e) {
        console.error('Shop fetch error', e)
        setShopProducts([])
      } finally {
        setShopLoading(false)
      }
    }

    fetchShopProducts()
  }, [searchParams])

  // Use local shopProducts (server-filtered) instead of global data.products
  const products = shopProducts.length > 0 ? shopProducts : (data?.products ?? [])
  const allCategories = data?.categories ?? []

  // Update URL when category changes
  const handleCategoryChange = (slug: string | null) => {
    setSelectedCategorySlug(slug)
    const params = new URLSearchParams(searchParams.toString())
    if (slug) params.set('category', slug)
    else params.delete('category')
    router.push(`/shop?${params.toString()}`, { scroll: false })
    // Refresh will be triggered by the useEffect observing searchParams
  }

  // Memoized filter logic: robust multi-strategy category matching
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      let matchesCategory = true
      if (selectedCategorySlug) {
        const category = allCategories.find(c => c.slug === selectedCategorySlug)
        if (category) {
          const isParent = !category.parentId
          if (isParent) {
            // Parent selected: show products from parent AND all its children
            // Match by categoryId (parent or child ID) OR by categorySlug (parent slug)
            const childrenIds = getSubcategories(category.id).map(s => s.id)
            const childrenSlugs = getSubcategories(category.id).map(s => s.slug)
            matchesCategory =
              p.categoryId === category.id ||
              childrenIds.includes(p.categoryId) ||
              p.categorySlug === category.slug ||
              (p.categorySlug !== undefined && childrenSlugs.includes(p.categorySlug))
          } else {
            // Subcategory selected: match by ID OR by slug (backend may return either)
            // This handles cases where products are tagged with parent ID but correct slug
            matchesCategory =
              p.categoryId === category.id ||
              p.categorySlug === selectedCategorySlug
          }
        } else {
          // Category not found in local data — fall back to slug match on product
          matchesCategory = p.categorySlug === selectedCategorySlug
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
    currentSearchQuery: searchQuery,
    onSearchChange: setSearchQuery,
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-18 lg:h-[calc(100vh-64px)] lg:overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-12 h-full">

          {/* Desktop Sidebar */}
          <aside
            data-lenis-prevent
            className="hidden lg:block w-64 flex-shrink-0 h-full pb-16 overflow-y-auto scrollbar-hide"
          >
            <div className="py-4">
              <FilterPanel {...filterProps} />
            </div>
          </aside>

          {/* Main List */}
          <div className="flex-1 flex flex-col h-full min-w-0">
            {/* Toolbar - Fixed at top of this column on PC */}
            <div className="flex-shrink-0 bg-background/80 backdrop-blur-md z-30">
              <div className="flex flex-col gap-6 border-b border-white/5 pb-8 pt-4">
                {/* Row 1: Search */}
                <div className="relative group w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="Search Universe..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-muted/10 border border-border/50 px-12 py-4 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/30 rounded-lg"
                  />
                </div>

                {/* Row 2: Stats, Sort, Mobile Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                    <button
                      onClick={() => setMobileFilterOpen(true)}
                      className="lg:hidden flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20 px-3 py-2 rounded-lg"
                    >
                      <SlidersHorizontal size={14} />
                      Filters
                    </button>

                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] whitespace-nowrap">
                      {shopLoading || isLoading || isSyncing ? 'Scanning...' : `${sortedProducts.length} Items`}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="flex-1 sm:flex-none bg-muted border border-border px-3 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary/50 cursor-pointer min-w-[140px]"
                    >
                      <option value="newest">Newest</option>
                      <option value="price_asc">Price: Low</option>
                      <option value="price_desc">Price: High</option>
                      <option value="popularity">Popular</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid Area - Independently scrollable on PC */}
            <div
              data-lenis-prevent
              className="flex-1 overflow-y-auto scrollbar-hide lg:pr-4 pb-32"
            >
              <div className="pt-8">
                {/* Grid */}
                {shopLoading || isLoading || (isSyncing && sortedProducts.length === 0) ? (
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
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3 }}
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

                {/* Infinite Scroll Sentinel */}
                {sortedProducts.length > 0 && pagination.hasMore && (
                  <div
                    ref={lastElementRef}
                    className="py-12 flex flex-col items-center justify-center gap-4 border-t border-white/5 mt-12"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-primary rounded-full animate-ping" />
                      <div className="w-1 h-1 bg-primary rounded-full animate-ping [animation-delay:0.2s]" />
                      <div className="w-1 h-1 bg-primary rounded-full animate-ping [animation-delay:0.4s]" />
                    </div>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.4em] animate-pulse">
                      Syncing more droplets...
                    </p>
                  </div>
                )}

                {/* End of results indicator */}
                {sortedProducts.length > 0 && !pagination.hasMore && (
                  <div className="py-12 text-center border-t border-white/5 mt-12">
                    <p className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-[0.4em]">
                      — Universe Boundary Reached —
                    </p>
                  </div>
                )}
              </div>
            </div>
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
