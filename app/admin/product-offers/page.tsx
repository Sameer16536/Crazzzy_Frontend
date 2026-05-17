'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/admin/layout'
import { Button } from '@/components/ui/button'
import { useCatalog } from '@/lib/catalog/catalog-context'
import { Plus, Trash2, Tag, Percent, AlertCircle, Loader2, ToggleLeft, ToggleRight, Sparkles, Gift, Search, ChevronRight, ArrowRight, RefreshCw, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { api } from '@/lib/api-client'

interface ProductOffer {
  id: number
  productId: number
  buyQuantity: number
  freeProductIds: string // stringified JSON array
  isActive: boolean
}

export default function AdminProductOffersPage() {
  const { data: catalogData } = useCatalog()
  const allCategories = catalogData?.categories ?? []

  const [offers, setOffers] = useState<ProductOffer[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([]) // Global registry for visual timeline rendering at bottom
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  // Form states
  const [triggerProductId, setTriggerProductId] = useState<string>('')
  const [buyQuantity, setBuyQuantity] = useState<number>(1)
  const [offerType, setOfferType] = useState<'bogo' | 'gift'>('bogo')
  const [selectedFreeIds, setSelectedFreeIds] = useState<number[]>([])
  const [isActive, setIsActive] = useState(true)

  // ── Trigger Product Selector States ──────────────────────────────────────────
  const [triggerProducts, setTriggerProducts] = useState<any[]>([])
  const [isLoadingTrigger, setIsLoadingTrigger] = useState(false)
  const [triggerSearch, setTriggerSearch] = useState('')
  const [triggerCategory, setTriggerCategory] = useState('all')

  // ── Free Gift Product Selector States ─────────────────────────────────────────
  const [giftProducts, setGiftProducts] = useState<any[]>([])
  const [isLoadingGift, setIsLoadingGift] = useState(false)
  const [giftSearch, setGiftSearch] = useState('')
  const [giftCategory, setGiftCategory] = useState('all')

  // Fetch all active/inactive offers
  const fetchOffers = async (quiet = false) => {
    try {
      if (!quiet) setLoading(true)
      const res = await api.get<ProductOffer[]>('/settings/product-offers')
      setOffers(Array.isArray(res) ? res : [])
      if (!quiet) toast.success('Promotions registry synchronized')
    } catch (error: any) {
      toast.error('Failed to load active promotions registry')
    } finally {
      if (!quiet) setLoading(false)
    }
  }

  // Fetch all products (limit 1000) once for global timeline rendering at the bottom
  const fetchAllProducts = async () => {
    try {
      const res = await api.get<any>('/products?limit=1000')
      const list = res.data || (Array.isArray(res) ? res : [])
      const mapped = list.map((p: any) => ({
        id: String(p.id),
        name: p.title || p.name,
        price: parseFloat(p.price),
        imageUrl: p.imageUrl || '/placeholder.jpg',
      }))
      setAllProducts(mapped)
    } catch (error) {
      console.error('Failed to fetch all products', error)
      toast.error('Failed to resolve global product listings')
    }
  }

  // Fetch Trigger Selector Products dynamically (copied from Combo Deals page)
  const fetchTriggerProducts = useCallback(async (categorySlug?: string, search?: string) => {
    try {
      setIsLoadingTrigger(true)
      const params = new URLSearchParams({ limit: '100' })
      if (categorySlug && categorySlug !== 'all') params.set('category', categorySlug)
      if (search) params.set('search', search)
      
      const res = await api.get<any>(`/products?${params.toString()}`)
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
      
      const mapped = list.map((p: any) => ({
        id: String(p.id),
        name: p.title || p.name,
        price: parseFloat(p.price),
        imageUrl: p.imageUrl || '/placeholder.jpg',
        categoryId: String(p.categoryId || p.category_id || p.category?.id || '')
      }))
      setTriggerProducts(mapped)
    } catch (error) {
      console.error('Failed to fetch trigger products', error)
      toast.error('Trigger product search failed')
    } finally {
      setIsLoadingTrigger(false)
    }
  }, [])

  // Fetch Gift Selector Products dynamically (copied from Combo Deals page)
  const fetchGiftProducts = useCallback(async (categorySlug?: string, search?: string) => {
    try {
      setIsLoadingGift(true)
      const params = new URLSearchParams({ limit: '100' })
      if (categorySlug && categorySlug !== 'all') params.set('category', categorySlug)
      if (search) params.set('search', search)
      
      const res = await api.get<any>(`/products?${params.toString()}`)
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
      
      const mapped = list.map((p: any) => ({
        id: String(p.id),
        name: p.title || p.name,
        price: parseFloat(p.price),
        imageUrl: p.imageUrl || '/placeholder.jpg',
        categoryId: String(p.categoryId || p.category_id || p.category?.id || '')
      }))
      setGiftProducts(mapped)
    } catch (error) {
      console.error('Failed to fetch gift products', error)
      toast.error('Gift product search failed')
    } finally {
      setIsLoadingGift(false)
    }
  }, [])

  // Re-fetch trigger products whenever search or category changes
  useEffect(() => {
    if (isCreating) {
      const timer = setTimeout(() => {
        fetchTriggerProducts(triggerCategory, triggerSearch)
      }, triggerSearch ? 400 : 0)
      return () => clearTimeout(timer)
    }
  }, [triggerCategory, triggerSearch, isCreating, fetchTriggerProducts])

  // Re-fetch gift products whenever search or category changes (only if offerType is gift)
  useEffect(() => {
    if (isCreating && offerType === 'gift') {
      const timer = setTimeout(() => {
        fetchGiftProducts(giftCategory, giftSearch)
      }, giftSearch ? 400 : 0)
      return () => clearTimeout(timer)
    }
  }, [giftCategory, giftSearch, isCreating, offerType, fetchGiftProducts])

  // Run on mount
  useEffect(() => {
    fetchOffers()
    fetchAllProducts()
  }, [])

  // Auto-sync freeProductIds if BOGO type is selected
  useEffect(() => {
    if (offerType === 'bogo' && triggerProductId) {
      setSelectedFreeIds([Number(triggerProductId)])
    } else if (offerType === 'bogo') {
      setSelectedFreeIds([])
    }
  }, [offerType, triggerProductId])

  const handleSave = async () => {
    if (!triggerProductId) return toast.error('Please select the product to buy (trigger product)')
    if (buyQuantity < 1) return toast.error('Quantity required must be at least 1')
    if (selectedFreeIds.length === 0) return toast.error('Please select the free gift/reward product')

    try {
      const payload = {
        productId: Number(triggerProductId),
        buyQuantity,
        freeProductIds: JSON.stringify(selectedFreeIds),
        isActive
      }

      if (editingId) {
        await api.put(`/settings/product-offers/${editingId}`, payload)
        toast.success('Promotional rule successfully updated!')
      } else {
        await api.post('/settings/product-offers', payload)
        toast.success('New promotion successfully added to store!')
      }

      setIsCreating(false)
      setEditingId(null)
      // Reset form
      setTriggerProductId('')
      setBuyQuantity(1)
      setOfferType('bogo')
      setSelectedFreeIds([])
      setTriggerSearch('')
      setGiftSearch('')
      fetchOffers(true)
    } catch (error: any) {
      toast.error(error.message || 'Failed to save product offer')
    }
  }

  const handleEdit = (offer: ProductOffer) => {
    setEditingId(offer.id)
    setTriggerProductId(String(offer.productId))
    setBuyQuantity(offer.buyQuantity)
    setIsActive(offer.isActive)

    let parsedIds: number[] = []
    try {
      parsedIds = JSON.parse(offer.freeProductIds) || []
    } catch (e) {
      parsedIds = []
    }

    setSelectedFreeIds(parsedIds)
    const isBogo = parsedIds.length === 1 && parsedIds[0] === offer.productId
    setOfferType(isBogo ? 'bogo' : 'gift')

    setIsCreating(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    toast.success(`Loading offer details for editing`)
  }

  const handleToggle = async (offer: ProductOffer) => {
    try {
      await api.put(`/settings/product-offers/${offer.id}`, { isActive: !offer.isActive })
      setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, isActive: !o.isActive } : o))
      toast.success(`Offer is now ${!offer.isActive ? 'active (live)' : 'inactive (hidden)'}`)
    } catch (error: any) {
      toast.error('Failed to update offer status')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this offer? This will stop BOGO/free gift calculation immediately.')) return
    try {
      await api.delete(`/settings/product-offers/${id}`)
      setOffers(prev => prev.filter(o => o.id !== id))
      toast.success('Promotion terminated successfully')
    } catch (error: any) {
      toast.error('Failed to delete offer')
    }
  }

  const getProduct = (id: number) => {
    return allProducts.find(p => Number(p.id) === id)
  }

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-5xl mx-auto pb-20">
        
        {/* Page Header */}
        <div className="flex items-end justify-between border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-widest text-foreground">Product Offers</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] mt-2">Create BOGO (Buy 1 Get 1) and Free Gift promotions for specific items</p>
          </div>
          {!isCreating && (
            <Button onClick={() => { setIsCreating(true); setEditingId(null); }} className="bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[10px]">
              <Plus size={16} className="mr-2" /> Add New Offer
            </Button>
          )}
        </div>

        {/* Create / Edit Form */}
        {isCreating && (
          <div className="bg-card border border-border p-8 rounded-xl space-y-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                <Sparkles size={16} className="text-primary animate-pulse" /> 
                {editingId ? 'Modify Existing Promotion' : 'Add New Promotion Rule'}
              </h2>
              <span className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest">Step-by-Step Setup</span>
            </div>

            {/* Step 1: Select Trigger Product */}
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-black uppercase tracking-[0.25em] text-primary block">
                  1. If Customer Buys This Product (Trigger Item)
                </label>
                <p className="text-[10px] text-muted-foreground mt-1">Select the item they need to add to their cart to qualify for the offer.</p>
              </div>

              {/* Trigger Search controls */}
              <div className="bg-background border border-border rounded-lg p-2 flex flex-col sm:flex-row gap-2 max-w-2xl">
                <div className="relative flex-1 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary transition-colors" size={14} />
                  <input
                    value={triggerSearch}
                    onChange={e => setTriggerSearch(e.target.value)}
                    placeholder="SEARCH PRODUCTS..."
                    className="w-full bg-transparent pl-10 pr-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none"
                  />
                </div>
                <div className="relative min-w-[180px]">
                  <select
                    value={triggerCategory}
                    onChange={e => setTriggerCategory(e.target.value)}
                    className="w-full bg-background border border-border/50 px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none rounded focus:border-primary/50 appearance-none text-foreground cursor-pointer"
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
              </div>

              {/* Scrollable list with Product Mini Views (Single Select) */}
              <div className="h-64 overflow-y-auto border border-border rounded-lg bg-background p-2 space-y-1 relative max-w-3xl">
                {isLoadingTrigger ? (
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="animate-spin text-primary" size={24} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary/40">Syncing Registry...</span>
                    </div>
                  </div>
                ) : null}

                {triggerProducts.length === 0 && !isLoadingTrigger ? (
                  <div className="p-12 text-center text-[10px] text-muted-foreground/40 uppercase tracking-widest font-black">
                    No matching products found.
                  </div>
                ) : (
                  triggerProducts.map(p => {
                    const isSelected = String(p.id) === triggerProductId
                    return (
                      <div 
                        key={p.id}
                        onClick={() => setTriggerProductId(String(p.id))}
                        className={`flex items-center gap-4 p-3 rounded cursor-pointer transition-all border ${isSelected ? 'bg-primary/10 border-primary/40 shadow-sm' : 'hover:bg-muted/50 border-transparent'}`}
                      >
                        <div className="w-12 h-12 relative rounded bg-white overflow-hidden shrink-0 border border-border/50">
                          <Image src={p.imageUrl} alt={p.name} fill className="object-contain p-1" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[11px] font-black uppercase tracking-tight truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>{p.name}</p>
                          <p className="text-[10px] font-mono font-bold text-muted-foreground/60 mt-0.5">₹{p.price}</p>
                        </div>
                        <div className="shrink-0 pr-2">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary scale-110' : 'border-muted-foreground/20'}`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-black" />}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
              {triggerProductId && (
                <p className="text-[10px] uppercase font-black tracking-widest text-primary">
                  Selected Trigger Product: {getProduct(Number(triggerProductId))?.name}
                </p>
              )}
            </div>

            {/* Step 2: Configure Quantities and Type */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-border/50">
              
              {/* Buy Quantity */}
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-[0.25em] text-primary block">
                  2. Quantity Customer Must Buy
                </label>
                <input
                  type="number"
                  min="1"
                  value={buyQuantity}
                  onChange={e => setBuyQuantity(parseInt(e.target.value) || 1)}
                  className="w-full bg-background border border-border px-4 py-3 text-xs font-mono font-bold outline-none rounded-lg focus:border-primary/50 text-foreground"
                  placeholder="e.g. 1"
                />
                <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider leading-relaxed">
                  How many units they must buy to unlock the free item.
                </p>
              </div>

              {/* Offer Type */}
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-[0.25em] text-primary block">
                  3. What is the Reward?
                </label>
                <select
                  value={offerType}
                  onChange={e => setOfferType(e.target.value as any)}
                  className="w-full bg-background border border-border px-4 py-3 text-xs font-bold uppercase tracking-widest outline-none rounded-lg focus:border-primary/50 appearance-none cursor-pointer text-foreground"
                >
                  <option value="bogo">Get another unit of the same product for free (BOGO)</option>
                  <option value="gift">Get a different product from the store for free (Free Gift)</option>
                </select>
                <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider leading-relaxed">
                  Choose BOGO for buy 1 get 1, or gift to give a different product away.
                </p>
              </div>

              {/* Status Toggle */}
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-[0.25em] text-primary block">
                  4. Initial visibility status
                </label>
                <select
                  value={isActive ? 'true' : 'false'}
                  onChange={e => setIsActive(e.target.value === 'true')}
                  className="w-full bg-background border border-border px-4 py-3 text-xs font-bold uppercase tracking-widest outline-none rounded-lg focus:border-primary/50 appearance-none cursor-pointer text-foreground"
                >
                  <option value="true">Live (Active on store immediately)</option>
                  <option value="false">Draft (Hidden / Inactive)</option>
                </select>
                <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider leading-relaxed">
                  Deselect to work on it as a draft before making it public.
                </p>
              </div>
            </div>

            {/* Step 3: Select Free Gift Product (Only for Gift Offer Type) */}
            {offerType === 'gift' && (
              <div className="space-y-4 pt-6 border-t border-border/50">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-[0.25em] text-primary block">
                    5. Select the Free Gift Product(s)
                  </label>
                  <p className="text-[10px] text-muted-foreground mt-1">Select one or more items that will be given 100% free at checkout when they buy the trigger item.</p>
                </div>

                {/* Gift Search controls */}
                <div className="bg-background border border-border rounded-lg p-2 flex flex-col sm:flex-row gap-2 max-w-2xl">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary transition-colors" size={14} />
                    <input
                      value={giftSearch}
                      onChange={e => setGiftSearch(e.target.value)}
                      placeholder="SEARCH GIFT PRODUCTS..."
                      className="w-full bg-transparent pl-10 pr-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none"
                    />
                  </div>
                  <div className="relative min-w-[180px]">
                    <select
                      value={giftCategory}
                      onChange={e => setGiftCategory(e.target.value)}
                      className="w-full bg-background border border-border/50 px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none rounded focus:border-primary/50 appearance-none text-foreground cursor-pointer"
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
                </div>

                {/* Scrollable list with Product Mini Views (Multi-Select) */}
                <div className="h-64 overflow-y-auto border border-border rounded-lg bg-background p-2 space-y-1 relative max-w-3xl">
                  {isLoadingGift ? (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="animate-spin text-primary" size={24} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/40">Syncing Registry...</span>
                      </div>
                    </div>
                  ) : null}

                  {giftProducts.length === 0 && !isLoadingGift ? (
                    <div className="p-12 text-center text-[10px] text-muted-foreground/40 uppercase tracking-widest font-black">
                      No matching products found.
                    </div>
                  ) : (
                    giftProducts.map(p => {
                      const isSelected = selectedFreeIds.includes(Number(p.id))
                      return (
                        <div 
                          key={p.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedFreeIds(selectedFreeIds.filter(id => id !== Number(p.id)))
                            } else {
                              setSelectedFreeIds([...selectedFreeIds, Number(p.id)])
                            }
                          }}
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
                              {isSelected && <div className="w-2.5 h-2.5 bg-black rounded-[2px]" />}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
                {selectedFreeIds.length > 0 && (
                  <p className="text-[10px] uppercase font-black tracking-widest text-primary">
                    Selected Free gifts ({selectedFreeIds.length}): {selectedFreeIds.map(id => getProduct(id)?.name).join(', ')}
                  </p>
                )}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-border">
              <Button variant="ghost" onClick={() => { setIsCreating(false); setEditingId(null); setTriggerProductId(''); setSelectedFreeIds([]); }} className="text-[10px] font-black uppercase tracking-widest">
                Cancel
              </Button>
              <Button onClick={handleSave} className="text-[10px] font-black uppercase tracking-widest px-8 shadow-lg shadow-primary/10">
                {editingId ? 'Update Offer' : 'Create Offer'}
              </Button>
            </div>
          </div>
        )}

        {/* Active Offers Registry List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground">Active Promotional Registry</h2>
            <span className="text-[10px] font-mono text-muted-foreground/40 font-bold">Total Offers: {offers.length}</span>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-primary" size={32} />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">Accessing Promotional Registry...</p>
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-border rounded-xl bg-muted/5">
              <Gift size={48} className="mx-auto text-muted-foreground/10 mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">No Product Offer Rules Configured Yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {offers.map(offer => {
                const triggerProduct = getProduct(offer.productId)
                let freeIds: number[] = []
                try { freeIds = JSON.parse(offer.freeProductIds) } catch(e) {}
                const isBogo = freeIds.length === 1 && freeIds[0] === offer.productId

                return (
                  <div 
                    key={offer.id} 
                    className={`bg-card border p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${offer.isActive ? 'border-primary/20 shadow-xl shadow-black/5' : 'border-border opacity-40 grayscale-[40%]'}`}
                  >
                    
                    {/* Visual Mini Views timeline */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 flex-1 min-w-0">
                      
                      {/* Left: Trigger product view */}
                      {triggerProduct && (
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-14 h-14 relative rounded bg-white overflow-hidden shrink-0 border border-border/50">
                            <Image src={triggerProduct.imageUrl} alt={triggerProduct.name} fill className="object-contain p-1" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[9px] text-muted-foreground/40 uppercase font-black tracking-widest block mb-0.5">When Customer Buys ({offer.buyQuantity})</span>
                            <h3 className="text-xs font-black uppercase tracking-tight text-foreground truncate max-w-[200px]" title={triggerProduct.name}>
                              {triggerProduct.name}
                            </h3>
                          </div>
                        </div>
                      )}

                      {/* Middle: Flow Indicator Arrow */}
                      <div className="hidden sm:flex shrink-0 w-10 h-10 rounded-full bg-muted items-center justify-center border border-border/50">
                        {isBogo ? <RefreshCw size={14} className="text-primary" /> : <ArrowRight size={14} className="text-foreground/60" />}
                      </div>

                      {/* Right: Reward Free Gift view */}
                      <div className="flex items-center gap-3 min-w-0">
                        {isBogo ? (
                          triggerProduct && (
                            <>
                              <div className="w-14 h-14 relative rounded bg-white overflow-hidden shrink-0 border border-primary/20">
                                <Image src={triggerProduct.imageUrl} alt={triggerProduct.name} fill className="object-contain p-1 opacity-70" />
                                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                                  <span className="bg-primary text-black text-[8px] font-black uppercase px-1 rounded-sm tracking-wider">FREE</span>
                                </div>
                              </div>
                              <div className="min-w-0">
                                <span className="text-[9px] text-primary uppercase font-black tracking-widest block mb-0.5">Get 1 Free (BOGO)</span>
                                <h3 className="text-xs font-black uppercase tracking-tight text-primary truncate max-w-[200px]">
                                  ANOTHER {triggerProduct.name}
                                </h3>
                              </div>
                            </>
                          )
                        ) : (
                          <div className="flex -space-x-4 overflow-hidden shrink-0 pr-1">
                            {freeIds.map(fid => {
                              const giftProduct = getProduct(fid)
                              if (!giftProduct) return null
                              return (
                                <div key={fid} className="w-14 h-14 relative rounded bg-white overflow-hidden shrink-0 border border-primary/20 shadow-md" title={giftProduct.name}>
                                  <Image src={giftProduct.imageUrl} alt={giftProduct.name} fill className="object-contain p-1" />
                                  <div className="absolute inset-0 bg-primary/5 flex items-end justify-center pb-0.5">
                                    <span className="bg-primary text-black text-[6px] font-black uppercase px-1 rounded-sm">GIFT</span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                        
                        {!isBogo && (
                          <div className="min-w-0">
                            <span className="text-[9px] text-primary uppercase font-black tracking-widest block mb-0.5">Get Gift(s) Free</span>
                            <h3 className="text-xs font-black uppercase tracking-tight text-foreground truncate max-w-[220px]">
                              {freeIds.map(fid => getProduct(fid)?.name).filter(Boolean).join(' & ')}
                            </h3>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Operational controls */}
                    <div className="flex items-center gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-border/40">
                      
                      {/* Edit Button (copied layout from combo-deals) */}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(offer)}
                        className="text-[9px] font-black uppercase tracking-widest h-10 px-6 text-foreground border-white/10 hover:border-primary/50"
                      >
                        EDIT
                      </Button>

                      {/* Active Status Badge */}
                      {offer.isActive ? (
                        <span className="bg-primary/10 text-primary text-[8px] px-2.5 py-1 rounded uppercase tracking-[0.2em] font-black border border-primary/20">
                          Operational
                        </span>
                      ) : (
                        <span className="bg-muted text-muted-foreground/60 text-[8px] px-2.5 py-1 rounded uppercase tracking-[0.2em] font-black border border-border">
                          Draft (Hidden)
                        </span>
                      )}

                      {/* Status Toggle Switch */}
                      <button 
                        onClick={() => handleToggle(offer)}
                        className={`p-2 transition-colors rounded-full hover:bg-muted ${offer.isActive ? 'text-primary' : 'text-muted-foreground/40'}`}
                        title={offer.isActive ? 'Deactivate and Hide Offer' : 'Activate and Publish Offer'}
                      >
                        {offer.isActive ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                      </button>

                      {/* Delete button */}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(offer.id)}
                        className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-full w-10 h-10 transition-all"
                        title="Delete Promotion"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>

                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  )
}
