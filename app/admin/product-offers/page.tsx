'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/layout'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Tag, Percent, AlertCircle, Loader2, ToggleLeft, ToggleRight, Sparkles, Gift } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api-client'

interface ProductOffer {
  id: number
  productId: number
  buyQuantity: number
  freeProductIds: string // stringified JSON array
  isActive: boolean
}

export default function AdminProductOffersPage() {
  const [offers, setOffers] = useState<ProductOffer[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  
  // Form states
  const [triggerProductId, setTriggerProductId] = useState<string>('')
  const [buyQuantity, setBuyQuantity] = useState<number>(1)
  const [offerType, setOfferType] = useState<'bogo' | 'gift'>('bogo')
  const [selectedFreeIds, setSelectedFreeIds] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isActive, setIsActive] = useState(true)

  const fetchOffers = async () => {
    try {
      setLoading(true)
      const res = await api.get<ProductOffer[]>('/settings/product-offers')
      setOffers(Array.isArray(res) ? res : [])
    } catch (error: any) {
      toast.error('Failed to fetch product offers')
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await api.get<any>('/products?limit=1000')
      const list = res.data || (Array.isArray(res) ? res : [])
      setAllProducts(list)
    } catch (error) {
      console.error('Failed to fetch products', error)
    }
  }

  useEffect(() => {
    fetchOffers()
    fetchProducts()
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
    if (!triggerProductId) return toast.error('Please select a trigger product')
    if (buyQuantity < 1) return toast.error('Purchase volume must be at least 1')
    if (selectedFreeIds.length === 0) return toast.error('Please select at least one free product/gift')

    try {
      const payload = {
        productId: Number(triggerProductId),
        buyQuantity,
        freeProductIds: JSON.stringify(selectedFreeIds),
        isActive
      }

      await api.post('/settings/product-offers', payload)
      toast.success('Product Offer successfully created!')
      setIsCreating(false)
      // Reset form
      setTriggerProductId('')
      setBuyQuantity(1)
      setOfferType('bogo')
      setSelectedFreeIds([])
      setSearchTerm('')
      fetchOffers()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create product offer')
    }
  }

  const handleToggle = async (offer: ProductOffer) => {
    try {
      await api.put(`/settings/product-offers/${offer.id}`, { isActive: !offer.isActive })
      setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, isActive: !o.isActive } : o))
      toast.success(`Offer ${!offer.isActive ? 'activated' : 'deactivated'}`)
    } catch (error: any) {
      toast.error('Failed to update offer status')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product offer?')) return
    try {
      await api.delete(`/settings/product-offers/${id}`)
      setOffers(prev => prev.filter(o => o.id !== id))
      toast.success('Offer successfully deleted')
    } catch (error: any) {
      toast.error('Failed to delete offer')
    }
  }

  const getProductName = (id: number) => {
    const found = allProducts.find(p => Number(p.id) === id)
    return found ? (found.title || found.name).toUpperCase() : `PRODUCT #${id}`
  }

  const getFreeProductsNames = (freeJson: string) => {
    try {
      const ids: number[] = JSON.parse(freeJson)
      return ids.map(id => getProductName(id)).join(' & ')
    } catch (e) {
      return 'UNKNOWN GIFT'
    }
  }

  const filteredFreeProductOptions = allProducts.filter(p => {
    const name = (p.title || p.name || '').toLowerCase()
    return name.includes(searchTerm.toLowerCase())
  })

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-5xl mx-auto pb-20">
        <div className="flex items-end justify-between border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-widest text-foreground">Product Offers</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] mt-2">Configure BOGO (Buy 1 Get 1) and Cross-Product Free Gift rules</p>
          </div>
          {!isCreating && (
            <Button onClick={() => setIsCreating(true)} className="bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[10px]">
              <Plus size={16} className="mr-2" /> New offer protocol
            </Button>
          )}
        </div>

        {isCreating && (
          <div className="bg-card border border-border p-8 rounded-xl space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <h2 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
              <Sparkles size={16} className="text-primary animate-pulse" /> Create Product Offer Protocol
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Trigger product select */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Trigger Product (Buy)</label>
                <select
                  value={triggerProductId}
                  onChange={e => setTriggerProductId(e.target.value)}
                  className="w-full bg-background border border-border px-4 py-3 text-xs font-bold uppercase tracking-widest outline-none rounded-lg focus:border-primary/50 appearance-none cursor-pointer"
                >
                  <option value="">SELECT TRIGGER PRODUCT...</option>
                  {allProducts.map(p => (
                    <option key={p.id} value={p.id}>{(p.title || p.name).toUpperCase()} (₹{p.price})</option>
                  ))}
                </select>
              </div>

              {/* Purchase Volume */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Trigger Volume Required</label>
                <input
                  type="number"
                  min="1"
                  value={buyQuantity}
                  onChange={e => setBuyQuantity(parseInt(e.target.value) || 1)}
                  className="w-full bg-background border border-border px-4 py-3 text-xs font-mono font-bold outline-none rounded-lg focus:border-primary/50"
                  placeholder="e.g. 1"
                />
              </div>

              {/* Offer Type */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Promo Type</label>
                <select
                  value={offerType}
                  onChange={e => setOfferType(e.target.value as any)}
                  className="w-full bg-background border border-border px-4 py-3 text-xs font-bold uppercase tracking-widest outline-none rounded-lg focus:border-primary/50 appearance-none cursor-pointer"
                >
                  <option value="bogo">BOGO (SAME PRODUCT FREE)</option>
                  <option value="gift">CROSS-PRODUCT (DIFFERENT FREE GIFT)</option>
                </select>
              </div>

              {/* Status Toggle */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Initial Status</label>
                <select
                  value={isActive ? 'true' : 'false'}
                  onChange={e => setIsActive(e.target.value === 'true')}
                  className="w-full bg-background border border-border px-4 py-3 text-xs font-bold uppercase tracking-widest outline-none rounded-lg focus:border-primary/50 appearance-none cursor-pointer"
                >
                  <option value="true">ACTIVE (LIVE ON SITE)</option>
                  <option value="false">DRAFT / INACTIVE</option>
                </select>
              </div>
            </div>

            {/* Checklist of free products (only if cross-product/gift offer type) */}
            {offerType === 'gift' && (
              <div className="space-y-3 pt-4 border-t border-border/50">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground block">Select Free Gift Products</label>
                <div className="relative group max-w-md">
                  <input
                    type="text"
                    placeholder="SEARCH GIFT PRODUCTS..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-background border border-border px-4 py-3 text-xs font-bold uppercase tracking-widest outline-none rounded-lg focus:border-primary/50"
                  />
                </div>
                <div className="border border-border rounded-xl bg-background/50 p-4 max-h-60 overflow-y-auto space-y-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                  {filteredFreeProductOptions.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground uppercase font-bold col-span-2">No matching products found</p>
                  ) : (
                    filteredFreeProductOptions.map(p => {
                      const isChecked = selectedFreeIds.includes(Number(p.id))
                      return (
                        <label key={p.id} className="flex items-center gap-3 text-[10px] uppercase tracking-wider font-bold cursor-pointer hover:text-primary transition-colors py-1.5 px-2.5 rounded hover:bg-muted/15">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedFreeIds(selectedFreeIds.filter(id => id !== Number(p.id)))
                              } else {
                                setSelectedFreeIds([...selectedFreeIds, Number(p.id)])
                              }
                            }}
                            className="rounded border-border text-primary focus:ring-primary/20 cursor-pointer w-4 h-4"
                          />
                          <span className="truncate flex-1">{(p.title || p.name).toUpperCase()}</span>
                          <span className="font-mono text-muted-foreground/60 shrink-0">₹{p.price}</span>
                        </label>
                      )
                    })
                  )}
                </div>
                {selectedFreeIds.length > 0 && (
                  <p className="text-[9px] uppercase tracking-widest font-black text-primary">
                    Selected freebies ({selectedFreeIds.length}): {selectedFreeIds.map(id => getProductName(id)).join(', ')}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t border-border">
              <Button variant="ghost" onClick={() => setIsCreating(false)} className="text-[10px] font-black uppercase tracking-widest">Abort</Button>
              <Button onClick={handleSave} className="text-[10px] font-black uppercase tracking-widest px-8 shadow-lg shadow-primary/10">Establish Protocol</Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-primary" size={32} />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">Accessing Promotional Registry...</p>
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-border rounded-xl bg-muted/5">
              <Gift size={48} className="mx-auto text-muted-foreground/10 mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">No Product Offer Protocols Configured</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {offers.map(offer => {
                let freeIds: number[] = []
                try { freeIds = JSON.parse(offer.freeProductIds) } catch(e) {}
                const isBogo = freeIds.length === 1 && freeIds[0] === offer.productId

                return (
                  <div key={offer.id} className={`bg-card border p-6 rounded-xl flex items-center justify-between gap-6 transition-all ${offer.isActive ? 'border-primary/20 shadow-lg' : 'border-border opacity-50 grayscale'}`}>
                    <div className="flex items-center gap-6 flex-1 min-w-0">
                      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center border border-border/50 shrink-0">
                        <Gift size={20} className={offer.isActive ? 'text-primary' : 'text-muted-foreground'} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-black uppercase tracking-widest text-foreground truncate">
                          {getProductName(offer.productId)}
                        </h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                          IF BUY {offer.buyQuantity} UNIT{offer.buyQuantity > 1 ? 'S' : ''} → GET {isBogo ? '1 SAME PRODUCT' : getFreeProductsNames(offer.freeProductIds)} FREE
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="bg-muted/30 px-6 py-2 rounded-lg border border-white/5 text-center hidden sm:block">
                        <span className="text-[9px] text-muted-foreground/40 uppercase tracking-widest block mb-0.5">Ratio</span>
                        <span className="text-xs font-mono font-bold text-foreground">{offer.buyQuantity}:1</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleToggle(offer)}
                          className={`p-2 transition-colors ${offer.isActive ? 'text-primary' : 'text-muted-foreground/40'}`}
                          title={offer.isActive ? 'Deactivate Offer' : 'Activate Offer'}
                        >
                          {offer.isActive ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                        </button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(offer.id)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                          title="Delete Protocol"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
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
