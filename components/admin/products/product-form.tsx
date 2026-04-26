'use client'

import { useState, useEffect, FormEvent } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Package, Layers, Info, Upload, X, Check, Loader2 } from 'lucide-react'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface Category {
  id: number
  name: string
  slug: string
  parentId?: number | null
  subcategories?: Category[]
}

interface FormData {
  title: string
  description: string
  sku: string
  categoryId: string
  price: string
  originalPrice: string
  stock: string
  images: string[]
}

export function ProductForm({ productId }: { productId?: string }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    sku: '',
    categoryId: '',
    price: '',
    originalPrice: '',
    stock: '',
    images: [],
  })

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)
        const catRes = await api.get<any>('/categories')
        const allCats = Array.isArray(catRes?.data) ? catRes.data : (Array.isArray(catRes) ? catRes : [])
        
        // Organize categories into hierarchy
        const mainCategories = allCats.filter((c: any) => !c.parentId)
        const categoriesWithSubs = mainCategories.map((main: any) => ({
          ...main,
          subcategories: allCats.filter((c: any) => c.parentId === main.id)
        }))
        
        setCategories(categoriesWithSubs)

        if (productId) {
          const prodRes = await api.get<any>(`/products/${productId}`)
          const product = prodRes?.data || prodRes
          
          setFormData({
            title: product.title || '',
            description: product.description || '',
            sku: product.sku || '',
            categoryId: String(product.categoryId || ''),
            price: String(product.price || ''),
            originalPrice: String(product.originalPrice || ''),
            stock: String(product.stock || ''),
            images: Array.isArray(product.images) ? product.images.map((img: any) => img.imageUrl) : (product.imageUrl ? [product.imageUrl] : []),
          })
        }
      } catch (error) {
        toast.error('Failed to initialize system parameters')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [productId])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (productId) {
        await api.patch(`/admin/products/${productId}`, formData)
        toast.success('Artifact recalibrated successfully')
      } else {
        await api.post('/admin/products', formData)
        toast.success('New artifact deployed to registry')
      }
    } catch (error: any) {
      toast.error(error.message || 'Mission failure: could not save artifact')
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Stats */}
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-zinc-900/30 border border-white/5 p-8 space-y-8">
          <div className="flex items-center gap-4 border-b border-white/5 pb-6">
             <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Info size={20} className="text-primary" />
             </div>
             <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-white">Primary Designation</h2>
                <p className="text-[10px] text-white/20 uppercase tracking-[0.2em]">Core artifact identity and specs</p>
             </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 pl-1">Identification</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="ARTIFACT NAME"
                className="w-full bg-black border border-white/5 px-6 py-4 text-xs font-black uppercase tracking-widest focus:border-primary/40 transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 pl-1">Intelligence Data</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                placeholder="DETAILED ARTIFACT RECONNAISSANCE..."
                className="w-full bg-black border border-white/5 px-6 py-4 text-xs font-bold uppercase tracking-widest focus:border-primary/40 transition-all outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 pl-1">Registry SKU</label>
                <input
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  required
                  placeholder="X-999-UNIT"
                  className="w-full bg-black border border-white/5 px-6 py-4 text-xs font-mono font-bold uppercase tracking-widest focus:border-primary/40 transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 pl-1">Sector Class</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-black border border-white/5 px-6 py-4 text-xs font-black uppercase tracking-widest focus:border-primary/40 transition-all outline-none appearance-none"
                >
                  <option value="">Select Sector</option>
                  {categories.map(main => (
                    <optgroup key={main.id} label={main.name.toUpperCase()} className="bg-zinc-900 text-white font-black">
                      <option value={main.id}>{main.name} (MAIN)</option>
                      {main.subcategories?.map(sub => (
                        <option key={sub.id} value={sub.id}>
                          └─ {sub.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Financials & Inventory */}
        <div className="bg-zinc-900/30 border border-white/5 p-8 space-y-8">
           <div className="flex items-center gap-4 border-b border-white/5 pb-6">
             <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Package size={20} className="text-primary" />
             </div>
             <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-white">Resource Allocation</h2>
                <p className="text-[10px] text-white/20 uppercase tracking-[0.2em]">Credits and supply levels</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 pl-1">Base Value</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-mono font-bold">₹</span>
                <input
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-black border border-white/5 pl-12 pr-6 py-4 text-xs font-mono font-bold focus:border-primary/40 transition-all outline-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 pl-1">Original Value</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 font-mono font-bold">₹</span>
                <input
                  name="originalPrice"
                  type="number"
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                  className="w-full bg-black border border-white/5 pl-12 pr-6 py-4 text-xs font-mono font-bold focus:border-primary/40 transition-all outline-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 pl-1">Supply Count</label>
              <input
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleInputChange}
                required
                className="w-full bg-black border border-white/5 px-6 py-4 text-xs font-mono font-bold focus:border-primary/40 transition-all outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar: Visuals */}
      <div className="space-y-8">
        <div className="bg-zinc-900/30 border border-white/5 p-8 space-y-6">
          <div className="flex items-center gap-4 border-b border-white/5 pb-6">
             <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Upload size={20} className="text-primary" />
             </div>
             <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-white">Visual Uplink</h2>
                <p className="text-[10px] text-white/20 uppercase tracking-[0.2em]">Artifact visual verification</p>
             </div>
          </div>

          <div className="aspect-square border-2 border-dashed border-white/5 bg-black flex flex-col items-center justify-center group hover:border-primary/20 transition-all cursor-pointer">
            <Upload className="text-white/10 group-hover:text-primary transition-colors mb-4" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-white transition-colors">Initialize Upload</p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {formData.images.map((img, i) => (
              <div key={i} className="aspect-square bg-white border border-black/5 relative overflow-hidden group p-2">
                <Image src={img} alt="preview" fill className="object-contain" />
                <button className="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <X size={14} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button 
          type="submit"
          disabled={submitting}
          className="w-full bg-primary py-6 text-black font-black uppercase tracking-[0.4em] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
        >
          {submitting ? (
            <div className="flex items-center justify-center gap-3">
               <Loader2 className="animate-spin" size={20} />
               Processing...
            </div>
          ) : productId ? 'Recalibrate Artifact' : 'Deploy Artifact'}
        </button>

        <div className="bg-primary/5 border border-primary/10 p-6 flex gap-4">
           <AlertCircle className="text-primary shrink-0" size={20} />
           <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest leading-relaxed">
             Ensure all identification codes and financial data are verified before deployment to the public registry.
           </p>
        </div>
      </div>
    </form>
  )
}
