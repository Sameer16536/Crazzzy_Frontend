'use client'

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'

/** 
 * Represents a product category with support for hierarchical structures (Parent-Child).
 */
export type CatalogCategory = {
  id: string
  name: string
  slug: string
  description: string
  image: string
  color: string
  parentId: string | null
}

/**
 * Represents a product in the catalog.
 */
export type CatalogProduct = {
  id: string
  name: string
  categoryId: string
  price: number
  originalPrice?: number
  rating: number
  reviews: number
  imageUrl: string // Added for compatibility
  images: string[]
  description: string
  inStock: boolean
  soldOut?: boolean
  featured?: boolean
  dealOfTheDay?: boolean
  dealEndTime?: string | null
  slug: string
  variants?: {
    id: number
    variantName: string
    additionalPrice: string
    stock: number
  }[]
}

interface CatalogContextType {
  data: {
    categories: CatalogCategory[]
    products: CatalogProduct[]
  } | null
  wishlistIds: Set<string>
  isLoading: boolean
  isSyncing: boolean // Added to track background category switches
  error: string | null
  pagination: {
    page: number
    totalPages: number
    hasMore: boolean
  }
  refresh: (category?: string, limit?: number) => Promise<void>
  loadMore: (category?: string) => Promise<void>
  toggleWishlist: (productId: string) => Promise<void>
  
  // Persistence States
  adminFilters: {
    products: { category: string; search: string; page: number }
    orders: { search: string }
    customers: { search: string }
  }
  setAdminFilter: (area: 'products' | 'orders' | 'customers', filters: any) => void
  
  shopFilters: {
    category: string | null
    search: string
    priceRange: [number, number]
    inStockOnly: boolean
    sortBy: string
  }
  setShopFilter: (filters: Partial<CatalogContextType['shopFilters']>) => void
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined)

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').startsWith('/') 
  ? '/backend-static' 
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api').replace(/\/api$/, '')

/**
 * Helper to resolve backend image paths or Cloudinary URLs.
 */
function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return '/placeholder.jpg'
  
  let finalUrl = url;
  if (!(url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:'))) {
    const base = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE
    const path = url.startsWith('/') ? url : `/${url}`
    finalUrl = `${base}${path}`
  }

  // Optimize Cloudinary URLs on-the-fly (Free tier compatible)
  // This reduces RAM usage and bandwidth by requesting optimized 800px versions
  if (finalUrl.includes('res.cloudinary.com') && finalUrl.includes('/upload/')) {
    return finalUrl.replace('/upload/', '/upload/w_800,q_auto,f_auto/')
  }

  return finalUrl
}

const CATEGORY_DESIGN_DATA: Record<string, { color: string, description: string, imageOverride?: string }> = {
  'tote-bags': { color: '#c084fc', description: 'Aesthetic tote bags for every vibe' },
  'die-cast-cars-and-bikes': { color: '#f97316', description: 'Premium 1:24 scale die-cast models' },
  'perfumes': { color: '#d4af37', description: 'Premium imported fragrances' },
  'wall-posters': { color: '#06b6d4', description: 'High-quality wall art and posters' },
  'anime-figures': { color: '#f43f5e', description: 'Detailed anime and manga collectibles' },
  'hot-wheels': { color: '#ef4444', description: '1:64 scale Hot Wheels collectibles' },
  'keychains': { color: '#10b981', description: 'Unique collectible keychains' },
  'chocolate-and-beverages': { color: '#92400e', description: 'Imported chocolates and exotic drinks' },
  'aesthetic-items': { color: '#8b5cf6', description: 'Curated décor for modern spaces' },
}

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<CatalogContextType['data']>(null)
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, hasMore: false })
  const fetchingRef = useRef(false)

  // Persistent Filter States
  const [adminFilters, setAdminFilters] = useState<CatalogContextType['adminFilters']>({
    products: { category: '', search: '', page: 1 },
    orders: { search: '' },
    customers: { search: '' }
  })

  const [shopFilters, setShopFilters] = useState<CatalogContextType['shopFilters']>({
    category: null,
    search: '',
    priceRange: [0, 5000],
    inStockOnly: false,
    sortBy: 'newest'
  })

  const setAdminFilter = useCallback((area: keyof CatalogContextType['adminFilters'], filters: any) => {
    setAdminFilters(prev => ({
      ...prev,
      [area]: { ...prev[area], ...filters }
    }))
  }, [])

  const setShopFilter = useCallback((filters: Partial<CatalogContextType['shopFilters']>) => {
    setShopFilters(prev => ({ ...prev, ...filters }))
  }, [])

  const pathname = usePathname()
  const lastPathname = useRef(pathname)

  const fetchWishlist = useCallback(async () => {
    try {
      const res = await api.get<any>('/users/wishlist')
      const items = res?.wishlist || res?.data || []
      setWishlistIds(new Set(items.map((p: any) => String(p.id))))
    } catch (e) { /* silent fail for guests */ }
  }, [])

  const toggleWishlist = useCallback(async (productId: string) => {
    try {
      if (!localStorage.getItem('accessToken')) {
        toast.error('Please login to use wishlist')
        return
      }
      await api.post(`/users/wishlist/${productId}`, {})
      setWishlistIds(prev => {
        const next = new Set(prev)
        if (next.has(productId)) next.delete(productId)
        else next.add(productId)
        return next
      })
      toast.success('Wishlist updated')
    } catch (e: any) {
      toast.error(e.message || 'Failed to update wishlist')
    }
  }, [])

  const fetchCatalog = async (categorySlug?: string, page = 1, limit = 50, append = false) => {
    if (fetchingRef.current) return
    fetchingRef.current = true

    try {
      if (page === 1) {
        if (!data) setIsLoading(true)
        else setIsSyncing(true)
      } else {
        setIsSyncing(true)
      }

      // Build query params
      const params = new URLSearchParams({ limit: String(limit), page: String(page) })
      if (categorySlug) params.set('category', categorySlug)

      const [categoriesData, productsData] = await Promise.all([
        page === 1 ? api.get<any>('/categories') : Promise.resolve({ data: data?.categories }),
        api.get<any>(`/products?${params.toString()}`),
      ])

      const rawCategories = categoriesData.data || []
      const categories: CatalogCategory[] = page === 1 ? rawCategories.map((c: any) => {
        const designSlug = c.parentId ? rawCategories.find((pc: any) => pc.id === c.parentId)?.slug : c.slug
        const design = CATEGORY_DESIGN_DATA[designSlug || ''] || {
          color: '#d4af37',
          description: c.description || 'Explore our curated collection'
        }
        return {
          id: String(c.id),
          name: c.name,
          slug: c.slug,
          image: resolveImageUrl(design.imageOverride || c.imageUrl),
          description: design.description,
          color: design.color,
          parentId: c.parentId ? String(c.parentId) : null,
        }
      }) : (data?.categories || [])

      const rawProducts = productsData.data || []
      const products: CatalogProduct[] = rawProducts.map((p: any) => ({
        id: String(p.id),
        name: p.title,
        categoryId: String(p.categoryId || p.category_id || p.category?.id || ''),
        price: parseFloat(p.price),
        originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : undefined,
        rating: parseFloat(p.ratingAvg || 0),
        reviews: p.reviewCount || 0,
        imageUrl: resolveImageUrl(p.imageUrl),
        images: p.images?.length > 0
          ? p.images.map((img: any) => resolveImageUrl(img.imageUrl))
          : [resolveImageUrl(p.imageUrl)],
        description: p.description || '',
        inStock: p.stock > 0,
        soldOut: p.stock === 0,
        featured: p.isFeatured,
        dealOfTheDay: p.isDealOfTheDay,
        dealEndTime: p.dealEndTime ? new Date(p.dealEndTime).toISOString() : null,
        slug: p.slug,
        variants: p.variants,
      }))

      if (append) {
        setData(prev => {
          if (!prev) return { categories, products }
          const existingIds = new Set(prev.products.map(p => p.id))
          const uniqueNew = products.filter(p => !existingIds.has(p.id))
          return { ...prev, products: [...prev.products, ...uniqueNew] }
        })
      } else {
        setData({ categories, products })
      }

      if (productsData.meta) {
        const meta = productsData.meta
        setPagination({
          page: meta.page || page,
          totalPages: meta.totalPages || 1,
          hasMore: (meta.page || page) < (meta.totalPages || 1)
        })
      } else {
        // Fallback if meta is missing
        setPagination(prev => ({ ...prev, hasMore: false }))
      }

      setError(null)
    } catch (e) {
      console.error('Catalog Sync Error:', e)
      setError('Failed to synchronize catalog.')
    } finally {
      setIsLoading(false)
      setIsSyncing(false)
      fetchingRef.current = false
    }
  }

  const loadMore = async (categorySlug?: string) => {
    if (!pagination.hasMore || isSyncing) return
    await fetchCatalog(categorySlug, pagination.page + 1, 50, true)
  }

  const refresh = async (categorySlug?: string, limit = 50) => {
    await fetchCatalog(categorySlug, 1, limit, false)
  }

  useEffect(() => {
    fetchCatalog()
    fetchWishlist()
  }, [fetchWishlist])

  useEffect(() => {
    if (lastPathname.current?.startsWith('/admin') && !pathname?.startsWith('/admin')) {
      fetchCatalog()
    }
    lastPathname.current = pathname
  }, [pathname])

  const value = useMemo(() => ({
    data,
    wishlistIds,
    isLoading,
    isSyncing,
    error,
    pagination,
    refresh,
    loadMore,
    toggleWishlist,
    adminFilters,
    setAdminFilter,
    shopFilters,
    setShopFilter
  }), [data, wishlistIds, isLoading, isSyncing, error, pagination, toggleWishlist, adminFilters, setAdminFilter, shopFilters, setShopFilter])

  return (
    <CatalogContext.Provider value={value}>
      {children}
    </CatalogContext.Provider>
  )
}

/**
 * useCatalog Hook
 * 
 * Provides pre-computed views of the catalog:
 * - rootCategories: Main collections (no parent)
 * - getSubcategories(id): Children of a main collection
 * - byCategory: Products grouped by their category ID for fast lookups
 */
export function useCatalog() {
  const context = useContext(CatalogContext)
  if (context === undefined) {
    throw new Error('useCatalog must be used within a CatalogProvider')
  }

  // Pre-filter root level categories
  const rootCategories = useMemo(() => {
    return context.data?.categories.filter(c => !c.parentId) ?? []
  }, [context.data])

  const getSubcategories = useCallback((parentId: string) => {
    return context.data?.categories.filter(c => c.parentId === parentId) ?? []
  }, [context.data])

  // Optimize product lookups by grouping them by category in a Map
  const byCategory = useMemo(() => {
    const map = new Map<string, CatalogProduct[]>()
    for (const p of context.data?.products ?? []) {
      const arr = map.get(p.categoryId) ?? []
      arr.push(p)
      map.set(p.categoryId, arr)
    }
    return map
  }, [context.data])

  return {
    ...context,
    rootCategories,
    getSubcategories,
    byCategory
  }
}
