'use client'

import { useState } from 'react'
import { AdminLayout } from '@/components/admin/layout'
import { useCatalog } from '@/lib/catalog/catalog-context'
import { useCustomFilters } from '@/hooks/use-custom-filters'
import { Button } from '@/components/ui/button'
import { Plus, X, Tags, Info } from 'lucide-react'

export default function AdminCategoriesPage() {
  const { data } = useCatalog()
  const { getFilters, setCategoryFilters, mounted } = useCustomFilters()

  const [inputVals, setInputVals] = useState<Record<string, string>>({})

  // Only consider parent categories or items from the design data
  const categories = data?.categories.filter(c => !c.parentId) ?? []

  const handleAdd = (slug: string) => {
    const val = inputVals[slug]?.trim()
    if (!val) return
    const current = getFilters(slug)
    if (!current.includes(val)) {
      setCategoryFilters(slug, [...current, val])
    }
    setInputVals(prev => ({ ...prev, [slug]: '' }))
  }

  const handleRemove = (slug: string, tagToRemove: string) => {
    const current = getFilters(slug)
    setCategoryFilters(slug, current.filter(t => t !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, slug: string) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd(slug)
    }
  }

  if (!mounted) return null

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-5xl mx-auto pb-20">
        <div className="flex items-end justify-between border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-widest text-foreground">Category Filters</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] mt-2">Manage custom search chips for the shop page</p>
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-4 items-start">
          <Info className="text-primary mt-0.5 shrink-0" size={20} />
          <p className="text-xs text-primary/80 leading-relaxed font-medium">
            <strong>How this works:</strong> Add filter keywords for a specific category. When a user selects this category on the shop page, these keywords will appear as quick-filter chips. Clicking a chip will filter the visible products to those matching the keyword.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map(cat => {
            const filters = getFilters(cat.slug)
            return (
              <div key={cat.id} className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded bg-muted/50 flex items-center justify-center">
                    <Tags size={18} className="text-muted-foreground" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-foreground">{cat.name}</h2>
                    <p className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.2em] mt-0.5">Slug: {cat.slug}</p>
                  </div>
                </div>

                <div className="flex-1 space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {filters.length === 0 ? (
                      <span className="text-[10px] text-muted-foreground/40 italic uppercase tracking-widest">No filters added</span>
                    ) : (
                      filters.map(filter => (
                        <div key={filter} className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full pl-3 pr-1 py-1 text-[10px] font-bold uppercase tracking-widest">
                          {filter}
                          <button
                            onClick={() => handleRemove(cat.slug, filter)}
                            className="w-5 h-5 rounded-full hover:bg-primary/20 flex items-center justify-center transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-auto pt-4 border-t border-border/50">
                    <input
                      value={inputVals[cat.slug] || ''}
                      onChange={e => setInputVals(prev => ({ ...prev, [cat.slug]: e.target.value }))}
                      onKeyDown={e => handleKeyDown(e, cat.slug)}
                      placeholder="Add a filter (e.g. Naruto)"
                      className="flex-1 bg-background border border-border rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-widest outline-none focus:border-primary/50 transition-colors"
                    />
                    <Button 
                      onClick={() => handleAdd(cat.slug)}
                      size="icon"
                      variant="outline"
                      className="shrink-0 h-10 w-10 border-primary/20 text-primary hover:bg-primary/10"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AdminLayout>
  )
}
