'use client'

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { api } from '@/lib/api-client'

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
  images: string[]
  description: string
  inStock: boolean
  soldOut?: boolean
  featured?: boolean
  dealOfTheDay?: boolean
}

interface CatalogContextType {
  data: {
    categories: CatalogCategory[]
    products: CatalogProduct[]
  } | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined)

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api').replace(/\/api$/, '')

/**
 * Helper to resolve relative backend image paths or Cloudinary URLs to absolute strings.
 */
/**
 * Helper to resolve backend image paths or Cloudinary URLs.
 * Handles:
 * 1. Absolute URLs (Cloudinary, external)
 * 2. Relative backend paths (prefixed with API_BASE)
 * 3. Base64/Data URLs
 * 4. Fallback to placeholder
 */
function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return '/placeholder.jpg'
  
  // If it's already an absolute URL (like Cloudinary), return it
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  
  // Otherwise, treat as a relative path from our backend
  const base = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE
  const path = url.startsWith('/') ? url : `/${url}`
  return `${base}${path}`
}

/**
 * Aesthetic metadata for Root Categories.
 * This is used to provide the premium "Cockpit" branding (colors, descriptors)
 * even when fetching dynamic data from the backend.
 * 
 * YOU CAN PASTE YOUR CLOUDINARY URLS INTO 'imageOverride' FOR EACH CATEGORY.
 */
const CATEGORY_DESIGN_DATA: Record<string, { color: string, description: string, imageOverride?: string }> = {
  'tote-bags': { color: '#c084fc', description: 'Aesthetic tote bags for every vibe' },
  'die-cast-cars-and-bikes': { color: '#f97316', description: 'Premium 1:24 scale die-cast models' },
  'perfumes': { color: '#d4af37', description: 'Premium imported fragrances' },
  'wall-posters': { color: '#06b6d4', description: 'High-quality wall art and posters' },
  'anime-figurines': { color: '#f43f5e', description: 'Detailed anime and manga collectibles' },
  'hotwheels': { color: '#ef4444', description: '1:64 scale Hot Wheels collectibles' },
  'keychains': { color: '#10b981', description: 'Unique collectible keychains' },
  'chocolate-and-beverages': { color: '#92400e', description: 'Imported chocolates and exotic drinks' },
  'aesthetic-items': { color: '#8b5cf6', description: 'Curated décor for modern spaces' },
}

/**
 * Global Catalog Provider
 * 
 * DESIGN RATIONALE:
 * To solve the "taking too much time to load routes" issue, we fetch the entire
 * product and category tree once at the root of the application. This allows:
 * 1. Instant navigation between categories (no spinning loaders).
 * 2. Smooth "Cockpit" sidebar transitions.
 * 3. Global access to product counts and hierarchy.
 */
export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<CatalogContextType['data']>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCatalog = async () => {
    try {
      setIsLoading(true)
      
      // Fetch both categories and initial products in parallel
      const [categoriesData, productsData] = await Promise.all([
        api.get<any>('/categories'),
        api.get<any>('/products?limit=250'), // Increased limit to minimize re-fetching
      ])

      const rawCategories = categoriesData.data || []
      
      // Transform backend categories into our CatalogCategory format
      const categories: CatalogCategory[] = rawCategories.map((c: any) => {
        // Find design tokens (color/desc) based on the root ancestor's slug
        // This ensures sub-categories (like 'Anime Posters') share the 'Wall Posters' branding.
        const designSlug = c.parentId ? rawCategories.find((pc: any) => pc.id === c.parentId)?.slug : c.slug
        const design = CATEGORY_DESIGN_DATA[designSlug || ''] || { 
          color: '#d4af37', 
          description: c.description || 'Explore our curated collection' 
        }

        return {
          id: String(c.id),
          name: c.name,
          slug: c.slug,
          // Use imageOverride if provided, otherwise use backend imageUrl
          image: resolveImageUrl(design.imageOverride || c.imageUrl), 
          description: design.description,
          color: design.color,
          parentId: c.parentId ? String(c.parentId) : null,
        }
      })

      // Transform backend products
      const rawProducts = productsData.data || []
      const products: CatalogProduct[] = rawProducts.map((p: any) => ({
        id: String(p.id),
        name: p.title, // Backend uses 'title'
        categoryId: String(p.categoryId),
        price: parseFloat(p.price),
        originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : undefined,
        rating: parseFloat(p.ratingAvg || 0),
        reviews: p.reviewCount || 0,
        // Support multiple images with fallback to main imageUrl
        images: p.images?.length > 0 
          ? p.images.map((img: any) => resolveImageUrl(img.imageUrl))
          : [resolveImageUrl(p.imageUrl)],
        description: p.description || '',
        inStock: p.stock > 0,
        soldOut: p.stock === 0,
        featured: p.isFeatured,
        dealOfTheDay: p.isDealOfTheDay,
      }))

      setData({ categories, products })
      setError(null)
    } catch (e) {
      console.error('Catalog Sync Error:', e)
      setError('Failed to synchronize catalog with Crazzzy backend.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCatalog()
  }, [])

  const value = useMemo(() => ({
    data,
    isLoading,
    error,
    refresh: fetchCatalog
  }), [data, isLoading, error])

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
