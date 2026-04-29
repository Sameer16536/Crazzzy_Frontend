/**
 * Track Order Page
 * Allows customers to track their Crazzzy Store orders by order ID
 */

'use client'

import { Navbar } from '@/components/navbar'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import { 
  Package, 
  Search, 
  Truck, 
  CheckCircle, 
  Clock, 
  ChevronRight, 
  MapPin, 
  Calendar,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react'
import { useState, useEffect } from 'react'

const TRACKING_STEPS = [
  { status: 'PAID', label: 'Confirmed', icon: CheckCircle, desc: 'Payment verified' },
  { status: 'PROCESSING', label: 'Processing', icon: Package, desc: 'Preparing for dispatch' },
  { status: 'SHIPPED', label: 'In Transit', icon: Truck, desc: 'On the way to destination' },
  { status: 'DELIVERED', label: 'Delivered', icon: CheckCircle, desc: 'Handed to recipient' },
]

const GET_STATUS_INDEX = (status: string) => {
  if (status === 'CANCELLED') return -1
  if (status === 'PENDING') return 0
  if (status === 'PAID') return 1
  if (status === 'PROCESSING') return 2
  if (status === 'SHIPPED') return 3
  if (status === 'DELIVERED') return 4
  return 0
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('')
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!orderId.trim()) return

    setLoading(true)
    setError(null)
    setOrder(null)

    try {
      // Clean the ID (remove # or prefix if user enters it)
      const cleanId = orderId.replace(/[^0-9]/g, '')
      const res = await api.get<any>(`/orders/${cleanId}`)
      setOrder(res?.data || res)
    } catch (err: any) {
      setError(err.message || 'Order not found or access denied.')
      toast.error('Could not retrieve shipment data')
    } finally {
      setLoading(false)
    }
  }

  const copyId = () => {
    if (!order) return
    navigator.clipboard.writeText(String(order.id))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16" />

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-4 mb-14 text-center"
        >
          <div className="flex justify-center mb-4">
            <div className="p-5 bg-primary/10 rounded-2xl">
              <Package size={36} className="text-primary" />
            </div>
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-foreground">
            Track Your Order
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Enter your order ID to see the latest status of your shipment.
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          onSubmit={handleSearch}
          className="flex gap-3 mb-12"
        >
          <input
            id="order-id-input"
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="e.g. CRZ-2026-00123"
            className="flex-1 px-5 py-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-mono text-sm"
          />
          <button
            type="submit"
            className="px-6 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all duration-300 active:scale-95 flex items-center gap-2 cursor-interactive whitespace-nowrap"
          >
            <Search size={18} />
            Track
          </button>
        </motion.form>

        {/* Results */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-center gap-4 text-red-500"
          >
            <AlertCircle size={20} />
            <p className="text-sm font-bold uppercase tracking-widest">{error}</p>
          </motion.div>
        )}

        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Amazon-Style Header */}
            <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-border/30 bg-primary/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-black uppercase tracking-tighter">
                      {order.status === 'DELIVERED' ? 'Delivered' : 
                       order.estimatedDelivery ? `Arriving ${new Date(order.estimatedDelivery).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}` : 
                       'In Progress'}
                    </h2>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2">
                      Order #{order.id.toString().padStart(6, '0')}
                      <button onClick={copyId} className="hover:text-primary transition-colors">
                        {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                      </button>
                    </p>
                  </div>
                  <div className={`px-4 py-2 rounded-full border border-current/20 flex items-center gap-2 ${
                    order.status === 'DELIVERED' ? 'bg-green-500/10 text-green-500' :
                    order.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500' :
                    'bg-primary/10 text-primary'
                  }`}>
                    {order.status === 'DELIVERED' ? <CheckCircle size={14} /> : <Truck size={14} />}
                    <span className="text-[10px] font-black uppercase tracking-widest">{order.status}</span>
                  </div>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="p-8 sm:p-12">
                <div className="relative flex justify-between">
                  {/* Progress Line */}
                  <div className="absolute top-5 left-0 w-full h-[2px] bg-muted -z-0">
                    <motion.div 
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(0, Math.min(100, (GET_STATUS_INDEX(order.status) / 3) * 100))}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>

                  {TRACKING_STEPS.map((step, i) => {
                    const statusIndex = GET_STATUS_INDEX(order.status)
                    const isComplete = statusIndex > i
                    const isCurrent = statusIndex === i + 1
                    const Icon = step.icon

                    return (
                      <div key={step.label} className="relative z-10 flex flex-col items-center text-center max-w-[80px]">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                          isComplete ? 'bg-primary border-primary text-primary-foreground' :
                          isCurrent ? 'bg-background border-primary text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]' :
                          'bg-background border-muted text-muted-foreground'
                        }`}>
                          <Icon size={18} />
                        </div>
                        <div className="mt-4 space-y-1">
                          <p className={`text-[10px] font-black uppercase tracking-widest ${
                            isComplete || isCurrent ? 'text-foreground' : 'text-muted-foreground/40'
                          }`}>
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p className="text-[8px] text-primary font-bold uppercase tracking-widest animate-pulse">Active</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Courier Info */}
              {order.trackingNumber && (
                <div className="mx-8 mb-8 p-6 bg-muted/30 border border-border/50 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-background rounded-lg">
                      <Truck size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Tracking with {order.courierName || 'BlueDart'}</p>
                      <p className="text-sm font-bold font-mono tracking-widest text-primary">{order.trackingNumber}</p>
                    </div>
                  </div>
                  <a 
                    href="#" 
                    className="px-6 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest rounded-full transition-all"
                  >
                    Trace Shipment
                  </a>
                </div>
              )}
            </div>

            {/* Shipment Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card border border-border/50 rounded-2xl p-8 space-y-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin size={16} />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Shipping Address</h3>
                </div>
                <p className="text-sm text-foreground leading-relaxed font-bold uppercase tracking-tight">
                  {order.shippingAddress}
                </p>
              </div>

              <div className="bg-card border border-border/50 rounded-2xl p-8 space-y-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar size={16} />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Timeline Metadata</h3>
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between text-[10px] uppercase tracking-widest">
                     <span className="text-muted-foreground">Placed</span>
                     <span className="text-foreground">{new Date(order.createdAt).toLocaleDateString()}</span>
                   </div>
                   {order.deliveredAt && (
                     <div className="flex justify-between text-[10px] uppercase tracking-widest">
                       <span className="text-muted-foreground">Delivered</span>
                       <span className="text-green-500">{new Date(order.deliveredAt).toLocaleDateString()}</span>
                     </div>
                   )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="mt-16 text-center">
          <Link href="/" className="text-muted-foreground hover:text-primary transition-colors text-sm">
            ← Back to Home
          </Link>
        </div>
      </section>
    </div>
  )
}
