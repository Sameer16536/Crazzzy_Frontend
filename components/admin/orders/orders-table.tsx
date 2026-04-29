'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api-client'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '../status-badge'
import { OrderActions } from './order-actions'
import { Loader2, Package, Search, Filter, Copy, Check, Truck } from 'lucide-react'
import { toast } from 'sonner'


export function OrdersTable() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    toast.success('ID copied to clipboard')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await api.get<any>('/admin/orders')
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
      setOrders(list)
    } catch (error) {
      console.error('Failed to fetch orders', error)
      toast.error('Failed to sync with logistics registry')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const filteredOrders = Array.isArray(orders) ? orders.filter(o =>
    String(o.id).includes(searchQuery) ||
    o.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.shippingAddress?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : []

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
            className="w-full bg-zinc-900 border border-white/5 px-12 py-4 text-[10px] font-black uppercase tracking-[0.2em] focus:outline-none focus:border-primary/30 transition-all text-white"
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="px-6 py-4 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 transition-all text-white/60">
            <Filter size={14} />
            Filter
          </button>
        </div>
      </div>

      <div className="bg-zinc-900/30 border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
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
                    <Loader2 className="animate-spin text-primary mx-auto" size={32} />
                  </td>
                </tr>
              ) : filteredOrders.map((order, i) => (
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
                    <OrderActions orderId={order.id} onUpdate={fetchOrders} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
