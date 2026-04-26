'use client'

import { useState, useEffect, FormEvent, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, Package, Layers, Info, Upload, X, Loader2 } from 'lucide-react'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
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
  tags: string
  isFeatured: boolean
  isDealOfTheDay: boolean
  isActive: boolean
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
    tags: '',
    isFeatured: false,
    isDealOfTheDay: false,
    isActive: true,
  })

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true)
      
      // 1. Fetch Categories
      const catRes = await api.get<any>('/categories')
      const allCats = Array.isArray(catRes?.data) ? catRes.data : (Array.isArray(catRes) ? catRes : [])
      
      const mainCategories = allCats.filter((c: any) => !c.parentId)
      const categoriesWithSubs = mainCategories.map((main: any) => ({
        ...main,
        subcategories: allCats.filter((c: any) => c.parentId === main.id)
      }))
      setCategories(categoriesWithSubs)

      // 2. Fetch Product if in Edit Mode
      if (productId) {
        const prodRes = await api.get<any>(`/admin/products/${productId}`)
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
          tags: Array.isArray(product.tags) ? product.tags.map((t: any) => t.name).join(', ') : '',
          isFeatured: !!product.isFeatured,
          isDealOfTheDay: !!product.isDealOfTheDay,
          isActive: product.isActive !== false,
        })
      }
    } catch (error) {
      console.error('Error initializing form:', error)
      toast.error('Failed to initialize product data')
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    fetchInitialData()
  }, [fetchInitialData])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (productId) {
        await api.patch(`/admin/products/${productId}`, formData)
        toast.success('Product updated successfully')
      } else {
        await api.post('/admin/products', formData)
        toast.success('Product created successfully')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save product')
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
      {/* Main Stats */}
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-card border border-border p-8 space-y-8 rounded-xl shadow-sm">
          <div className="flex items-center gap-4 border-b border-border pb-6">
             <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center rounded-lg">
                <Info size={20} className="text-primary" />
             </div>
             <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Basic Information</h2>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Product name, description and category</p>
             </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground pl-1">Product Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g. Anime Wall Poster"
                className="w-full bg-background border border-border px-6 py-4 text-xs font-bold uppercase tracking-widest focus:border-primary/40 transition-all outline-none rounded-lg text-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground pl-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                placeholder="Tell your customers about this product..."
                className="w-full bg-background border border-border px-6 py-4 text-xs font-medium focus:border-primary/40 transition-all outline-none resize-none rounded-lg text-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground pl-1">Tags (Comma separated)</label>
              <input
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="anime, posters, decoration"
                className="w-full bg-background border border-border px-6 py-4 text-xs font-bold uppercase tracking-widest focus:border-primary/40 transition-all outline-none rounded-lg text-foreground"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground pl-1">SKU (Unique ID)</label>
                <input
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  required
                  placeholder="SKU-001"
                  className="w-full bg-background border border-border px-6 py-4 text-xs font-mono font-bold focus:border-primary/40 transition-all outline-none rounded-lg text-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground pl-1">Category</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-background border border-border px-6 py-4 text-xs font-black uppercase tracking-widest focus:border-primary/40 transition-all outline-none appearance-none rounded-lg text-foreground"
                >
                  <option value="">Select a category</option>
                  {categories.map(main => (
                    <optgroup key={main.id} label={main.name.toUpperCase()} className="bg-background text-foreground">
                      <option value={main.id}>{main.name} (Parent)</option>
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
        <div className="bg-card border border-border p-8 space-y-8 rounded-xl shadow-sm">
           <div className="flex items-center gap-4 border-b border-border pb-6">
             <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center rounded-lg">
                <Package size={20} className="text-primary" />
             </div>
             <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Pricing & Inventory</h2>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Manage your margins and stock</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground pl-1">Sale Price</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-mono font-bold">₹</span>
                <input
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-background border border-border pl-10 pr-6 py-4 text-xs font-mono font-bold focus:border-primary/40 transition-all outline-none rounded-lg text-foreground"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground pl-1">Regular Price</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono font-bold">₹</span>
                <input
                  name="originalPrice"
                  type="number"
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                  className="w-full bg-background border border-border pl-10 pr-6 py-4 text-xs font-mono font-bold focus:border-primary/40 transition-all outline-none rounded-lg text-foreground"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground pl-1">Stock Level</label>
              <input
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleInputChange}
                required
                className="w-full bg-background border border-border px-6 py-4 text-xs font-mono font-bold focus:border-primary/40 transition-all outline-none rounded-lg text-foreground"
              />
            </div>
          </div>
        </div>

        {/* Visibility & Status */}
        <div className="bg-card border border-border p-8 space-y-8 rounded-xl shadow-sm">
           <div className="flex items-center gap-4 border-b border-border pb-6">
             <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center rounded-lg">
                <Layers size={20} className="text-primary" />
             </div>
             <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Visibility & Marketing</h2>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Control how the product appears</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <label className="flex items-center gap-4 p-4 bg-background border border-border rounded-xl cursor-pointer hover:border-primary/20 transition-all group">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-4 h-4 accent-primary"
              />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">Published</span>
                <span className="text-[8px] text-muted-foreground uppercase tracking-widest">Available to buy</span>
              </div>
            </label>

            <label className="flex items-center gap-4 p-4 bg-background border border-border rounded-xl cursor-pointer hover:border-primary/20 transition-all group">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleInputChange}
                className="w-4 h-4 accent-primary"
              />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">Featured</span>
                <span className="text-[8px] text-muted-foreground uppercase tracking-widest">Home page spotlight</span>
              </div>
            </label>

            <label className="flex items-center gap-4 p-4 bg-background border border-border rounded-xl cursor-pointer hover:border-primary/20 transition-all group">
              <input
                type="checkbox"
                name="isDealOfTheDay"
                checked={formData.isDealOfTheDay}
                onChange={handleInputChange}
                className="w-4 h-4 accent-primary"
              />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">Deal</span>
                <span className="text-[8px] text-muted-foreground uppercase tracking-widest">Show as limited deal</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Sidebar: Visuals & Actions */}
      <div className="space-y-8">
        <div className="bg-card border border-border p-8 space-y-6 rounded-xl shadow-sm sticky top-28">
          <div className="flex items-center gap-4 border-b border-border pb-6">
             <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center rounded-lg">
                <Upload size={20} className="text-primary" />
             </div>
             <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Media Uplink</h2>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Product imagery</p>
             </div>
          </div>

          <div className="aspect-square border-2 border-dashed border-border bg-muted/20 rounded-xl flex flex-col items-center justify-center group hover:border-primary/20 transition-all cursor-pointer">
            <Upload className="text-muted-foreground/20 group-hover:text-primary transition-colors mb-4" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 group-hover:text-foreground transition-colors text-center px-4">
              Upload visuals coming soon
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {formData.images.map((img, i) => (
              <div key={i} className="aspect-square bg-white border border-border rounded-lg relative overflow-hidden group p-2">
                <Image src={img} alt="preview" fill className="object-contain" />
                <button 
                  type="button"
                  className="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  <X size={14} className="text-white" />
                </button>
              </div>
            ))}
          </div>

          <button 
            type="submit"
            disabled={submitting}
            className="w-full bg-primary py-6 text-primary-foreground font-black uppercase tracking-[0.4em] rounded-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-primary/20"
          >
            {submitting ? (
              <div className="flex items-center justify-center gap-3">
                 <Loader2 className="animate-spin" size={20} />
                 Saving...
              </div>
            ) : productId ? 'Recalibrate' : 'Deploy'}
          </button>

          <div className="bg-primary/5 border border-primary/10 p-6 rounded-xl flex gap-4">
             <AlertCircle className="text-primary shrink-0" size={20} />
             <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest leading-relaxed">
               Verified changes will be pushed to the global registry immediately.
             </p>
          </div>
        </div>
      </div>
    </form>
  )
}
