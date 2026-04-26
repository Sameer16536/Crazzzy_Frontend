'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api-client'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Search, Filter, Plus, Edit2, Trash2, MoreHorizontal, Eye, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ProductsTable() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await api.get<any>('/products')
      // Backend returns: { success: true, data: [...] }
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
      setProducts(list)
    } catch (error) {
      console.error('Failed to fetch products', error)
      toast.error('Failed to sync with local registry')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to decommission this artifact?')) return
    try {
      await api.delete(`/admin/products/${id}`)
      toast.success('Artifact decommissioned')
      fetchProducts()
    } catch (error: any) {
      toast.error(error.message || 'Decommission failed')
    }
  }

  const filteredProducts = Array.isArray(products) ? products.filter(p => 
    (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  ) : []

  return (
    <div className="space-y-8">
      {/* Table Toolbar */}
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search Artifact Registry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-white/5 px-12 py-4 text-[10px] font-black uppercase tracking-[0.2em] focus:outline-none focus:border-primary/30 transition-all"
          />
        </div>
        <div className="flex items-center gap-4">
           <button className="px-6 py-4 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 transition-all">
             <Filter size={14} />
             Filter
           </button>
           <Link 
             href="/admin/products/new"
             className="px-6 py-4 bg-primary text-black text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform"
           >
             <Plus size={14} />
             Deploy New
           </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900/30 border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-zinc-950/50">
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Artifact</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Status</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Stock</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Value</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 text-right">Control</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <Loader2 className="animate-spin text-primary mx-auto" size={32} />
                  </td>
                </tr>
              ) : filteredProducts.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 bg-black border border-white/10 overflow-hidden shrink-0">
                        <Image src={p.imageUrl || '/placeholder.jpg'} alt={p.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black uppercase tracking-tight truncate">{p.title}</p>
                        <p className="text-[10px] text-white/20 uppercase tracking-widest">{p.category?.name || 'Uncategorized'}</p>
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
                    <p className={`text-xs font-mono font-bold ${p.stock <= 5 ? 'text-red-500' : 'text-white/60'}`}>
                      {p.stock} Units
                    </p>
                  </td>
                  <td className="p-6">
                    <p className="text-sm font-black font-mono">₹{parseFloat(p.price).toLocaleString('en-IN')}</p>
                  </td>
                  <td className="p-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 text-white/20 hover:text-white hover:bg-white/5 transition-all">
                          <MoreHorizontal size={18} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10">
                        <DropdownMenuItem asChild>
                          <Link href={`/product/${p.slug}`} target="_blank" className="flex items-center gap-3 px-4 py-3 cursor-pointer focus:bg-white/5 focus:text-primary">
                            <Eye size={16} />
                            <span className="font-bold text-[10px] uppercase tracking-widest">View Live</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/products/edit/${p.id}`} className="flex items-center gap-3 px-4 py-3 cursor-pointer focus:bg-white/5 focus:text-primary">
                            <Edit2 size={16} />
                            <span className="font-bold text-[10px] uppercase tracking-widest">Recalibrate</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/5" />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(p.id)}
                          className="flex items-center gap-3 px-4 py-3 cursor-pointer focus:bg-red-500/10 focus:text-red-500"
                        >
                          <Trash2 size={16} />
                          <span className="font-bold text-[10px] uppercase tracking-widest">Decommission</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {!loading && filteredProducts.length === 0 && (
          <div className="py-20 text-center text-white/20">
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">No artifacts found in this sector.</p>
          </div>
        )}
      </div>
    </div>
  )
}
