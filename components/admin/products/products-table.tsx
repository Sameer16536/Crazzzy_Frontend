'use client'

import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api-client'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Search, Plus, Edit2, Trash2, MoreHorizontal, Eye, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmModal } from '@/components/admin/confirm-modal'
import { useCatalog } from '@/lib/catalog/use-catalog'

interface Category {
  id: string
  name: string
  slug: string
}

export function ProductsTable() {
  const { adminFilters, setAdminFilter } = useCatalog()
  const { category: selectedCategory, search: searchQuery, page: currentPage } = adminFilters.products

  const setSelectedCategory = (category: string) => setAdminFilter('products', { category })
  const setSearchQuery = (search: string) => setAdminFilter('products', { search })
  const setCurrentPage = (page: number | ((p: number) => number)) => {
    const next = typeof page === 'function' ? page(currentPage) : page
    setAdminFilter('products', { page: next })
  }

  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  
  // Pagination metadata
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [isDecommissioning, setIsDecommissioning] = useState(false)
  const limit = 10

  // Fetch real categories from the API
  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get<any>('/categories')
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
      setCategories(list)
    } catch (error) {
      console.error('Failed to fetch categories', error)
    }
  }, [])

  // Fetch products with optional category + search filter + pagination
  const fetchProducts = useCallback(async (category?: string, search?: string, page: number = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ 
        page: String(page), 
        limit: String(limit) 
      })
      if (category) params.set('category', category)
      if (search) params.set('search', search)
      
      const res = await api.get<any>(`/products?${params.toString()}`)
      
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
      setProducts(list)
      
      // Update pagination metadata
      if (res?.meta) {
        setTotalPages(res.meta.totalPages || 1)
        setTotalProducts(res.meta.total || 0)
        setCurrentPage(res.meta.page || 1)
      }
    } catch (error) {
      console.error('Failed to fetch products', error)
      toast.error('Failed to sync with product registry')
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Reset to page 1 whenever search or category changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategory])

  // Re-fetch whenever filters or page changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(selectedCategory || undefined, searchQuery || undefined, currentPage)
    }, searchQuery ? 400 : 0)
    return () => clearTimeout(timer)
  }, [selectedCategory, searchQuery, currentPage, fetchProducts])

  const handleDelete = (id: number) => {
    setConfirmDeleteId(id)
  }

  const confirmDelete = async () => {
    if (!confirmDeleteId) return
    setIsDecommissioning(true)
    try {
      const res = await api.delete<any>(`/admin/products/${confirmDeleteId}`)
      toast.success(res.message || 'Artifact decommissioned')
      setConfirmDeleteId(null)
      fetchProducts(selectedCategory || undefined, searchQuery || undefined, currentPage)
    } catch (error: any) {
      toast.error(error.message || 'Decommission failed')
    } finally {
      setIsDecommissioning(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Table Toolbar */}
      <div className="flex flex-col xl:flex-row justify-between gap-6">
        {/* Search - Removed max-width to use available space */}
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary transition-colors" size={18} />
          <input
            type="text"
            placeholder="SEARCH REGISTRY BY NAME, SKU, OR CATEGORY..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border px-12 py-5 text-[11px] font-black uppercase tracking-[0.3em] focus:outline-none focus:border-primary/40 transition-all text-foreground placeholder:text-muted-foreground/20 rounded-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Category Filter */}
          <div className="relative min-w-[220px]">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-background border border-border px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] focus:outline-none focus:border-primary/40 cursor-pointer text-foreground appearance-none rounded-sm"
            >
              <option value="">ALL CATEGORIES</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name.toUpperCase()}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/40">
              <ChevronRight size={14} className="rotate-90" />
            </div>
          </div>

          <Link
            href="/admin/products/new"
            className="px-8 py-5 bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-3 hover:bg-primary/90 transition-all rounded-sm shadow-lg shadow-primary/10 whitespace-nowrap"
          >
            <Plus size={16} />
            Add Product
          </Link>
        </div>
      </div>

      {/* Table Wrapper - Increased padding and width awareness */}
      <div className="bg-muted/10 border border-border rounded-sm overflow-hidden backdrop-blur-sm">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 w-[40%]">Artifact Designation</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 text-center">Supply</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">Value</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 text-right min-w-[120px]">Control</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="animate-spin text-primary" size={32} />
                      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/40">Accessing Data...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-32 text-center">
                    <div className="max-w-xs mx-auto space-y-4">
                      <Package className="mx-auto text-muted-foreground/10" size={48} />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 leading-relaxed">
                        No artifacts identified 
                        {selectedCategory ? ` in sector "${categories.find(c => c.slug === selectedCategory)?.name.toUpperCase()}"` : ''}
                        {searchQuery ? ` matching "${searchQuery.toUpperCase()}"` : ''}.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {products.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2, delay: i * 0.02 }}
                      className="border-b border-border hover:bg-primary/[0.02] transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-6">
                          <div className="relative w-14 h-14 bg-background border border-border overflow-hidden shrink-0 group-hover:border-primary/30 transition-colors rounded-sm">
                            <Image 
                              src={p.imageUrl || '/placeholder.jpg'} 
                              alt={p.title} 
                              fill 
                              className="object-contain p-1 group-hover:scale-110 transition-transform duration-500" 
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black uppercase tracking-tight truncate text-foreground mb-1">{p.title}</p>
                            <p className="text-[9px] text-muted-foreground/60 uppercase tracking-[0.2em] font-bold">
                              ID: #{p.id} <span className="mx-2 text-border">|</span> {p.category?.name?.toUpperCase() || 'UNCATEGORIZED'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${p.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500'}`} />
                          <span className={`text-[10px] font-black uppercase tracking-widest ${p.isActive ? 'text-green-500' : 'text-red-500/60'}`}>
                            {p.isActive ? 'Active' : 'Offline'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <p className={`text-[11px] font-mono font-bold ${p.stock <= 5 ? 'text-red-500' : 'text-foreground/80'}`}>
                          {p.stock.toString().padStart(2, '0')} Units
                        </p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-black font-mono text-foreground tracking-tighter">₹{parseFloat(p.price).toLocaleString('en-IN')}</p>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-3 text-muted-foreground/20 hover:text-primary hover:bg-primary/5 transition-all rounded-sm">
                              <MoreHorizontal size={20} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 bg-popover border-border p-2">
                            <DropdownMenuItem asChild>
                              <Link href={`/product/${p.slug}`} target="_blank" className="flex items-center gap-3 px-4 py-3 cursor-pointer focus:bg-muted rounded-sm">
                                <Eye size={16} className="text-primary/60" />
                                <span className="font-black text-[10px] uppercase tracking-widest">Protocol: View</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/products/edit/${p.id}`} className="flex items-center gap-3 px-4 py-3 cursor-pointer focus:bg-muted rounded-sm">
                                <Edit2 size={16} className="text-primary/60" />
                                <span className="font-black text-[10px] uppercase tracking-widest">Protocol: Edit</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border my-1" />
                            <DropdownMenuItem
                              onClick={() => handleDelete(p.id)}
                              className="flex items-center gap-3 px-4 py-3 cursor-pointer focus:bg-red-500/10 focus:text-red-500 text-red-500/60 rounded-sm"
                            >
                              <Trash2 size={16} />
                              <span className="font-black text-[10px] uppercase tracking-widest">Protocol: Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden divide-y divide-border">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="animate-spin text-primary mx-auto mb-4" size={32} />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/40">Accessing Data...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center px-4">
              <Package className="mx-auto text-muted-foreground/10 mb-4" size={48} />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 leading-relaxed">
                No artifacts identified
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {products.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, delay: i * 0.02 }}
                  className="p-4 space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative w-16 h-16 bg-background border border-border overflow-hidden shrink-0 rounded-sm">
                        <Image 
                          src={p.imageUrl || '/placeholder.jpg'} 
                          alt={p.title} 
                          fill 
                          className="object-contain p-1" 
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-tight truncate text-foreground leading-tight mb-1">{p.title}</p>
                        <p className="text-[9px] text-muted-foreground/60 uppercase tracking-[0.1em] font-bold">
                          ID: #{p.id} • {p.category?.name?.toUpperCase() || 'UNCATEGORIZED'}
                        </p>
                        <p className="text-sm font-black font-mono text-foreground mt-1">₹{parseFloat(p.price).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 text-muted-foreground/30 hover:text-primary transition-colors">
                          <MoreHorizontal size={20} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 bg-popover border-border p-2">
                        <DropdownMenuItem asChild>
                          <Link href={`/product/${p.slug}`} target="_blank" className="flex items-center gap-3 px-4 py-3 rounded-sm">
                            <Eye size={16} className="text-primary/60" />
                            <span className="font-black text-[10px] uppercase tracking-widest">Protocol: View</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/products/edit/${p.id}`} className="flex items-center gap-3 px-4 py-3 rounded-sm">
                            <Edit2 size={16} className="text-primary/60" />
                            <span className="font-black text-[10px] uppercase tracking-widest">Protocol: Edit</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border my-1" />
                        <DropdownMenuItem
                          onClick={() => handleDelete(p.id)}
                          className="flex items-center gap-3 px-4 py-3 text-red-500/60 rounded-sm"
                        >
                          <Trash2 size={16} />
                          <span className="font-black text-[10px] uppercase tracking-widest">Protocol: Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/30">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${p.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500'}`} />
                      <span className={`text-[9px] font-black uppercase tracking-widest ${p.isActive ? 'text-green-500' : 'text-red-500/60'}`}>
                        {p.isActive ? 'Active' : 'Offline'}
                      </span>
                    </div>
                    <p className={`text-[10px] font-mono font-bold ${p.stock <= 5 ? 'text-red-500' : 'text-foreground/60'}`}>
                      {p.stock.toString().padStart(2, '0')} Units In Stock
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Improved Pagination Controls */}
        {!loading && products.length > 0 && (
          <div className="px-8 py-6 border-t border-border bg-muted/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
              Showing <span className="text-foreground">{(currentPage - 1) * limit + 1}</span> to <span className="text-foreground">{Math.min(currentPage * limit, totalProducts)}</span> of <span className="text-foreground">{totalProducts}</span> artifacts
            </p>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-3 border border-border rounded-sm hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              
              <div className="flex items-center gap-1">
                {(() => {
                  const pages = []
                  const maxVisible = 5
                  
                  if (totalPages <= maxVisible) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i)
                  } else {
                    pages.push(1)
                    if (currentPage > 3) pages.push('...')
                    
                    const start = Math.max(2, currentPage - 1)
                    const end = Math.min(totalPages - 1, currentPage + 1)
                    
                    if (currentPage <= 3) {
                      for (let i = 2; i <= 4; i++) pages.push(i)
                    } else if (currentPage >= totalPages - 2) {
                      for (let i = totalPages - 3; i <= totalPages - 1; i++) pages.push(i)
                    } else {
                      for (let i = start; i <= end; i++) pages.push(i)
                    }
                    
                    if (currentPage < totalPages - 2) pages.push('...')
                    pages.push(totalPages)
                  }

                  return pages.map((page, idx) => (
                    typeof page === 'number' ? (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 text-[10px] font-black rounded-sm transition-all ${
                          currentPage === page 
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                            : 'hover:bg-muted text-muted-foreground/60'
                        }`}
                      >
                        {page}
                      </button>
                    ) : (
                      <span key={idx} className="px-2 text-muted-foreground/30 text-[10px] font-black">...</span>
                    )
                  ))
                })()}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-3 border border-border rounded-sm hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={confirmDelete}
        isLoading={isDecommissioning}
        title="Decommission Artifact"
        description="Are you sure you want to decommission this product? This action will permanently remove the artifact from the registry and stop all supply chain operations."
        confirmText="Yes, Decommission"
        cancelText="Abort"
        isDestructive={true}
      />
    </div>
  )
}
