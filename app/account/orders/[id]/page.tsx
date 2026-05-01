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
  ChevronRight,
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  MapPin, 
  Phone, 
  CreditCard,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

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
  const [copied, setCopied] = useState(false)

  const copyId = () => {
    if (!order) return
    navigator.clipboard.writeText(String(order.id))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order? If paid, a refund will be initiated.')) return
    
    try {
      setLoading(true)
      await api.post(`/orders/${order.id}/cancel`, {})
      toast.success('Order cancelled successfully')
      fetchOrderDetails()
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel order')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || (loading && !order)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-black uppercase mb-4 text-foreground">Order Not Found</h1>
        <Link href="/account/orders" className="text-primary hover:underline uppercase text-[10px] font-bold tracking-widest">
          Back to Orders
        </Link>
      </div>
    )
  }

  const status = STATUS_MAP[order.status] || STATUS_MAP.PENDING

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <div className="pt-32 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        
        {/* Navigation */}
        <Link 
          href="/account/orders" 
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors mb-12"
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
                <div className="flex items-center gap-2">
                  <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground">
                    Order #{order.id.toString().padStart(6, '0')}
                  </h1>
                  <button 
                    onClick={copyId}
                    className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground"
                  >
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                </div>
                <div className={`flex items-center gap-2 px-4 py-1.5 ${status.bg} ${status.color} border border-current/20 rounded-full`}>
                  <status.icon size={12} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{status.label}</span>
                </div>
              </div>
              <p className="text-muted-foreground text-[10px] font-mono uppercase tracking-[0.3em]">
                Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
              </p>
            </div>

            {/* Items List */}
            <div className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground border-b border-border pb-4">
                Shipment Contents
              </h2>
              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex gap-6 p-6 bg-muted/30 border border-border group hover:border-foreground/20 transition-colors">
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
                        <h3 className="text-sm font-black uppercase tracking-tight text-foreground">{item.product?.title}</h3>
                        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold font-mono">₹{parseFloat(item.price).toLocaleString('en-IN')}</p>
                    </div>
                    <Link 
                      href={`/shop`}
                      className="self-center p-3 hover:bg-muted rounded-full transition-colors text-muted-foreground/30 hover:text-primary"
                    >
                      <ChevronRight size={16} className="text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking (If Shipped or info available) */}
            {(order.trackingNumber || order.courierName || order.estimatedDelivery) && (
              <div className="p-8 bg-primary/5 border border-primary/20 space-y-4">
                <div className="flex items-center gap-3 text-primary">
                  <Truck size={20} />
                  <h2 className="text-xs font-black uppercase tracking-widest">Live Tracking</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Carrier</p>
                    <p className="text-sm font-bold uppercase tracking-widest text-foreground">{order.courierName || 'BlueDart'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Tracking ID</p>
                    <p className="text-sm font-bold font-mono text-primary">{order.trackingNumber}</p>
                  </div>
                  {order.estimatedDelivery && (
                    <div className="md:col-span-2 pt-4 border-t border-primary/10">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Estimated Arrival</p>
                      <p className="text-sm font-bold uppercase tracking-widest text-foreground">
                        {new Date(order.estimatedDelivery).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Summary & Logistics ─────────────────────────────── */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Delivery Details */}
            <div className="bg-muted/50 border border-border p-8 space-y-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="text-primary shrink-0 mt-1" size={18} />
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Shipping Destination</p>
                    <p className="text-xs font-bold leading-relaxed text-foreground">{order.shippingAddress}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 pt-6 border-t border-border">
                  <Phone className="text-primary shrink-0 mt-1" size={18} />
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contact Number</p>
                    <p className="text-xs font-bold font-mono text-foreground">+91 {order.phoneNumber}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pt-6 border-t border-border">
                  <CreditCard className="text-primary shrink-0 mt-1" size={18} />
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Payment Metadata</p>
                    <p className="text-[10px] text-muted-foreground/60 font-mono break-all">{order.paymentId}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-muted/80 border border-primary/20 p-8 space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Financial Summary</h3>
              
              <div className="space-y-4 border-b border-border pb-6">
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-foreground">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono">₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-foreground">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-emerald-500">FREE</span>
                </div>
                {parseFloat(order.discountApplied) > 0 && (
                  <div className="flex justify-between text-[10px] uppercase tracking-widest text-foreground">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-red-400">-₹{parseFloat(order.discountApplied).toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-end">
                <span className="text-xs font-black uppercase tracking-widest text-foreground">Grand Total</span>
                <span className="text-2xl font-black font-mono text-primary">₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}</span>
              </div>

              {['PENDING', 'PAID'].includes(order.status) && (
                <button
                  onClick={handleCancelOrder}
                  disabled={loading}
                  className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-4 text-[10px] font-black uppercase tracking-widest transition-all mt-4 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Cancel Order'}
                </button>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
