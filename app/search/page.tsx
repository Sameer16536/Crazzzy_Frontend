'use client'

import { useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { ProductCard } from '@/components/product-card'
import { useCatalog } from '@/lib/catalog/use-catalog'
import { useMemo, useState } from 'react'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''
  const { data } = useCatalog()

  const [sortBy, setSortBy] = useState('Relevance')

  const matchingProducts = useMemo(() => {
    if (!data?.products) return []
    const query = q.toLowerCase()
    
    let results = data.products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.description?.toLowerCase().includes(query)
    )

    if (sortBy === 'Price: Low to High') {
      results.sort((a, b) => Number(a.price) - Number(b.price))
    } else if (sortBy === 'Price: High to Low') {
      results.sort((a, b) => Number(b.price) - Number(a.price))
    }

    return results
  }, [data?.products, q, sortBy])

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

        {matchingProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 gap-y-12">
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
