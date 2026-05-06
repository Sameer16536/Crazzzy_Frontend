'use client'

import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api-client'
import { Zap, Search, Loader2, ArrowRight, X, Clock, AlertTriangle, CalendarClock } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { AdminLayout } from '@/components/admin/layout'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getRemainingMs(endTime: string | null | undefined): number {
  if (!endTime) return Infinity
  return new Date(endTime).getTime() - Date.now()
}

function formatCountdown(ms: number): string {
  if (ms === Infinity) return 'No expiry set'
  if (ms <= 0) return 'EXPIRED'
  const totalSeconds = Math.floor(ms / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** Returns a datetime-local string (YYYY-MM-DDTHH:mm) rounded to the minute */
function toDatetimeLocal(isoString?: string): string {
  const d = isoString ? new Date(isoString) : new Date(Date.now() + 24 * 60 * 60 * 1000) // default: 24h from now
  // Adjust for local timezone
  const offset = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - offset).toISOString().slice(0, 16)
}

/** Returns ISO string from datetime-local input value */
function fromDatetimeLocal(value: string): string {
  return new Date(value).toISOString()
}

/** Get minimum datetime-local string (current time + 1 minute) */
function getMinDatetime(): string {
  return toDatetimeLocal(new Date(Date.now() + 60 * 1000).toISOString())
}

// ─── Live Countdown Badge ─────────────────────────────────────────────────────

function LiveCountdown({ dealEndTime }: { dealEndTime: string | null | undefined }) {
  const [display, setDisplay] = useState(() => formatCountdown(getRemainingMs(dealEndTime)))
  const [expired, setExpired] = useState(() => dealEndTime ? getRemainingMs(dealEndTime) <= 0 : false)

  useEffect(() => {
    if (!dealEndTime) {
      setDisplay('No expiry set')
      return
    }
    const tick = () => {
      const remaining = getRemainingMs(dealEndTime)
      setDisplay(formatCountdown(remaining))
      setExpired(remaining <= 0)
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [dealEndTime])

  if (!dealEndTime) {
    return <span className="text-[10px] text-muted-foreground font-mono">No expiry</span>
  }

  if (expired) {
    return (
      <span className="text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center gap-1">
        <AlertTriangle size={10} /> EXPIRED
      </span>
    )
  }

  const isUrgent = dealEndTime && getRemainingMs(dealEndTime) < 60 * 60 * 1000
  return (
    <span className={`text-[10px] font-mono font-bold ${isUrgent ? 'text-orange-400 animate-pulse' : 'text-primary'}`}>
      ⏱ {display}
    </span>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DealOfTheDayAdminPage() {
  const [currentDeals, setCurrentDeals] = useState<any[]>([])
  const [availableProducts, setAvailableProducts] = useState<any[]>([])

  const [loadingDeals, setLoadingDeals] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [processingId, setProcessingId] = useState<number | null>(null)

  // State for setting a new deal
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [newPrice, setNewPrice] = useState('')
  const [dealEndTime, setDealEndTime] = useState<string>(toDatetimeLocal()) // datetime-local string
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  // ── Data Fetching ──────────────────────────────────────────────────────────

  const fetchCurrentDeals = useCallback(async () => {
    try {
      setLoadingDeals(true)
      const res = await api.get<any>('/products?isDealOfTheDay=true&limit=50')
      setCurrentDeals(Array.isArray(res?.data) ? res.data : [])
    } catch {
      toast.error('Failed to load active deals')
    } finally {
      setLoadingDeals(false)
    }
  }, [])

  const fetchProducts = useCallback(async (search: string, currentPage: number) => {
    try {
      setLoadingProducts(true)
      const params = new URLSearchParams({ limit: '10', page: String(currentPage) })
      if (search) params.set('search', search)
      const res = await api.get<any>(`/products?${params.toString()}`)
      const list = Array.isArray(res?.data) ? res.data : []
      setAvailableProducts(list.filter((p: any) => !p.isDealOfTheDay))
      if (res?.meta) setTotalPages(res.meta.totalPages || 1)
    } catch {
      toast.error('Failed to load products')
    } finally {
      setLoadingProducts(false)
    }
  }, [])

  useEffect(() => { fetchCurrentDeals() }, [fetchCurrentDeals])

  useEffect(() => { setPage(1) }, [searchQuery])

  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(searchQuery, page), 400)
    return () => clearTimeout(timer)
  }, [searchQuery, page, fetchProducts])

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleRemoveDeal = async (product: any) => {
    setProcessingId(product.id)
    try {
      await api.put(`/admin/products/${product.id}`, {
        isDealOfTheDay: false,
        dealEndTime: null,
        // Revert price if originalPrice exists
        ...(product.originalPrice ? { price: product.originalPrice, originalPrice: null } : {}),
      })
      toast.success('Deal removed and price reverted.')
      fetchCurrentDeals()
      fetchProducts(searchQuery, page)
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove deal')
    } finally {
      setProcessingId(null)
    }
  }

  const handleSetDeal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct || !newPrice) return

    const parsedPrice = parseFloat(newPrice)
    const originalPrice = parseFloat(selectedProduct.price)

    if (isNaN(parsedPrice) || parsedPrice <= 0 || parsedPrice >= originalPrice) {
      toast.error('Deal price must be valid and strictly less than the current price.')
      return
    }

    const endTimeISO = fromDatetimeLocal(dealEndTime)
    if (new Date(endTimeISO) <= new Date()) {
      toast.error('Deal end time must be in the future.')
      return
    }

    setProcessingId(selectedProduct.id)
    try {
      await api.put(`/admin/products/${selectedProduct.id}`, {
        isDealOfTheDay: true,
        price: parsedPrice,
        originalPrice,
        dealEndTime: endTimeISO,
      })
      toast.success('🎉 Deal of the Day launched!')
      setSelectedProduct(null)
      setNewPrice('')
      setDealEndTime(toDatetimeLocal())
      fetchCurrentDeals()
      fetchProducts(searchQuery, page)
    } catch (err: any) {
      toast.error(err.message || 'Failed to set deal')
    } finally {
      setProcessingId(null)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <AdminLayout>
      <div className="space-y-12">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest text-foreground flex items-center gap-2">
            <Zap className="text-primary fill-primary" /> Deal of the Day
          </h1>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-bold">
            Set real-time flash deals with custom timers. Price reverts automatically when deal expires.
          </p>
        </div>

        {/* ── Active Deals ── */}
        {loadingDeals ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <section className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground border-b border-border pb-2">
              Active Deals ({currentDeals.length})
            </h2>

            {currentDeals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {currentDeals.map(deal => {
                    const remaining = getRemainingMs(deal.dealEndTime)
                    const isExpired = deal.dealEndTime && remaining <= 0
                    const isUrgent = deal.dealEndTime && remaining > 0 && remaining < 60 * 60 * 1000

                    return (
                      <motion.div
                        key={deal.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`flex items-start gap-4 p-4 border rounded-none relative overflow-hidden group transition-colors ${
                          isExpired
                            ? 'border-red-500/30 bg-red-500/5'
                            : isUrgent
                            ? 'border-orange-400/50 bg-orange-400/5'
                            : 'border-primary/50 bg-primary/5'
                        }`}
                      >
                        {/* Status badge */}
                        <div className={`absolute top-0 right-0 text-[8px] font-black uppercase tracking-widest px-2 py-1 flex items-center gap-1 z-10 ${
                          isExpired
                            ? 'bg-red-500 text-white'
                            : isUrgent
                            ? 'bg-orange-400 text-black'
                            : 'bg-primary text-primary-foreground'
                        }`}>
                          {isExpired ? (
                            <><AlertTriangle size={8} /> Expired</>
                          ) : (
                            <><Zap size={8} className="fill-current" /> Active</>
                          )}
                        </div>

                        {/* Product image */}
                        <div className="w-20 h-20 bg-muted relative flex-shrink-0">
                          {deal.imageUrl ? (
                            <Image src={deal.imageUrl} alt={deal.title || ''} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Zap size={24} className="text-muted-foreground opacity-20" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 pr-8">
                          <h3 className="text-sm font-black uppercase tracking-widest line-clamp-1">{deal.title}</h3>

                          <div className="flex items-end gap-2 mt-1.5">
                            <span className="text-base font-mono font-bold text-primary">₹{parseFloat(deal.price).toLocaleString('en-IN')}</span>
                            {deal.originalPrice && (
                              <span className="text-xs font-mono text-muted-foreground line-through mb-0.5">
                                ₹{parseFloat(deal.originalPrice).toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>

                          {/* Countdown + End time */}
                          <div className="mt-2 space-y-1">
                            <LiveCountdown dealEndTime={deal.dealEndTime} />
                            {deal.dealEndTime && (
                              <p className="text-[9px] text-muted-foreground font-mono flex items-center gap-1">
                                <CalendarClock size={9} />
                                Ends: {new Date(deal.dealEndTime).toLocaleString('en-IN', {
                                  day: '2-digit', month: 'short', year: 'numeric',
                                  hour: '2-digit', minute: '2-digit', hour12: true
                                })}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={() => handleRemoveDeal(deal)}
                          disabled={processingId === deal.id}
                          className="absolute bottom-3 right-3 p-2 border border-border hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 transition-all"
                          title="Remove Deal & Revert Price"
                        >
                          {processingId === deal.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <X size={14} />
                          )}
                        </button>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <div className="p-8 border border-dashed border-border bg-muted/10 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">No active deals right now.</p>
              </div>
            )}
          </section>
        )}

        {/* ── Create New Deal ── */}
        <section className="space-y-6">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground border-b border-border pb-2">
            Create New Deal
          </h2>

          {selectedProduct ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 border border-primary bg-card space-y-6"
            >
              {/* Selected product header */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-muted relative rounded-sm overflow-hidden">
                    {selectedProduct.imageUrl && (
                      <Image src={selectedProduct.imageUrl} alt="" fill className="object-cover" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest">{selectedProduct.title}</h3>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">
                      Current Price: <span className="text-foreground font-bold">₹{parseFloat(selectedProduct.price).toLocaleString('en-IN')}</span>
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSetDeal} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Deal Price */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                      Deal Price (₹) *
                    </label>
                    <input
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      placeholder={`Less than ₹${selectedProduct.price}`}
                      className="w-full bg-background border border-border px-4 py-3 text-sm font-mono font-bold focus:outline-none focus:border-primary transition-colors"
                      step="0.01"
                      min="1"
                      autoFocus
                      required
                    />
                    {newPrice && parseFloat(newPrice) >= parseFloat(selectedProduct.price) && (
                      <p className="text-[10px] text-red-400 font-mono">Must be less than ₹{selectedProduct.price}</p>
                    )}
                    {newPrice && parseFloat(newPrice) > 0 && parseFloat(newPrice) < parseFloat(selectedProduct.price) && (
                      <p className="text-[10px] text-primary font-mono">
                        Discount: {Math.round(((parseFloat(selectedProduct.price) - parseFloat(newPrice)) / parseFloat(selectedProduct.price)) * 100)}% off
                      </p>
                    )}
                  </div>

                  {/* Deal End Time */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <Clock size={10} /> Deal Ends At *
                    </label>
                    <input
                      type="datetime-local"
                      value={dealEndTime}
                      onChange={(e) => {
                        setDealEndTime(e.target.value)
                        setSelectedPreset(null)
                      }}
                      min={getMinDatetime()}
                      className="w-full bg-background border border-border px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                    {dealEndTime && (
                      <p className="text-[10px] text-muted-foreground font-mono">
                        Duration: {(() => {
                          const ms = new Date(dealEndTime).getTime() - Date.now()
                          if (ms <= 0) return '—'
                          const h = Math.floor(ms / 3600000)
                          const m = Math.floor((ms % 3600000) / 60000)
                          return h > 0 ? `${h}h ${m}m from now` : `${m}m from now`
                        })()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick presets */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground self-center">Quick set:</span>
                  {[
                    { label: '5 Min', ms: 5 * 60 * 1000 },
                    { label: '15 Min', ms: 15 * 60 * 1000 },
                    { label: '30 Min', ms: 30 * 60 * 1000 },
                    { label: '1 Hour', ms: 60 * 60 * 1000 },
                    { label: '3 Hours', ms: 3 * 60 * 60 * 1000 },
                    { label: '6 Hours', ms: 6 * 60 * 60 * 1000 },
                    { label: '12 Hours', ms: 12 * 60 * 60 * 1000 },
                    { label: '24 Hours', ms: 24 * 60 * 60 * 1000 },
                    { label: '48 Hours', ms: 48 * 60 * 60 * 1000 },
                  ].map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setDealEndTime(toDatetimeLocal(new Date(Date.now() + preset.ms).toISOString()))
                        setSelectedPreset(preset.label)
                      }}
                      className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border transition-all ${
                        selectedPreset === preset.label 
                          ? 'border-primary bg-primary text-black' 
                          : 'border-border hover:border-primary hover:text-primary text-muted-foreground'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={processingId === selectedProduct.id || !newPrice || !dealEndTime}
                  className="w-full sm:w-auto px-10 py-3.5 bg-primary text-primary-foreground font-black uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processingId === selectedProduct.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <Zap size={14} className="fill-current" />
                      Launch Deal
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            // Search & Select
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products to add as deal..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-background border border-border pl-10 pr-4 py-3 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="bg-card border border-border">
                {loadingProducts ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : availableProducts.length > 0 ? (
                  <div className="divide-y divide-border">
                    {availableProducts.map(product => (
                      <div key={product.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-muted relative flex-shrink-0">
                            {product.imageUrl && (
                              <Image src={product.imageUrl} alt="" fill className="object-cover" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase tracking-widest line-clamp-1">{product.title}</p>
                            <p className="text-[10px] font-mono text-muted-foreground">₹{parseFloat(product.price).toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedProduct(product)
                            setNewPrice('')
                            setDealEndTime(toDatetimeLocal(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()))
                          }}
                          className="px-4 py-2 text-[10px] font-black uppercase tracking-widest border border-border hover:border-primary hover:text-primary transition-colors flex items-center gap-2 whitespace-nowrap"
                        >
                          Set as Deal <ArrowRight size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">No available products found.</p>
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="flex items-center justify-between p-4 border-t border-border bg-muted/10">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                    >
                      ← Prev
                    </button>
                    <span className="text-[10px] font-black text-muted-foreground">PAGE {page} OF {totalPages}</span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

      </div>
    </AdminLayout>
  )
}
