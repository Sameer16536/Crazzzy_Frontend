'use client'

import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api-client'
import { motion } from 'framer-motion'
import { Package, Search, Plus, Edit2, Trash2, MoreHorizontal, Eye, Loader2 } from 'lucide-react'
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

interface Category {
  id: string
  name: string
  slug: string
}

export function ProductsTable() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

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

  // Fetch products with optional category + search filter
  const fetchProducts = useCallback(async (category?: string, search?: string) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ page: '1', limit: '100' })
      if (category) params.set('category', category)
      if (search) params.set('search', search)
      const res = await api.get<any>(`/products?${params.toString()}`)
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
      setProducts(list)
    } catch (error) {
      console.error('Failed to fetch products', error)
      toast.error('Failed to sync with product registry')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Re-fetch whenever search or category changes (debounced for search)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(selectedCategory || undefined, searchQuery || undefined)
    }, searchQuery ? 400 : 0)
    return () => clearTimeout(timer)
  }, [selectedCategory, searchQuery, fetchProducts])

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to decommission this artifact?')) return
    try {
      await api.delete(`/admin/products/${id}`)
      toast.success('Artifact decommissioned')
      fetchProducts(selectedCategory || undefined, searchQuery || undefined)
    } catch (error: any) {
      toast.error(error.message || 'Decommission failed')
    }
  }

  return (
    <div className="space-y-8">
      {/* Table Toolbar */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        {/* Search */}
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search products by name, SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border px-12 py-4 text-[10px] font-black uppercase tracking-[0.2em] focus:outline-none focus:border-primary/30 transition-all text-foreground placeholder:text-muted-foreground/30"
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Real Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-background border border-border px-4 py-4 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary/30 cursor-pointer text-foreground min-w-[160px]"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>

          <Link
            href="/admin/products/new"
            className="px-6 py-4 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform whitespace-nowrap"
          >
            <Plus size={14} />
            Add Product
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-muted/20 border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Artifact</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Status</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Stock</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Value</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground text-right">Control</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <Loader2 className="animate-spin text-primary mx-auto" size={32} />
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                      No products found
                      {selectedCategory ? ` in "${categories.find(c => c.slug === selectedCategory)?.name}"` : ''}
                      {searchQuery ? ` matching "${searchQuery}"` : ''}.
                    </p>
                  </td>
                </tr>
              ) : (
                products.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border hover:bg-muted/30 transition-colors group"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 bg-white border border-black/5 shrink-0 p-2">
                          <Image src={p.imageUrl || '/placeholder.jpg'} alt={p.title} fill className="object-contain" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black uppercase tracking-tight truncate text-foreground">{p.title}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{p.category?.name || 'Uncategorized'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${p.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${p.isActive ? 'text-green-500' : 'text-red-500'}`}>
                          {p.isActive ? 'Active' : 'Offline'}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className={`text-xs font-mono font-bold ${p.stock <= 5 ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {p.stock} Units
                      </p>
                    </td>
                    <td className="p-6">
                      <p className="text-sm font-black font-mono text-foreground">₹{parseFloat(p.price).toLocaleString('en-IN')}</p>
                    </td>
                    <td className="p-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 text-muted-foreground/30 hover:text-foreground hover:bg-muted transition-all rounded">
                            <MoreHorizontal size={18} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover border-border">
                          <DropdownMenuItem asChild>
                            <Link href={`/product/${p.slug}`} target="_blank" className="flex items-center gap-3 px-4 py-3 cursor-pointer focus:bg-muted focus:text-primary">
                              <Eye size={16} />
                              <span className="font-bold text-[10px] uppercase tracking-widest">View Live</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/products/edit/${p.id}`} className="flex items-center gap-3 px-4 py-3 cursor-pointer focus:bg-muted focus:text-primary">
                              <Edit2 size={16} />
                              <span className="font-bold text-[10px] uppercase tracking-widest">Edit</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border" />
                          <DropdownMenuItem
                            onClick={() => handleDelete(p.id)}
                            className="flex items-center gap-3 px-4 py-3 cursor-pointer focus:bg-red-500/10 focus:text-red-500 text-red-500/70"
                          >
                            <Trash2 size={16} />
                            <span className="font-bold text-[10px] uppercase tracking-widest">Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
