'use client'

import { useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { ProductCard } from '@/components/product-card'
import { useCatalog } from '@/lib/catalog/use-catalog'
import { resolveImageUrl } from '@/lib/catalog/catalog-context'
import { api } from '@/lib/api-client'
import { useEffect, useMemo, useState } from 'react'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''
  const { data } = useCatalog()

  const [sortBy, setSortBy] = useState('Relevance')
  const [apiProducts, setApiProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function performSearch() {
      if (!q.trim()) {
        setApiProducts([])
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const params = new URLSearchParams({ search: q.trim(), limit: '100' })
        const res = await api.get<any>(`/products?${params.toString()}`)
        const raw = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
        
        // Map raw API products to CatalogProduct format
        const mapped = raw.map((p: any) => ({
          id: String(p.id),
          name: p.title,
          categoryId: String(p.categoryId || p.category_id || p.category?.id || ''),
          categorySlug: p.category?.slug || undefined,
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
        setApiProducts(mapped)
      } catch (e) {
        console.error('Failed to search', e)
        setApiProducts([])
      } finally {
        setLoading(false)
      }
    }
    performSearch()
  }, [q])

  const matchingProducts = useMemo(() => {
    let results = [...apiProducts]

    // Fallback: if API fails or returns 0, try to search the local cache just in case
    if (results.length === 0 && data?.products) {
      const query = q.toLowerCase()
      results = data.products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description?.toLowerCase().includes(query)
      )
    }

    if (sortBy === 'Price: Low to High') {
      results.sort((a, b) => Number(a.price) - Number(b.price))
    } else if (sortBy === 'Price: High to Low') {
      results.sort((a, b) => Number(b.price) - Number(a.price))
    }

    return results
  }, [apiProducts, data?.products, q, sortBy])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <div className="pt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="text-center mb-16">
          <h1 className="text-3xl font-black uppercase tracking-widest">Search results</h1>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-y border-border py-4 mb-8 gap-4">
          <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <span>Filter:</span>
            <button className="hover:text-foreground transition-colors flex items-center gap-1">
              Availability <span className="text-[8px]">▼</span>
            </button>
            <button className="hover:text-foreground transition-colors flex items-center gap-1">
              Price <span className="text-[8px]">▼</span>
            </button>
          </div>

          <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Sort by:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-foreground font-bold outline-none cursor-pointer border-none"
              >
                <option>Relevance</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
            <span className="text-foreground">{matchingProducts.length} result{matchingProducts.length !== 1 && 's'}</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-32">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Searching Databanks...</p>
          </div>
        ) : matchingProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8 gap-y-6 md:gap-y-12">
            {matchingProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32">
            <p className="text-muted-foreground font-bold uppercase tracking-widest">No results found for "{q}".</p>
          </div>
        )}
      </div>
    </div>
  )
}
