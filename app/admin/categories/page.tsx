'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/admin/layout'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import { Tags, Info, Package, Eye, EyeOff, Loader2, RefreshCw, AlertTriangle } from 'lucide-react'
import Image from 'next/image'

interface Category {
  id: number
  name: string
  slug: string
  imageUrl: string | null
  parentId: number | null
  isActive: boolean
  product_count: number
}

function ToggleSwitch({ checked, onChange, loading }: { checked: boolean; onChange: () => void; loading: boolean }) {
  return (
    <button
      onClick={onChange}
      disabled={loading}
      className={`
        relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
        ${checked ? 'bg-primary' : 'bg-muted-foreground/20'}
        ${loading ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:opacity-90'}
      `}
      aria-label={checked ? 'Disable category' : 'Enable category'}
    >
      <span
        className={`
          inline-flex items-center justify-center w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300
          ${checked ? 'translate-x-8' : 'translate-x-1'}
        `}
      >
        {loading && <Loader2 size={10} className="animate-spin text-muted-foreground" />}
      </span>
    </button>
  )
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set())

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get<any>('/admin/categories')
      const list: Category[] = Array.isArray(res?.data) ? res.data : []
      setCategories(list)
    } catch (err: any) {
      toast.error(err.message || 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleToggle = async (cat: Category) => {
    setTogglingIds(prev => new Set(prev).add(cat.id))
    setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, isActive: !c.isActive } : c))

    try {
      const res = await api.patch<any>(`/admin/categories/${cat.id}/toggle`, {})
      toast.success(res.message || `Category ${res.isActive ? 'enabled' : 'disabled'}`, {
        icon: res.isActive ? '🟢' : '🔴',
        description: res.isActive
          ? 'Products in this category are now visible on the storefront.'
          : 'Products in this category are hidden from the storefront.'
      })
    } catch (err: any) {
      setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, isActive: cat.isActive } : c))
      toast.error(err.message || 'Failed to update category status')
    } finally {
      setTogglingIds(prev => { const next = new Set(prev); next.delete(cat.id); return next })
    }
  }

  const parents = categories.filter(c => !c.parentId)
  const children = categories.filter(c => c.parentId)
  const activeCount = categories.filter(c => c.isActive).length
  const inactiveCount = categories.filter(c => !c.isActive).length

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-6xl mx-auto pb-20">
        <div className="flex items-end justify-between border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-widest text-foreground">Category Visibility</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] mt-2">
              Enable or disable entire categories — hides all their products from the storefront
            </p>
          </div>
          <button
            onClick={fetchCategories}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-border text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors disabled:opacity-40"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card border border-border p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-muted/50 flex items-center justify-center rounded-lg">
              <Tags size={18} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">{categories.length}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Total</p>
            </div>
          </div>
          <div className="bg-card border border-primary/30 p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded-lg">
              <Eye size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-black text-primary">{activeCount}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Active</p>
            </div>
          </div>
          <div className="bg-card border border-destructive/20 p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-destructive/10 flex items-center justify-center rounded-lg">
              <EyeOff size={18} className="text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-black text-destructive">{inactiveCount}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Hidden</p>
            </div>
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/20 p-4 flex gap-4 items-start">
          <Info className="text-primary mt-0.5 shrink-0" size={18} />
          <p className="text-xs text-primary/80 leading-relaxed font-medium">
            <strong>How this works:</strong> Disabling a category immediately hides it and all its products from the storefront. Customers cannot browse, search, or purchase those products. The data is not deleted — re-enabling restores everything instantly.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Loading categories...</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground border-b border-border pb-3">Parent Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {parents.map(cat => {
                  const isToggling = togglingIds.has(cat.id)
                  const subcategories = children.filter(c => c.parentId === cat.id)
                  return (
                    <div key={cat.id} className={`relative bg-card border rounded-xl overflow-hidden transition-all duration-300 ${cat.isActive ? 'border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5' : 'border-border/50 opacity-70 bg-muted/30'}`}>
                      {!cat.isActive && (
                        <div className="absolute top-0 left-0 right-0 bg-destructive/10 border-b border-destructive/20 px-4 py-1.5 flex items-center gap-2">
                          <AlertTriangle size={11} className="text-destructive" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-destructive">Hidden from storefront</span>
                        </div>
                      )}
                      <div className={`p-6 ${!cat.isActive ? 'pt-10' : ''}`}>
                        <div className="flex items-start gap-4 mb-5">
                          <div className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 border ${cat.isActive ? 'border-border' : 'border-border/30 grayscale'}`}>
                            {cat.imageUrl ? (
                              <Image src={cat.imageUrl} alt={cat.name} width={56} height={56} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-muted/50 flex items-center justify-center">
                                <Tags size={20} className="text-muted-foreground/40" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground truncate">{cat.name}</h3>
                            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-[0.15em] mt-0.5 truncate">/{cat.slug}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Package size={11} className="text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{cat.product_count} products</span>
                            </div>
                          </div>
                        </div>
                        {subcategories.length > 0 && (
                          <div className="mb-5 space-y-1">
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground/50 font-bold mb-2">Subcategories</p>
                            {subcategories.map(sub => (
                              <div key={sub.id} className="flex items-center justify-between bg-muted/30 px-3 py-2 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full ${sub.isActive ? 'bg-primary' : 'bg-destructive'}`} />
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/70">{sub.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] text-muted-foreground">{sub.product_count} items</span>
                                  <ToggleSwitch checked={sub.isActive} onChange={() => handleToggle(sub)} loading={togglingIds.has(sub.id)} />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full transition-colors ${cat.isActive ? 'bg-primary animate-pulse' : 'bg-destructive/60'}`} />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${cat.isActive ? 'text-primary' : 'text-destructive/70'}`}>
                              {cat.isActive ? 'Visible' : 'Hidden'}
                            </span>
                          </div>
                          <ToggleSwitch checked={cat.isActive} onChange={() => handleToggle(cat)} loading={isToggling} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}