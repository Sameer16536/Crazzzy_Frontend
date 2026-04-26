'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Navbar } from '@/components/navbar'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { api } from '@/lib/api-client'
import { 
  Package, 
  ChevronLeft, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  MapPin, 
  Phone, 
  CreditCard,
  ExternalLink
} from 'lucide-react'
import Image from 'next/image'

const STATUS_MAP: Record<string, { label: string, icon: any, color: string, bg: string }> = {
  PENDING: { label: 'Pending', icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  PROCESSING: { label: 'Processing', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  SHIPPED: { label: 'Shipped', icon: Truck, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  DELIVERED: { label: 'Delivered', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
  CANCELLED: { label: 'Cancelled', icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  PAID: { label: 'Payment Confirmed', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
}

export default function OrderDetailsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/login?redirect=/account/orders/${params.id}`)
      return
    }

    if (user && params.id) {
      fetchOrderDetails()
    }
  }, [user, authLoading, params.id, router])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const res = await api.get<any>(`/orders/${params.id}`)
      // Backend returns: { success: true, data: {...} }
      setOrder(res?.data || res)
    } catch (error) {
      console.error('Failed to fetch order details', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || (loading && !order)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-black uppercase mb-4">Order Not Found</h1>
        <Link href="/account/orders" className="text-primary hover:underline uppercase text-[10px] font-bold tracking-widest">
          Back to Orders
        </Link>
      </div>
    )
  }

  const status = STATUS_MAP[order.status] || STATUS_MAP.PENDING

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="pt-32 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        
        {/* Navigation */}
        <Link 
          href="/account/orders" 
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-primary transition-colors mb-12"
        >
          <ChevronLeft size={14} />
          Return to Orders
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* ── Left: Order Info ────────────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Header */}
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-4xl font-black uppercase tracking-tighter">
                  Order #{order.id.toString().padStart(6, '0')}
                </h1>
                <div className={`flex items-center gap-2 px-4 py-1.5 ${status.bg} ${status.color} border border-current/20 rounded-full`}>
                  <status.icon size={12} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{status.label}</span>
                </div>
              </div>
              <p className="text-white/30 text-[10px] font-mono uppercase tracking-[0.3em]">
                Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
              </p>
            </div>

            {/* Items List */}
            <div className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-white/40 border-b border-white/5 pb-4">
                Shipment Contents
              </h2>
              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex gap-6 p-6 bg-zinc-900/30 border border-white/5 group hover:border-white/10 transition-colors">
                    <div className="relative w-24 h-24 bg-white border border-black/5 shrink-0 p-4">
                      <Image 
                        src={item.product?.imageUrl || '/placeholder.jpg'} 
                        alt={item.product?.title || 'Product'} 
                        fill 
                        className="object-contain" 
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-tight">{item.product?.title}</h3>
                        <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold font-mono">₹{parseFloat(item.price).toLocaleString('en-IN')}</p>
                    </div>
                    <Link 
                      href={`/shop`} // Simplified for now
                      className="self-center p-3 hover:bg-white/5 rounded-full transition-colors text-white/20 hover:text-primary"
                    >
                      <ExternalLink size={18} />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking (If Shipped) */}
            {order.trackingNumber && (
              <div className="p-8 bg-primary/5 border border-primary/20 space-y-4">
                <div className="flex items-center gap-3 text-primary">
                  <Truck size={20} />
                  <h2 className="text-xs font-black uppercase tracking-widest">Live Tracking</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Carrier</p>
                    <p className="text-sm font-bold uppercase tracking-widest">{order.courierName || 'BlueDart'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Tracking ID</p>
                    <p className="text-sm font-bold font-mono text-primary">{order.trackingNumber}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Summary & Logistics ─────────────────────────────── */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Delivery Details */}
            <div className="bg-zinc-900/50 border border-white/5 p-8 space-y-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="text-primary shrink-0 mt-1" size={18} />
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Shipping Destination</p>
                    <p className="text-xs font-bold leading-relaxed">{order.shippingAddress}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 pt-6 border-t border-white/5">
                  <Phone className="text-primary shrink-0 mt-1" size={18} />
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Contact Number</p>
                    <p className="text-xs font-bold font-mono">+91 {order.phoneNumber}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pt-6 border-t border-white/5">
                  <CreditCard className="text-primary shrink-0 mt-1" size={18} />
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Payment Metadata</p>
                    <p className="text-[10px] text-white/60 font-mono break-all">{order.paymentId}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-zinc-900/80 border border-primary/20 p-8 space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Financial Summary</h3>
              
              <div className="space-y-4 border-b border-white/10 pb-6">
                <div className="flex justify-between text-[10px] uppercase tracking-widest">
                  <span className="text-white/40">Subtotal</span>
                  <span className="font-mono">₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[10px] uppercase tracking-widest">
                  <span className="text-white/40">Shipping</span>
                  <span className="text-emerald-500">FREE</span>
                </div>
                {parseFloat(order.discountApplied) > 0 && (
                  <div className="flex justify-between text-[10px] uppercase tracking-widest">
                    <span className="text-white/40">Discount</span>
                    <span className="text-red-400">-₹{parseFloat(order.discountApplied).toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-end">
                <span className="text-xs font-black uppercase tracking-widest">Grand Total</span>
                <span className="text-2xl font-black font-mono text-primary">₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
