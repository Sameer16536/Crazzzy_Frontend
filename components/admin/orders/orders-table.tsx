'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api-client'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '../status-badge'
import { OrderActions } from './order-actions'
import { Loader2, Package, Search, Filter, Copy, Check, Truck } from 'lucide-react'
import { useCatalog } from '@/lib/catalog/use-catalog'
import { toast } from 'sonner'


export function OrdersTable() {
  const { adminFilters, setAdminFilter } = useCatalog()
  const { search: searchQuery, page: currentPage } = adminFilters.orders
  
  const setSearchQuery = (search: string) => setAdminFilter('orders', { search })
  const setCurrentPage = (page: number | ((p: number) => number)) => {
    const next = typeof page === 'function' ? page(currentPage) : page
    setAdminFilter('orders', { page: next })
  }

  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const limit = 10

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    toast.success('ID copied to clipboard')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const fetchOrders = async (search?: string, page: number = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ 
        page: String(page), 
        limit: String(limit) 
      })
      if (search) params.set('search', search)
      
      const res = await api.get<any>(`/admin/orders?${params.toString()}`)
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
      setOrders(list)
      
      if (res?.meta) {
        setTotalPages(res.meta.totalPages || 1)
        setTotalOrders(res.meta.total || 0)
      }
    } catch (error) {
      console.error('Failed to fetch orders', error)
      toast.error('Failed to sync with logistics registry')
    } finally {
      setLoading(false)
    }
  }

  // Reset to page 1 whenever search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders(searchQuery || undefined, currentPage)
    }, searchQuery ? 400 : 0)
    return () => clearTimeout(timer)
  }, [searchQuery, currentPage])

  return (
    <div className="space-y-6">
      {/* Table Toolbar */}
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search Registry (ID, Customer, Address)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-white/5 px-12 py-4 text-[10px] font-black uppercase tracking-[0.2em] focus:outline-none focus:border-primary/30 transition-all text-white rounded-sm"
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="px-6 py-4 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 transition-all text-white/60 rounded-sm">
            <Filter size={14} />
            Filter
          </button>
        </div>
      </div>

      <div className="bg-zinc-900/30 border border-white/5 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-zinc-950/50">
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Transmission ID</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Recipient</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Timeline</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Value</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Payment</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Status</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 text-right">Operations</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="animate-spin text-primary mx-auto" size={32} />
                      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/40">Accessing Data...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.map((order, i) => (
                <tr
                  key={order.id}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="p-6">
                    <div className="flex items-center gap-2 group/id">
                      <p className="text-xs font-mono font-bold text-primary">#{order.id.toString().padStart(6, '0')}</p>
                      <button
                        onClick={() => copyToClipboard(String(order.id))}
                        className="opacity-0 group-hover/id:opacity-100 transition-opacity p-1 hover:bg-white/5 rounded"
                      >
                        {copiedId === String(order.id) ? <Check size={12} className="text-green-500" /> : <Copy size={12} className="text-white/20" />}
                      </button>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="min-w-0">
                      <p className="text-sm font-black uppercase tracking-tight truncate text-white">{order.user?.name || 'Unknown'}</p>
                      <p className="text-[10px] text-white/20 uppercase tracking-widest truncate">{order.user?.email}</p>
                      {order.trackingNumber && (
                        <p className="text-[9px] text-primary/60 uppercase tracking-widest mt-1 font-mono flex items-center gap-1">
                          <Truck size={10} /> {order.courierName}: {order.trackingNumber}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-6 text-[10px] text-white/40 uppercase tracking-widest font-mono">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-6">
                    <p className="text-sm font-black font-mono text-white">₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}</p>
                  </td>
                  <td className="p-6">
                    <PaymentStatusBadge
                      status={['PAID', 'SHIPPED', 'DELIVERED', 'PROCESSING'].includes(order.status) ? 'paid' : 'pending'}
                    />
                  </td>
                  <td className="p-6">
                    <StatusBadge status={order.status.toLowerCase() as any} />
                  </td>
                  <td className="p-6 text-right">
                    <OrderActions orderId={order.id} onUpdate={() => fetchOrders(searchQuery, currentPage)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden divide-y divide-white/5">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="animate-spin text-primary mx-auto mb-4" size={32} />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/40">Accessing Data...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-20 text-center px-4">
              <Package className="mx-auto text-white/10 mb-4" size={48} />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 leading-relaxed">
                No transmissions detected
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-mono font-bold text-primary">#{order.id.toString().padStart(6, '0')}</p>
                      <button
                        onClick={() => copyToClipboard(String(order.id))}
                        className="p-1 hover:bg-white/5 rounded"
                      >
                        {copiedId === String(order.id) ? <Check size={12} className="text-green-500" /> : <Copy size={12} className="text-white/20" />}
                      </button>
                    </div>
                    <p className="text-xs font-black uppercase tracking-tight text-white mt-1 truncate">{order.user?.name || 'Unknown'}</p>
                    <p className="text-[9px] text-white/40 uppercase tracking-widest truncate">{order.user?.email}</p>
                    {order.trackingNumber && (
                      <p className="text-[8px] text-primary/60 uppercase tracking-widest mt-1 font-mono flex items-center gap-1">
                        <Truck size={10} /> {order.courierName}: {order.trackingNumber}
                      </p>
                    )}
                  </div>
                  <OrderActions orderId={order.id} onUpdate={() => fetchOrders(searchQuery, currentPage)} />
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="space-y-1">
                    <p className="text-[9px] text-white/40 uppercase tracking-widest font-mono">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm font-black font-mono text-white">₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={order.status.toLowerCase() as any} />
                    <PaymentStatusBadge
                      status={['PAID', 'SHIPPED', 'DELIVERED', 'PROCESSING'].includes(order.status) ? 'paid' : 'pending'}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {!loading && orders.length > 0 && (
          <div className="px-8 py-6 border-t border-white/5 bg-zinc-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
              Showing <span className="text-white">{(currentPage - 1) * limit + 1}</span> to <span className="text-white">{Math.min(currentPage * limit, totalOrders)}</span> of <span className="text-white">{totalOrders}</span> transmissions
            </p>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-3 border border-white/10 rounded-sm hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all text-white"
              >
                <ChevronLeft size={18} />
              </button>
              
              <div className="flex items-center gap-1">
                {(() => {
                  const pages = []
                  const maxVisible = 5
                  
                  if (totalPages <= maxVisible) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i)
                  } else {
                    pages.push(1)
                    if (currentPage > 3) pages.push('...')
                    
                    const start = Math.max(2, currentPage - 1)
                    const end = Math.min(totalPages - 1, currentPage + 1)
                    
                    if (currentPage <= 3) {
                      for (let i = 2; i <= 4; i++) pages.push(i)
                    } else if (currentPage >= totalPages - 2) {
                      for (let i = totalPages - 3; i <= totalPages - 1; i++) pages.push(i)
                    } else {
                      for (let i = start; i <= end; i++) pages.push(i)
                    }
                    
                    if (currentPage < totalPages - 2) pages.push('...')
                    pages.push(totalPages)
                  }

                  return pages.map((page, idx) => (
                    typeof page === 'number' ? (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 text-[10px] font-black rounded-sm transition-all ${
                          currentPage === page 
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                            : 'hover:bg-white/5 text-white/40'
                        }`}
                      >
                        {page}
                      </button>
                    ) : (
                      <span key={idx} className="px-2 text-white/20 text-[10px] font-black">...</span>
                    )
                  ))
                })()}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-3 border border-white/10 rounded-sm hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all text-white"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

        {!loading && filteredOrders.length === 0 && (
          <div className="py-20 text-center text-white/20 border-t border-white/5">
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">No transmissions detected in this sector.</p>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * PaymentStatusBadge Component
 * 
 * Shows payment status with appropriate color coding
 */
function PaymentStatusBadge({
  status,
}: {
  status: 'paid' | 'pending' | 'failed'
}) {
  const statusConfig = {
    paid: 'bg-green-100/50 text-green-700',
    pending: 'bg-yellow-100/50 text-yellow-700',
    failed: 'bg-red-100/50 text-red-700',
  }

  const labels = {
    paid: 'Paid',
    pending: 'Pending',
    failed: 'Failed',
  }

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[status]}`}
    >
      {labels[status]}
    </span>
  )
}
