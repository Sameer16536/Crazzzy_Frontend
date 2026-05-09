'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/layout'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Tag, Percent, AlertCircle, Loader2, ToggleLeft, ToggleRight } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api-client'
import { useCatalog } from '@/lib/catalog/catalog-context'

interface CategoryOffer {
  id: number
  categorySlug: string
  buyQuantity: number
  getQuantity: number
  isActive: boolean
}

export default function AdminCategoryOffersPage() {
  const [offers, setOffers] = useState<CategoryOffer[]>([])
  const [allCategories, setAllCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    categorySlug: '',
    buyQuantity: 2,
    getQuantity: 1,
    isActive: true
  })

  const fetchOffers = async () => {
    try {
      setLoading(true)
      const res = await api.get<CategoryOffer[]>('/category-offers')
      setOffers(Array.isArray(res) ? res : [])
    } catch (error: any) {
      toast.error('Failed to fetch offers')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await api.get<any>('/categories')
      const list = res.data || (Array.isArray(res) ? res : [])
      setAllCategories(list)
    } catch (error) {
      console.error('Failed to fetch categories', error)
    }
  }

  useEffect(() => {
    fetchOffers()
    fetchCategories()
  }, [])

  const handleSave = async () => {
    if (!formData.categorySlug) return toast.error('Please select a category')
    try {
      await api.post('/category-offers', formData)
      toast.success('Automatic offer established')
      setIsCreating(false)
      fetchOffers()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create offer')
    }
  }

  const handleToggle = async (offer: CategoryOffer) => {
    try {
      await api.put(`/category-offers/${offer.id}`, { isActive: !offer.isActive })
      setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, isActive: !o.isActive } : o))
      toast.success(`Offer ${!offer.isActive ? 'activated' : 'deactivated'}`)
    } catch (error: any) {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this offer?')) return
    try {
      await api.delete(`/category-offers/${id}`)
      setOffers(prev => prev.filter(o => o.id !== id))
      toast.success('Offer removed from registry')
    } catch (error: any) {
      toast.error('Failed to delete offer')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-5xl mx-auto pb-20">
        <div className="flex items-end justify-between border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-widest text-foreground">Category Offers</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] mt-2">Manage automatic "Buy X Get Y Free" rules per category</p>
          </div>
          {!isCreating && (
            <Button onClick={() => setIsCreating(true)} className="bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[10px]">
              <Plus size={16} className="mr-2" /> New Protocol
            </Button>
          )}
        </div>

        {isCreating && (
          <div className="bg-card border border-border p-8 rounded-xl space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <h2 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
              <Percent size={16} className="text-primary" /> Configure New Automatic Offer
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Target Sector</label>
                <select
                  value={formData.categorySlug}
                  onChange={e => setFormData({ ...formData, categorySlug: e.target.value })}
                  className="w-full bg-background border border-border px-4 py-3 text-xs font-bold uppercase tracking-widest outline-none rounded-lg focus:border-primary/50 appearance-none cursor-pointer"
                >
                  <option value="">SELECT CATEGORY...</option>
                  {allCategories.map(c => (
                    <option key={c.id} value={c.slug}>{c.name.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Purchase Volume (Buy)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.buyQuantity}
                  onChange={e => setFormData({ ...formData, buyQuantity: parseInt(e.target.value) || 0 })}
                  className="w-full bg-background border border-border px-4 py-3 text-xs font-mono font-bold outline-none rounded-lg focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Bonus Yield (Get Free)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.getQuantity}
                  onChange={e => setFormData({ ...formData, getQuantity: parseInt(e.target.value) || 0 })}
                  className="w-full bg-background border border-border px-4 py-3 text-xs font-mono font-bold outline-none rounded-lg focus:border-primary/50 text-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-border">
              <Button variant="ghost" onClick={() => setIsCreating(false)} className="text-[10px] font-black uppercase tracking-widest">Abort</Button>
              <Button onClick={handleSave} className="text-[10px] font-black uppercase tracking-widest px-8 shadow-lg shadow-primary/10">Execute Protocol</Button>
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
              <Percent size={48} className="mx-auto text-muted-foreground/10 mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">No Automatic Offer Protocols Identified</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {offers.map(offer => (
                <div key={offer.id} className={`bg-card border p-6 rounded-xl flex items-center justify-between gap-6 transition-all ${offer.isActive ? 'border-primary/20 shadow-lg' : 'border-border opacity-50 grayscale'}`}>
                  <div className="flex items-center gap-6 flex-1">
                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center border border-border/50">
                      <Tag size={20} className={offer.isActive ? 'text-primary' : 'text-muted-foreground'} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
                        {allCategories.find(c => c.slug === offer.categorySlug)?.name || offer.categorySlug.replace('-', ' ')}
                      </h3>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                        PROTOCOL: BUY {offer.buyQuantity} GET {offer.getQuantity} FREE
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="bg-muted/30 px-6 py-2 rounded-lg border border-white/5 text-center">
                      <span className="text-[9px] text-muted-foreground/40 uppercase tracking-widest block mb-0.5">Ratio</span>
                      <span className="text-xs font-mono font-bold text-foreground">{offer.buyQuantity}:{offer.getQuantity}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleToggle(offer)}
                        className={`p-2 transition-colors ${offer.isActive ? 'text-primary' : 'text-muted-foreground/40'}`}
                      >
                        {offer.isActive ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                      </button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(offer.id)}
                        className="w-10 h-10 text-red-500/40 hover:text-red-500 hover:bg-red-500/5 transition-colors"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Warning/Info Box */}
        <div className="bg-muted/20 border border-border p-6 rounded-xl flex gap-4 items-start">
          <AlertCircle size={20} className="text-primary/60 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[11px] font-black uppercase tracking-widest text-foreground/80">Operational Intelligence</p>
            <p className="text-[10px] leading-relaxed text-muted-foreground uppercase tracking-wide font-medium">
              Category offers are applied automatically in the cart. They operate on a mix-and-match basis within the same category and variant (size). 
              If multiple offers overlap, the system identifies the most beneficial protocol for the client.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
