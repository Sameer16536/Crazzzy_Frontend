'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/admin/layout'
import { useComboDeals } from '@/hooks/use-combo-deals'
import { useCatalog } from '@/lib/catalog/catalog-context'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Tag, Gift, AlertCircle, Search, Loader2, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { api } from '@/lib/api-client'

export default function AdminComboDealsPage() {
  const { deals, addDeal, updateDeal, removeDeal, mounted } = useComboDeals()
  const { data: catalogData } = useCatalog()
  const allCategories = catalogData?.categories ?? []

  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requiredQuantity: 5,
    bundlePrice: 999,
    eligibleProductIds: [] as string[],
    isActive: true
  })

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [products, setProducts] = useState<any[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)

  // Fetch products logic — mimicking /admin/products behavior
  const fetchProducts = useCallback(async (categorySlug?: string, search?: string) => {
    try {
      setIsLoadingProducts(true)
      const params = new URLSearchParams({ limit: '100' }) // Get a good amount for selection
      if (categorySlug && categorySlug !== 'all') params.set('category', categorySlug)
      if (search) params.set('search', search)
      
      const res = await api.get<any>(`/products?${params.toString()}`)
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
      
      // Map to CatalogProduct style for compatibility if needed
      const mapped = list.map((p: any) => ({
        id: String(p.id),
        name: p.title,
        price: parseFloat(p.price),
        imageUrl: p.imageUrl,
        categoryId: String(p.categoryId || p.category_id || p.category?.id || '')
      }))
      
      setProducts(mapped)
    } catch (error) {
      console.error('Failed to fetch products', error)
      toast.error('Failed to sync with product registry')
    } finally {
      setIsLoadingProducts(false)
    }
  }, [])

  // Re-fetch whenever filters change
  useEffect(() => {
    if (isCreating) {
      const timer = setTimeout(() => {
        fetchProducts(selectedCategory, searchQuery)
      }, searchQuery ? 400 : 0)
      return () => clearTimeout(timer)
    }
  }, [selectedCategory, searchQuery, isCreating, fetchProducts])

  const handleSaveNew = () => {
    if (!formData.title) return toast.error('Title is required')
    if (formData.requiredQuantity < 2) return toast.error('Required quantity must be at least 2')
    if (formData.bundlePrice < 1) return toast.error('Bundle price must be valid')

    addDeal(formData)
    setIsCreating(false)
    setFormData({
      title: '',
      description: '',
      requiredQuantity: 5,
      bundlePrice: 999,
      eligibleProductIds: [],
      isActive: true
    })
    toast.success('Combo deal created')
  }

  const toggleProductSelection = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      eligibleProductIds: prev.eligibleProductIds.includes(productId)
        ? prev.eligibleProductIds.filter(id => id !== productId)
        : [...prev.eligibleProductIds, productId]
    }))
  }

  const toggleAllVisible = () => {
    const visibleIds = products.map(p => p.id)
    const allVisibleSelected = visibleIds.every(id => formData.eligibleProductIds.includes(id))
    
    if (allVisibleSelected) {
      setFormData(prev => ({
        ...prev,
        eligibleProductIds: prev.eligibleProductIds.filter(id => !visibleIds.includes(id))
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        eligibleProductIds: Array.from(new Set([...prev.eligibleProductIds, ...visibleIds]))
      }))
    }
  }

  if (!mounted) return null

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-5xl mx-auto pb-20">
        <div className="flex items-end justify-between border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-widest text-foreground">Combo Deals</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] mt-2">Manage custom bundles (e.g., Buy 5 for ₹999)</p>
          </div>
          {!isCreating && (
            <Button onClick={() => setIsCreating(true)} className="bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[10px]">
              <Plus size={16} className="mr-2" /> Create Deal
            </Button>
          )}
        </div>

        {isCreating && (
          <div className="bg-card border border-border p-6 rounded-xl space-y-6 shadow-lg">
            <h2 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
              <Gift size={16} className="text-primary" /> New Combo Deal
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Deal Title</label>
                <input
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. 5 Posters for 999"
                  className="w-full bg-background border border-border px-4 py-3 text-xs font-bold uppercase tracking-widest outline-none rounded-lg focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Description (Optional)</label>
                <input
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Shown on the deal card"
                  className="w-full bg-background border border-border px-4 py-3 text-xs font-medium outline-none rounded-lg focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Quantity Required</label>
                <input
                  type="number"
                  min="2"
                  value={formData.requiredQuantity}
                  onChange={e => setFormData({ ...formData, requiredQuantity: parseInt(e.target.value) || 0 })}
                  className="w-full bg-background border border-border px-4 py-3 text-xs font-mono font-bold outline-none rounded-lg focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Bundle Flat Price (₹)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.bundlePrice}
                  onChange={e => setFormData({ ...formData, bundlePrice: parseInt(e.target.value) || 0 })}
                  className="w-full bg-background border border-border px-4 py-3 text-xs font-mono font-bold outline-none rounded-lg focus:border-primary/50 text-primary"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground block mb-1">Eligible Products</label>
                <p className="text-[10px] text-muted-foreground/60">If no products are selected, the deal applies to ALL products in the store.</p>
              </div>

              <div className="bg-background border border-border rounded-lg p-2 flex flex-col md:flex-row gap-2">
                <div className="relative flex-1 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary transition-colors" size={14} />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="SEARCH ARTIFACTS..."
                    className="w-full bg-transparent pl-10 pr-4 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none"
                  />
                </div>
                <div className="relative min-w-[200px]">
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="w-full bg-background border border-border/50 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none rounded focus:border-primary/50 appearance-none text-foreground"
                  >
                    <option value="all">ALL CATEGORIES</option>
                    {allCategories.map(c => (
                      <option key={c.id} value={c.slug}>{c.name.toUpperCase()}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/40">
                    <ChevronRight size={12} className="rotate-90" />
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  onClick={toggleAllVisible}
                  className="text-[10px] font-black uppercase tracking-widest h-auto py-2.5"
                >
                  {products.every(p => formData.eligibleProductIds.includes(p.id)) && products.length > 0 
                    ? 'Deselect Visible' 
                    : 'Select Visible'}
                </Button>
              </div>

              <div className="h-80 overflow-y-auto border border-border rounded-lg bg-background p-2 space-y-1 custom-scrollbar relative">
                {isLoadingProducts ? (
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="animate-spin text-primary" size={24} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary/40">Syncing Registry...</span>
                    </div>
                  </div>
                ) : null}

                {products.length === 0 && !isLoadingProducts ? (
                  <div className="p-12 text-center text-[10px] text-muted-foreground/40 uppercase tracking-widest font-black">
                    No artifacts identified in this sector.
                  </div>
                ) : (
                  products.map(p => {
                    const isSelected = formData.eligibleProductIds.includes(p.id)
                    return (
                      <div 
                        key={p.id}
                        onClick={() => toggleProductSelection(p.id)}
                        className={`flex items-center gap-4 p-3 rounded cursor-pointer transition-all border ${isSelected ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted/50 border-transparent'}`}
                      >
                        <div className="w-12 h-12 relative rounded bg-white overflow-hidden shrink-0 border border-border/50">
                          <Image src={p.imageUrl} alt={p.name} fill className="object-contain p-1" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[11px] font-black uppercase tracking-tight truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>{p.name}</p>
                          <p className="text-[10px] font-mono font-bold text-muted-foreground/60 mt-0.5">₹{p.price}</p>
                        </div>
                        <div className="shrink-0 pr-2">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/20'}`}>
                            {isSelected && <Tag size={12} className="text-black" />}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
              <div className="text-[10px] font-black text-primary text-right uppercase tracking-[0.2em] flex justify-between items-center px-1">
                <span className="text-muted-foreground/40 font-bold">Registry Units: {products.length}</span>
                <span>Selected: {formData.eligibleProductIds.length} Artifacts</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-border">
              <Button variant="ghost" onClick={() => setIsCreating(false)} className="text-[10px] font-black uppercase tracking-widest">Abort</Button>
              <Button onClick={handleSaveNew} className="text-[10px] font-black uppercase tracking-widest px-8 shadow-lg shadow-primary/10">Establish Bundle</Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {deals.length === 0 && !isCreating && (
            <div className="text-center py-24 border border-dashed border-border rounded-xl bg-muted/5">
              <Gift size={48} className="mx-auto text-muted-foreground/10 mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">No Active Combo Deals Identified</p>
            </div>
          )}

          {deals.map(deal => (
            <div key={deal.id} className={`bg-card border p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${deal.isActive ? 'border-primary/20 shadow-xl shadow-black/10' : 'border-border opacity-40'}`}>
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-black uppercase tracking-widest text-foreground">{deal.title}</h3>
                  {deal.isActive && <span className="bg-primary/10 text-primary text-[9px] px-3 py-1 rounded uppercase tracking-[0.2em] font-black border border-primary/20">Operational</span>}
                </div>
                {deal.description && <p className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.15em] font-bold">{deal.description}</p>}
                
                <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border/50">
                  <div className="bg-muted/30 px-4 py-2 rounded-lg border border-white/5">
                    <span className="text-[9px] text-muted-foreground/40 uppercase tracking-widest block mb-1">Unit Count</span>
                    <span className="text-xs font-mono font-bold text-foreground">{deal.requiredQuantity} ITEMS</span>
                  </div>
                  <div className="bg-muted/30 px-4 py-2 rounded-lg border border-white/5">
                    <span className="text-[9px] text-muted-foreground/40 uppercase tracking-widest block mb-1">Registry Value</span>
                    <span className="text-xs font-mono font-bold text-primary">₹{deal.bundlePrice}</span>
                  </div>
                  <div className="bg-muted/30 px-4 py-2 rounded-lg border border-white/5">
                    <span className="text-[9px] text-muted-foreground/40 uppercase tracking-widest block mb-1">Coverage</span>
                    <span className="text-xs font-black uppercase tracking-widest text-foreground">
                      {deal.eligibleProductIds.length === 0 ? 'ALL INVENTORY' : `${deal.eligibleProductIds.length} ARTIFACTS`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => updateDeal(deal.id, { isActive: !deal.isActive })}
                  className={`text-[9px] font-black uppercase tracking-widest h-10 px-6 ${deal.isActive ? 'text-muted-foreground/60 hover:text-foreground' : 'text-primary border-primary/30'}`}
                >
                  {deal.isActive ? 'DEACTIVATE' : 'ACTIVATE'}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeDeal(deal.id)}
                  className="w-10 h-10 text-red-500/40 hover:text-red-500 hover:bg-red-500/5 transition-colors"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
