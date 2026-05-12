'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api-client'
import { motion } from 'framer-motion'
import { Star, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { AdminLayout } from '@/components/admin/layout'

export default function FeaturedProductsAdminPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalFeatured, setTotalFeatured] = useState(0)

  const [toggling, setToggling] = useState<number | null>(null)

  const fetchCategories = async () => {
    try {
      const res = await api.get<any>('/categories')
      setCategories(Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []))
    } catch (err) {
      console.error('Failed to fetch categories')
    }
  }

  const fetchProducts = async (search: string, cat: string, currentPage: number) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ limit: '20', page: String(currentPage) })
      if (search) params.set('search', search)
      if (cat) params.set('category', cat)
      
      const res = await api.get<any>(`/products?${params.toString()}`)
      setProducts(Array.isArray(res?.data) ? res.data : [])
      
      if (res?.meta) {
        setTotalPages(res.meta.totalPages || 1)
      }
      
      // Also fetch total featured count independently
      const featuredRes = await api.get<any>('/products?isFeatured=true&limit=1')
      if (featuredRes?.meta) setTotalFeatured(featuredRes.meta.total || 0)
      
    } catch (err) {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedCategory])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(searchQuery, selectedCategory, page)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery, selectedCategory, page])

  const handleToggleFeatured = async (id: number, currentStatus: boolean) => {
    setToggling(id)
    try {
      await api.put(`/admin/products/${id}`, { isFeatured: !currentStatus })
      toast.success(`Product ${!currentStatus ? 'added to' : 'removed from'} featured list.`)
      
      // Optimistic update
      setProducts(prev => prev.map(p => p.id === id ? { ...p, isFeatured: !currentStatus } : p))
      // Update featured count optimistically
      setTotalFeatured(prev => !currentStatus ? prev + 1 : prev - 1)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update product')
    } finally {
      setToggling(null)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-lg sm:text-2xl font-black uppercase tracking-widest text-foreground flex items-center gap-2">
            <Star className="text-primary fill-primary w-5 h-5 sm:w-6 sm:h-6" /> Featured Products
          </h1>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-bold">
            {totalFeatured} products currently featured across all pages
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-48 bg-muted/30 border border-border px-4 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary cursor-pointer text-foreground appearance-none rounded-sm"
          >
            <option value="">ALL SECTORS</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name.toUpperCase()}
              </option>
            ))}
          </select>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="SEARCH PRODUCTS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-muted/30 border border-border pl-10 pr-4 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-colors text-foreground rounded-sm"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : products.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-6">
            {products.map(product => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative border ${product.isFeatured ? 'border-primary shadow-[0_0_15px_rgba(212,175,55,0.15)]' : 'border-border'} bg-card overflow-hidden group`}
            >
              <div className="aspect-square bg-muted relative overflow-hidden">
                {product.imageUrl ? (
                  <Image 
                    src={product.imageUrl} 
                    alt={product.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                    <Star size={48} />
                  </div>
                )}
                
                {/* Status Badge */}
                {product.isFeatured && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[8px] font-black uppercase tracking-widest px-2 py-1 flex items-center gap-1">
                    <Star size={8} className="fill-current" /> Featured
                  </div>
                )}
              </div>

              <div className="p-3 sm:p-4 flex flex-col justify-between h-[110px] sm:h-[130px]">
                <div className="min-w-0">
                  <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-foreground line-clamp-1 sm:line-clamp-2 leading-tight">
                    {product.title}
                  </h3>
                  <p className="text-[9px] sm:text-[10px] font-price font-bold text-muted-foreground mt-1">
                    ₹{product.price}
                  </p>
                </div>

                <button
                  onClick={() => handleToggleFeatured(product.id, product.isFeatured)}
                  disabled={toggling === product.id}
                  className={`w-full py-2 text-[8px] sm:text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-1 sm:gap-2
                    ${product.isFeatured 
                      ? 'bg-transparent border-primary/50 text-primary hover:bg-primary/10' 
                      : 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                    }`}
                >
                  {toggling === product.id ? (
                    <Loader2 size={10} className="animate-spin" />
                  ) : (
                    <>
                      <Star size={10} className={product.isFeatured ? 'fill-primary' : ''} />
                      <span className="truncate">{product.isFeatured ? 'Remove' : 'Feature'}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border border-border bg-card">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              ← Prev
            </button>
            <span className="text-[10px] font-black text-muted-foreground">PAGE {page} OF {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
        </div>
      ) : (
        <div className="p-12 text-center border border-dashed border-border bg-card">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">No products found matching "{searchQuery}".</p>
        </div>
      )}
      </div>
    </AdminLayout>
  )
}
