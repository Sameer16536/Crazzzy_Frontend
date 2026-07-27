'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/admin/layout'
import { Button } from '@/components/ui/button'
import {
  Plus, Trash2, Clapperboard, Search, Loader2, ChevronRight,
  Image as ImageIcon, ToggleLeft, ToggleRight, Eye, EyeOff, Upload,
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { api } from '@/lib/api-client'
import { useCatalog } from '@/lib/catalog/catalog-context'

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface SpotlightData {
  id: number
  title: string
  subtitle: string | null
  bannerUrl: string
  bannerPublicId: string | null
  ctaText: string | null
  ctaUrl: string | null
  productIds: (number | string)[]
  bundlePrice: number | null
  isActive: boolean
  endsAt: string | null
  createdAt: string
}

const EMPTY_FORM = {
  title: '',
  subtitle: '',
  bannerUrl: '',
  bannerPublicId: '',
  ctaLinkType: 'all',   // 'all' | 'category:<slug>' | 'none'
  productIds: [] as string[],
  bundlePrice: '',
  isActive: true,
  endsAt: '',
}

// Derives ctaText + ctaUrl from the link type + categories list
function resolveCta(ctaLinkType: string, categories: any[]): { ctaText: string | null; ctaUrl: string | null } {
  if (ctaLinkType === 'none') return { ctaText: null, ctaUrl: null }
  if (ctaLinkType === 'all') return { ctaText: 'Shop All', ctaUrl: '/shop' }
  if (ctaLinkType.startsWith('category:')) {
    const slug = ctaLinkType.replace('category:', '')
    const cat = categories.find(c => c.slug === slug)
    return {
      ctaText: cat ? `Shop ${cat.name}` : 'Shop Now',
      ctaUrl: `/shop?category=${slug}`,
    }
  }
  return { ctaText: 'Shop Now', ctaUrl: '/shop' }
}

// â”€â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function AdminSpotlightPage() {
  const { data: catalogData } = useCatalog()
  const allCategories = catalogData?.categories ?? []

  const [spotlights, setSpotlights] = useState<SpotlightData[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })

  // Banner upload state
  const [bannerUploading, setBannerUploading] = useState(false)
  const [bannerPreview, setBannerPreview] = useState<string>('')

  // Product picker state
  const [products, setProducts] = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // â”€â”€ Fetch spotlights â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const fetchSpotlights = async () => {
    try {
      setLoading(true)
      const res = await api.get<SpotlightData[]>('/settings/spotlight?all=true')
      setSpotlights(Array.isArray(res) ? res : [])
    } catch {
      toast.error('Failed to fetch spotlight sections')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSpotlights() }, [])

  // â”€â”€ Fetch products for picker â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const fetchProducts = useCallback(async (category?: string, search?: string) => {
    try {
      setLoadingProducts(true)
      const params = new URLSearchParams({ limit: '100' })
      if (category && category !== 'all') params.set('category', category)
      if (search) params.set('search', search)
      const res = await api.get<any>(`/products?${params}`)
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
      setProducts(list.map((p: any) => ({
        id: String(p.id),
        name: p.title,
        price: parseFloat(p.price),
        imageUrl: p.imageUrl,
      })))
    } catch {
      toast.error('Failed to load products')
    } finally {
      setLoadingProducts(false)
    }
  }, [])

  useEffect(() => {
    if (isCreating) {
      const timer = setTimeout(() => fetchProducts(selectedCategory, searchQuery), searchQuery ? 400 : 0)
      return () => clearTimeout(timer)
    }
  }, [selectedCategory, searchQuery, isCreating, fetchProducts])

  // â”€â”€ Banner upload â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const handleBannerUpload = async (file: File) => {
    if (!file) return
    try {
      setBannerUploading(true)
      const fd = new FormData()
      fd.append('image', file)
      const res = await api.upload<{ imageUrl: string; publicId: string }>('/admin/upload', fd)
      setForm(f => ({ ...f, bannerUrl: res.imageUrl, bannerPublicId: res.publicId }))
      setBannerPreview(res.imageUrl)
      toast.success('Banner uploaded')
    } catch {
      toast.error('Upload failed')
    } finally {
      setBannerUploading(false)
    }
  }

  // â”€â”€ Product toggle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const toggleProduct = (id: string) => {
    setForm(f => ({
      ...f,
      productIds: f.productIds.includes(id)
        ? f.productIds.filter(pid => pid !== id)
        : [...f.productIds, id],
    }))
  }

  const toggleAllVisible = () => {
    const visibleIds = products.map(p => p.id)
    const allSelected = visibleIds.every(id => form.productIds.includes(id))
    setForm(f => ({
      ...f,
      productIds: allSelected
        ? f.productIds.filter(id => !visibleIds.includes(id))
        : Array.from(new Set([...f.productIds, ...visibleIds])),
    }))
  }

  // â”€â”€ Save â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error('Title is required')
    if (!form.bannerUrl) return toast.error('Please upload a banner image')

    const { ctaText, ctaUrl } = resolveCta(form.ctaLinkType, allCategories)

    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle || null,
      bannerUrl: form.bannerUrl,
      bannerPublicId: form.bannerPublicId || null,
      ctaText,
      ctaUrl,
      productIds: form.productIds.map(Number),
      bundlePrice: form.bundlePrice ? Number(form.bundlePrice) : null,
      isActive: form.isActive,
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
    }

    try {
      if (editingId) {
        await api.put<SpotlightData>(`/settings/spotlight/${editingId}`, payload)
        toast.success('Spotlight updated')
      } else {
        await api.post<SpotlightData>('/settings/spotlight', payload)
        toast.success('Spotlight created')
      }
      resetForm()
      fetchSpotlights()
    } catch {
      toast.error('Failed to save spotlight')
    }
  }

  const handleEdit = (s: SpotlightData) => {
    // Reverse-resolve ctaLinkType from saved ctaUrl
    let ctaLinkType = 'none'
    if (s.ctaUrl === '/shop') ctaLinkType = 'all'
    else if (s.ctaUrl?.startsWith('/shop?category=')) {
      ctaLinkType = `category:${s.ctaUrl.replace('/shop?category=', '')}`
    }

    setEditingId(s.id)
    setForm({
      title: s.title,
      subtitle: s.subtitle ?? '',
      bannerUrl: s.bannerUrl,
      bannerPublicId: s.bannerPublicId ?? '',
      ctaLinkType,
      productIds: s.productIds.map(String),
      bundlePrice: s.bundlePrice ? String(s.bundlePrice) : '',
      isActive: s.isActive,
      endsAt: s.endsAt ? s.endsAt.slice(0, 16) : '',
    })
    setBannerPreview(s.bannerUrl)
    setIsCreating(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this spotlight?')) return
    try {
      await api.delete(`/settings/spotlight/${id}`)
      toast.success('Deleted')
      fetchSpotlights()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const toggleActive = async (s: SpotlightData) => {
    try {
      await api.put(`/settings/spotlight/${s.id}`, { isActive: !s.isActive })
      fetchSpotlights()
    } catch {
      toast.error('Failed to update')
    }
  }

  const resetForm = () => {
    setIsCreating(false)
    setEditingId(null)
    setForm({ ...EMPTY_FORM })
    setBannerPreview('')
    setSearchQuery('')
    setSelectedCategory('all')
  }

  // â”€â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-5xl mx-auto pb-20">

        {/* â”€â”€ Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="flex items-end justify-between border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-widest text-foreground flex items-center gap-3">
              <Clapperboard size={24} className="text-yellow-500" />
              Spotlight
            </h1>
            <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] mt-2">
              Cinematic banner + product showcase on the homepage
            </p>
          </div>
          {!isCreating && (
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-black uppercase tracking-widest text-[10px]"
            >
              <Plus size={16} className="mr-2" /> New Spotlight
            </Button>
          )}
        </div>

        {/* â”€â”€ Create / Edit Form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {isCreating && (
          <div className="bg-card border border-yellow-400/20 rounded-xl shadow-xl shadow-yellow-400/5 overflow-hidden">

            {/* Form header */}
            <div className="px-6 py-4 border-b border-border flex items-center gap-2">
              <Clapperboard size={15} className="text-yellow-400" />
              <h2 className="text-sm font-black uppercase tracking-widest text-foreground">
                {editingId ? 'Edit Spotlight' : 'New Spotlight Section'}
              </h2>
            </div>

            <div className="p-6 space-y-7">

              {/* â”€â”€ Banner upload â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground block">
                  Banner Image <span className="text-red-400">*</span>
                </label>
                {bannerPreview ? (
                  <div className="relative w-full rounded-lg overflow-hidden border border-yellow-400/20" style={{ height: 200 }}>
                    <Image src={bannerPreview} alt="Banner" fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer">
                        <input type="file" accept="image/*" className="hidden"
                          onChange={e => e.target.files?.[0] && handleBannerUpload(e.target.files[0])} />
                        <div className="flex items-center gap-2 bg-black/80 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded">
                          <Upload size={12} /> Replace
                        </div>
                      </label>
                    </div>
                    {bannerUploading && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <Loader2 className="animate-spin text-yellow-400" size={28} />
                      </div>
                    )}
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => e.target.files?.[0] && handleBannerUpload(e.target.files[0])} />
                    <div className="w-full h-40 border-2 border-dashed border-yellow-400/20 hover:border-yellow-400/50 rounded-lg flex flex-col items-center justify-center gap-2 transition-all">
                      {bannerUploading
                        ? <Loader2 className="animate-spin text-yellow-400" size={24} />
                        : <>
                            <ImageIcon size={28} className="text-yellow-400/30" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Click to upload banner</span>
                            <span className="text-[9px] text-muted-foreground/25">Recommended: 1920 Ã— 1080px or wider</span>
                          </>
                      }
                    </div>
                  </label>
                )}
              </div>

              {/* â”€â”€ Title + Subtitle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. The Odyssey Collection"
                    className="w-full bg-background border border-border px-4 py-3 text-sm font-bold outline-none rounded-lg focus:border-yellow-400/50 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Subtitle</label>
                  <input
                    value={form.subtitle}
                    onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                    placeholder="Short tagline shown on the banner"
                    className="w-full bg-background border border-border px-4 py-3 text-sm outline-none rounded-lg focus:border-yellow-400/50 transition-colors"
                  />
                </div>
              </div>

              {/* â”€â”€ CTA Link picker â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                  CTA Button Links To
                </label>
                <div className="relative">
                  <select
                    value={form.ctaLinkType}
                    onChange={e => setForm(f => ({ ...f, ctaLinkType: e.target.value }))}
                    className="w-full bg-background border border-border px-4 py-3 text-sm font-bold outline-none rounded-lg focus:border-yellow-400/50 transition-colors appearance-none text-foreground"
                  >
                    <option value="none">No CTA Button</option>
                    <option value="all">All Products â†’ /shop</option>
                    {allCategories.map(c => (
                      <option key={c.slug} value={`category:${c.slug}`}>
                        {c.name} â†’ /shop?category={c.slug}
                      </option>
                    ))}
                  </select>
                  <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/40 rotate-90" />
                </div>
                {form.ctaLinkType !== 'none' && (
                  <p className="text-[10px] text-muted-foreground/40 font-mono px-1">
                    Button text: &quot;{resolveCta(form.ctaLinkType, allCategories).ctaText}&quot; â†’ {resolveCta(form.ctaLinkType, allCategories).ctaUrl}
                  </p>
                )}
              </div>

              {/* â”€â”€ End date + Status â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                    Offer Ends At <span className="text-muted-foreground/35 font-medium normal-case">(optional â€” adds countdown)</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={form.endsAt}
                    onChange={e => setForm(f => ({ ...f, endsAt: e.target.value }))}
                    className="w-full bg-background border border-border px-4 py-3 text-sm font-mono outline-none rounded-lg focus:border-yellow-400/50 transition-colors"
                  />
                </div>
                <div className="space-y-2 flex flex-col justify-end">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Status</label>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                      form.isActive
                        ? 'border-yellow-400/30 bg-yellow-400/5 text-yellow-400'
                        : 'border-border text-muted-foreground/40'
                    }`}
                  >
                    {form.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {form.isActive ? 'Active â€” Visible on site' : 'Inactive â€” Hidden'}
                    </span>
                  </button>
                </div>
              </div>

              {/* â”€â”€ Product picker â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              <div className="space-y-3 pt-2 border-t border-border">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground block mb-0.5">
                    Featured Products
                  </label>
                  <p className="text-[10px] text-muted-foreground/40">
                    These appear in the product rail below the banner. Leave empty to hide the rail.
                  </p>
                </div>

                {/* Search + category filter row */}
                <div className="bg-background border border-border rounded-lg p-2 flex flex-col md:flex-row gap-2">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-yellow-400 transition-colors" size={14} />
                    <input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-full bg-transparent pl-10 pr-4 py-2.5 text-[11px] uppercase tracking-widest outline-none font-bold"
                    />
                  </div>
                  <div className="relative min-w-[180px]">
                    <select
                      value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value)}
                      className="w-full bg-background border border-border/50 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none rounded focus:border-yellow-400/50 appearance-none text-foreground"
                    >
                      <option value="all">All Categories</option>
                      {allCategories.map(c => (
                        <option key={c.id} value={c.slug}>{c.name.toUpperCase()}</option>
                      ))}
                    </select>
                    <ChevronRight size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/40 rotate-90" />
                  </div>
                  <Button
                    variant="secondary"
                    onClick={toggleAllVisible}
                    className="text-[10px] font-black uppercase tracking-widest h-auto py-2.5 shrink-0"
                  >
                    {products.length > 0 && products.every(p => form.productIds.includes(p.id))
                      ? 'Deselect Visible'
                      : 'Select Visible'}
                  </Button>
                </div>

                {/* Product list */}
                <div className="h-72 overflow-y-auto border border-border rounded-lg bg-background p-2 space-y-1 relative">
                  {loadingProducts && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10 flex items-center justify-center">
                      <Loader2 className="animate-spin text-yellow-400" size={22} />
                    </div>
                  )}
                  {products.length === 0 && !loadingProducts ? (
                    <div className="py-16 text-center text-[10px] text-muted-foreground/30 uppercase tracking-widest font-black">
                      No products found
                    </div>
                  ) : (
                    products.map(p => {
                      const selected = form.productIds.includes(p.id)
                      return (
                        <div
                          key={p.id}
                          onClick={() => toggleProduct(p.id)}
                          className={`flex items-center gap-4 p-3 rounded cursor-pointer transition-all border ${
                            selected ? 'bg-yellow-400/5 border-yellow-400/25' : 'hover:bg-muted/40 border-transparent'
                          }`}
                        >
                          <div className="w-10 h-10 relative rounded bg-white overflow-hidden shrink-0 border border-border/40">
                            {p.imageUrl && <Image src={p.imageUrl} alt={p.name} fill className="object-contain p-0.5" unoptimized />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-[11px] font-black uppercase tracking-tight truncate ${selected ? 'text-yellow-400' : 'text-foreground'}`}>
                              {p.name}
                            </p>
                            <p className="text-[10px] font-mono text-muted-foreground/50 mt-0.5">&#8377;{p.price}</p>
                          </div>
                          <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all ${
                            selected ? 'bg-yellow-400 border-yellow-400' : 'border-muted-foreground/20'
                          }`}>
                            {selected && <span className="text-black text-[10px] font-black">âœ“</span>}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                <div className="flex justify-between px-1">
                  <span className="text-[10px] text-muted-foreground/40 font-bold">{products.length} products</span>
                  <span className="text-[10px] font-black text-yellow-400 uppercase tracking-[0.2em]">{form.productIds.length} selected</span>
                </div>
              </div>

              {/* â”€â”€ Form actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
              <div className="flex justify-end gap-3 pt-2 border-t border-border">
                <Button variant="ghost" onClick={resetForm} className="text-[10px] font-black uppercase tracking-widest">
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-yellow-400 hover:bg-yellow-300 text-black text-[10px] font-black uppercase tracking-widest px-8"
                >
                  {editingId ? 'Update Spotlight' : 'Publish Spotlight'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* â”€â”€ Spotlight list â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="space-y-4">
          {loading && (
            <div className="py-24 flex items-center justify-center">
              <Loader2 className="animate-spin text-yellow-400/40" size={28} />
            </div>
          )}

          {!loading && spotlights.length === 0 && !isCreating && (
            <div className="text-center py-24 border border-dashed border-border rounded-xl bg-muted/5">
              <Clapperboard size={48} className="mx-auto text-yellow-400/10 mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">No Spotlight sections yet</p>
              <p className="text-[10px] text-muted-foreground/20 mt-1">Create one to add a cinematic offer banner to your homepage</p>
            </div>
          )}

          {spotlights.map(s => (
            <div
              key={s.id}
              className={`bg-card border rounded-xl overflow-hidden transition-all ${
                s.isActive ? 'border-yellow-400/20 shadow-lg shadow-yellow-400/5' : 'border-border opacity-50'
              }`}
            >
              <div className="flex flex-col md:flex-row">
                {/* Banner thumb */}
                <div className="relative md:w-52 h-32 md:h-auto flex-shrink-0 bg-zinc-900">
                  <Image src={s.bannerUrl} alt={s.title} fill className="object-cover" unoptimized />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/50" />
                </div>

                {/* Info */}
                <div className="flex-1 p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    {s.isActive && (
                      <span className="bg-yellow-400/10 text-yellow-400 text-[9px] px-2 py-0.5 border border-yellow-400/20 uppercase tracking-[0.2em] font-black">Live</span>
                    )}
                    <span className="text-[9px] text-muted-foreground/30 font-mono">#{s.id}</span>
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-tight">{s.title}</h3>
                  {s.subtitle && <p className="text-[11px] text-muted-foreground/50">{s.subtitle}</p>}

                  <div className="flex flex-wrap gap-3 pt-2">
                    <div className="bg-muted/30 px-3 py-1.5 rounded border border-white/5">
                      <span className="text-[9px] text-muted-foreground/40 block mb-0.5 uppercase tracking-widest">Products</span>
                      <span className="text-[11px] font-mono font-bold">{s.productIds.length} items</span>
                    </div>
                    {s.ctaUrl && (
                      <div className="bg-muted/30 px-3 py-1.5 rounded border border-white/5">
                        <span className="text-[9px] text-muted-foreground/40 block mb-0.5 uppercase tracking-widest">CTA</span>
                        <span className="text-[11px] font-bold">{s.ctaText}</span>
                      </div>
                    )}
                    {s.bundlePrice && (
                      <div className="bg-muted/30 px-3 py-1.5 rounded border border-white/5">
                        <span className="text-[9px] text-muted-foreground/40 block mb-0.5 uppercase tracking-widest">Price</span>
                        <span className="text-[11px] font-mono font-bold text-yellow-400">&#8377;{s.bundlePrice}</span>
                      </div>
                    )}
                    {s.endsAt && (
                      <div className="bg-muted/30 px-3 py-1.5 rounded border border-white/5">
                        <span className="text-[9px] text-muted-foreground/40 block mb-0.5 uppercase tracking-widest">Ends</span>
                        <span className="text-[11px] font-mono font-bold">
                          {new Date(s.endsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex md:flex-col items-center justify-end gap-2 p-4 border-t md:border-t-0 md:border-l border-border/40">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(s)}
                    className="text-[9px] font-black uppercase tracking-widest h-9 px-4 border-white/10 hover:border-yellow-400/40">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toggleActive(s)}
                    className={`text-[9px] font-black uppercase tracking-widest h-9 px-4 ${
                      s.isActive ? 'text-muted-foreground/40 border-white/10' : 'text-yellow-400 border-yellow-400/30'
                    }`}>
                    {s.isActive ? <EyeOff size={12} /> : <Eye size={12} />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}
                    className="w-9 h-9 text-red-500/30 hover:text-red-500 hover:bg-red-500/5">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}

