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
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalFeatured, setTotalFeatured] = useState(0)

  const [toggling, setToggling] = useState<number | null>(null)

  const fetchProducts = async (search: string, currentPage: number) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ limit: '15', page: String(currentPage) })
      if (search) params.set('search', search)
      
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
    setPage(1)
  }, [searchQuery])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(searchQuery, page)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery, page])

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
          <h1 className="text-2xl font-black uppercase tracking-widest text-foreground flex items-center gap-2">
            <Star className="text-primary fill-primary" /> Featured Products
          </h1>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-bold">
            {totalFeatured} products currently featured across all pages
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="SEARCH PRODUCTS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/30 border border-border pl-10 pr-4 py-2 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-primary transition-colors text-foreground"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : products.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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

              <div className="p-4 flex flex-col justify-between h-[120px]">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-foreground line-clamp-2 leading-tight">
                    {product.title}
                  </h3>
                  <p className="text-[10px] font-price font-bold text-muted-foreground mt-1">
                    ₹{product.price}
                  </p>
                </div>

                <button
                  onClick={() => handleToggleFeatured(product.id, product.isFeatured)}
                  disabled={toggling === product.id}
                  className={`w-full py-2 text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2
                    ${product.isFeatured 
                      ? 'bg-transparent border-primary/50 text-primary hover:bg-primary/10' 
                      : 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                    }`}
                >
                  {toggling === product.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <>
                      <Star size={12} className={product.isFeatured ? 'fill-primary' : ''} />
                      {product.isFeatured ? 'Remove Featured' : 'Mark as Featured'}
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
