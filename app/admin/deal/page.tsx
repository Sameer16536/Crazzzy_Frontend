'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api-client'
import { Zap, Search, Loader2, ArrowRight, X } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { AdminLayout } from '@/components/admin/layout'

export default function DealOfTheDayAdminPage() {
  const [currentDeals, setCurrentDeals] = useState<any[]>([])
  const [availableProducts, setAvailableProducts] = useState<any[]>([])
  
  const [loadingDeals, setLoadingDeals] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(true)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  const [processingId, setProcessingId] = useState<number | null>(null)

  // State for setting a new deal
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [newPrice, setNewPrice] = useState('')

  const fetchCurrentDeals = async () => {
    try {
      setLoadingDeals(true)
      const res = await api.get<any>('/products?isDealOfTheDay=true&limit=50')
      setCurrentDeals(Array.isArray(res?.data) ? res.data : [])
    } catch (err) {
      toast.error('Failed to load active deals')
    } finally {
      setLoadingDeals(false)
    }
  }

  const fetchProducts = async (search: string, currentPage: number) => {
    try {
      setLoadingProducts(true)
      const params = new URLSearchParams({ limit: '10', page: String(currentPage) })
      if (search) params.set('search', search)
      
      const res = await api.get<any>(`/products?${params.toString()}`)
      const list = Array.isArray(res?.data) ? res.data : []
      // Filter out products that are already deals so they don't show in the select list
      setAvailableProducts(list.filter((p: any) => !p.isDealOfTheDay))
      
      if (res?.meta) {
        setTotalPages(res.meta.totalPages || 1)
      }
    } catch (err) {
      toast.error('Failed to load products')
    } finally {
      setLoadingProducts(false)
    }
  }

  useEffect(() => {
    fetchCurrentDeals()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [searchQuery])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(searchQuery, page)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery, page])

  const handleRemoveDeal = async (product: any) => {
    setProcessingId(product.id)
    try {
      // Revert price if originalPrice exists
      const updateData: any = { isDealOfTheDay: false }
      if (product.originalPrice) {
        updateData.price = product.originalPrice
        updateData.originalPrice = null
      }

      await api.put(`/admin/products/${product.id}`, updateData)
      toast.success('Deal removed successfully.')
      fetchCurrentDeals()
      fetchProducts(searchQuery, page)
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove deal')
    } finally {
      setProcessingId(null)
    }
  }

  const handleSetDeal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct || !newPrice) return

    const parsedPrice = parseFloat(newPrice)
    if (isNaN(parsedPrice) || parsedPrice <= 0 || parsedPrice >= parseFloat(selectedProduct.price)) {
      toast.error('New price must be valid and strictly less than the current price.')
      return
    }

    setProcessingId(selectedProduct.id)
    try {
      await api.put(`/admin/products/${selectedProduct.id}`, {
        isDealOfTheDay: true,
        price: parsedPrice,
        originalPrice: parseFloat(selectedProduct.price)
      })
      toast.success('New Deal of the Day set!')
      setSelectedProduct(null)
      setNewPrice('')
      fetchCurrentDeals()
      fetchProducts(searchQuery, page)
    } catch (err: any) {
      toast.error(err.message || 'Failed to set deal')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-12">
        {/* Header */}
      <div>
        <h1 className="text-2xl font-black uppercase tracking-widest text-foreground flex items-center gap-2">
          <Zap className="text-primary fill-primary" /> Deal of the Day
        </h1>
        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-bold">
          Set exclusive flash pricing. Old price will be crossed out automatically.
        </p>
      </div>

      {loadingDeals ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Current Deals Section */}
          <section className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground border-b border-border pb-2">
              Active Deals
            </h2>
            
            {currentDeals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentDeals.map(deal => (
                  <div key={deal.id} className="flex items-center gap-4 p-4 border border-primary/50 bg-primary/5 rounded-none relative overflow-hidden group">
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[8px] font-black uppercase tracking-widest px-2 py-1 flex items-center gap-1 z-10">
                      <Zap size={8} className="fill-current" /> Active Deal
                    </div>
                    
                    <div className="w-20 h-20 bg-muted relative flex-shrink-0">
                      {deal.imageUrl ? (
                        <Image src={deal.imageUrl} alt={deal.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Zap size={24} className="text-muted-foreground opacity-20" /></div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-sm font-black uppercase tracking-widest line-clamp-1">{deal.title}</h3>
                      <div className="flex items-end gap-2 mt-2">
                        <span className="text-lg font-price font-bold text-primary">₹{deal.price}</span>
                        {deal.originalPrice && (
                          <span className="text-xs font-price font-bold text-muted-foreground line-through mb-1">₹{deal.originalPrice}</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveDeal(deal)}
                      disabled={processingId === deal.id}
                      className="p-3 border border-border hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 transition-all"
                      title="Remove Deal & Revert Price"
                    >
                      {processingId === deal.id ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 border border-dashed border-border bg-muted/10 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">No active deals right now.</p>
              </div>
            )}
          </section>

          {/* Set New Deal Section */}
          <section className="space-y-6">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground border-b border-border pb-2">
              Create New Deal
            </h2>

            {/* If a product is selected to create a deal */}
            {selectedProduct ? (
              <div className="p-6 border border-primary bg-card space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted relative">
                      {selectedProduct.imageUrl && <Image src={selectedProduct.imageUrl} alt="" fill className="object-cover" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest">{selectedProduct.title}</h3>
                      <p className="text-xs font-price font-bold text-muted-foreground mt-1">Current Price: ₹{selectedProduct.price}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedProduct(null)} className="text-muted-foreground hover:text-foreground">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSetDeal} className="flex flex-col sm:flex-row items-end gap-4">
                  <div className="w-full sm:w-1/2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">New Promotional Price (₹)</label>
                    <input
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      placeholder={`Must be less than ${selectedProduct.price}`}
                      className="w-full bg-background border border-border px-4 py-3 text-sm font-price font-bold focus:outline-none focus:border-primary transition-colors"
                      autoFocus
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={processingId === selectedProduct.id || !newPrice}
                    className="w-full sm:w-auto px-8 py-3 bg-primary text-primary-foreground font-black uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {processingId === selectedProduct.id ? <Loader2 size={16} className="animate-spin" /> : 'Launch Deal'}
                  </button>
                </form>
              </div>
            ) : (
              // Search & Select Product List
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="SEARCH PRODUCTS TO SELECT..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-background border border-border pl-10 pr-4 py-3 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="bg-card border border-border">
                  {loadingProducts ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : availableProducts.length > 0 ? (
                    <div className="divide-y divide-border">
                      {availableProducts.map(product => (
                        <div key={product.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-muted relative flex-shrink-0">
                              {product.imageUrl && <Image src={product.imageUrl} alt="" fill className="object-cover" />}
                            </div>
                            <div>
                              <p className="text-xs font-black uppercase tracking-widest line-clamp-1">{product.title}</p>
                              <p className="text-[10px] font-price font-bold text-muted-foreground">₹{product.price}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedProduct(product)}
                            className="px-4 py-2 text-[10px] font-black uppercase tracking-widest border border-border hover:border-primary hover:text-primary transition-colors flex items-center gap-2"
                          >
                            Select <ArrowRight size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">No available products found.</p>
                    </div>
                  )}
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-border bg-muted/10">
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
              </div>
            )}
          </section>
        </>
      )}
      </div>
    </AdminLayout>
  )
}
