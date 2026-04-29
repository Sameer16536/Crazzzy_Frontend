'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Navbar } from '@/components/navbar'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { api } from '@/lib/api-client'
import { Package, ChevronRight, Search, Filter, ShoppingBag, Clock, CheckCircle2, Truck, XCircle } from 'lucide-react'

const STATUS_MAP: Record<string, { label: string, icon: any, color: string }> = {
  PENDING: { label: 'Pending', icon: Clock, color: 'text-yellow-500' },
  PROCESSING: { label: 'Processing', icon: Clock, color: 'text-blue-500' },
  SHIPPED: { label: 'Shipped', icon: Truck, color: 'text-purple-500' },
  DELIVERED: { label: 'Delivered', icon: CheckCircle2, color: 'text-green-500' },
  CANCELLED: { label: 'Cancelled', icon: XCircle, color: 'text-red-500' },
  PAID: { label: 'Paid', icon: CheckCircle2, color: 'text-emerald-500' },
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?redirect=/account/orders')
      return
    }

    if (user) {
      fetchOrders()
    }
  }, [user, authLoading, router])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await api.get<any>('/orders')
      // Backend returns: { success: true, data: [...] }
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
      setOrders(list)
    } catch (error) {
      console.error('Failed to fetch orders', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || (loading && !user)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <div className="pt-32 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4">
              <Link href="/account" className="hover:text-primary transition-colors">Dashboard</Link>
              <ChevronRight size={10} />
              <span className="text-foreground">Orders</span>
            </div>
            <h1 className="text-5xl font-black uppercase tracking-tighter leading-none text-foreground">
              MY ORDERS
            </h1>
            <p className="text-muted-foreground text-[10px] font-mono uppercase tracking-widest">Tracking {orders.length} deployments</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Find Order ID..."
                className="w-full bg-muted border border-border px-10 py-3 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary/30 text-foreground"
              />
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.length > 0 ? orders.map((order, i) => {
            const status = STATUS_MAP[order.status] || STATUS_MAP.PENDING
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group bg-muted/30 border border-border hover:border-primary/20 transition-all duration-300 overflow-hidden"
              >
                <Link href={`/account/orders/${order.id}`} className="block p-8">
                  <div className="flex flex-col md:flex-row justify-between gap-8 items-start md:items-center">
                    
                    {/* Order Meta */}
                    <div className="flex items-center gap-8">
                      <div className="w-16 h-16 bg-black border border-white/5 flex items-center justify-center shrink-0">
                         <Package className="text-primary/40 group-hover:text-primary transition-colors" size={24} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Order ID</p>
                        <p className="text-sm font-black uppercase tracking-widest text-foreground">#{order.id.toString().padStart(6, '0')}</p>
                        <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest font-light">{new Date(order.createdAt).toLocaleDateString()}</p>
                        {order.trackingNumber && (
                          <p className="text-[9px] text-primary/60 uppercase tracking-widest mt-2 font-mono flex items-center gap-1">
                            <Truck size={10} /> {order.courierName}: {order.trackingNumber}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status & Price */}
                    <div className="flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end w-full md:w-auto gap-4">
                      <div className={`flex items-center gap-2 ${status.color}`}>
                        <status.icon size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{status.label}</span>
                      </div>
                      <p className="text-xl font-black font-mono text-foreground">₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}</p>
                    </div>

                    <div className="hidden md:block">
                      <ChevronRight size={20} className="text-white/10 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          }) : (
            <div className="py-32 text-center border border-dashed border-border bg-muted/10">
              <div className="w-16 h-16 bg-muted flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="text-muted-foreground/20" size={24} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-foreground">No Deployments Found</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] max-w-xs mx-auto leading-loose mb-8">
                Your mission record is currently clear.
              </p>
              <Link 
                href="/shop" 
                className="inline-block bg-primary text-primary-foreground px-8 py-3 font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-transform"
              >
                Initiate Mission
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
