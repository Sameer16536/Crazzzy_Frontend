'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api-client'
import { motion } from 'framer-motion'
import { Package, ChevronRight, User as UserIcon, Clock, CheckCircle2, Truck, XCircle, MoreVertical } from 'lucide-react'
import Link from 'next/link'

const STATUS_MAP: Record<string, { label: string, icon: any, color: string, bg: string }> = {
  PENDING: { label: 'Pending', icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  PROCESSING: { label: 'Processing', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  SHIPPED: { label: 'Shipped', icon: Truck, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  DELIVERED: { label: 'Delivered', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
  CANCELLED: { label: 'Cancelled', icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  PAID: { label: 'Paid', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
}

export function RecentOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true)
        const res = await api.get<any>('/admin/orders')
        // Backend returns: { success: true, data: [...] }
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
        setOrders(list.slice(0, 5)) // Get latest 5
      } catch (error) {
        console.error('Failed to fetch admin orders', error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Incoming Transmissions</h2>
        <Link href="/admin/orders" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">View All Registry →</Link>
      </div>

      <div className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-900/30 border border-white/5 animate-pulse" />
          ))
        ) : orders.length > 0 ? orders.map((order, i) => {
          const status = STATUS_MAP[order.status] || STATUS_MAP.PENDING
          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group bg-zinc-900/30 border border-white/5 hover:border-primary/20 transition-all duration-300 p-6 flex flex-col md:flex-row justify-between items-center gap-6"
            >
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="w-12 h-12 bg-black border border-white/5 flex items-center justify-center shrink-0">
                  <Package className="text-white/20 group-hover:text-primary transition-colors" size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-white/20 uppercase tracking-widest mb-1">#{order.id}</p>
                  <p className="text-xs font-black uppercase tracking-widest truncate">{order.user?.name || 'Unknown Agent'}</p>
                  <p className="text-[10px] text-white/10 uppercase tracking-widest mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-12">
                 <div className={`flex items-center gap-2 px-3 py-1 ${status.bg} border border-${status.color.split('-')[1]}-500/20`}>
                    <status.icon size={12} className={status.color} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${status.color}`}>{status.label}</span>
                 </div>
                 <p className="text-lg font-black font-mono">₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}</p>
                 <Link href={`/account/orders/${order.id}`} className="p-2 text-white/20 hover:text-primary transition-colors">
                    <ChevronRight size={18} />
                 </Link>
              </div>
            </motion.div>
          )
        }) : (
          <div className="py-20 text-center border border-dashed border-white/10 text-white/20">
             <p className="text-[10px] font-black uppercase tracking-widest">No Recent Transmissions</p>
          </div>
        )}
      </div>
    </div>
  )
}
