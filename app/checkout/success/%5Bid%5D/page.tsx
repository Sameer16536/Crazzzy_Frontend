'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { CheckCircle2, Package, Truck, ArrowRight, ShoppingBag, MapPin, Calendar } from 'lucide-react'
import { api } from '@/lib/api-client'
import { Navbar } from '@/components/navbar'
import confetti from 'canvas-confetti'

export default function OrderSuccessPage() {
  const { id } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get<any>(`/orders/${id}`)
        setOrder(res?.data || res)
        
        // Trigger confetti on success
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#d4af37', '#ffffff', '#000000']
        })
      } catch (err) {
        console.error('Failed to fetch order:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchOrder()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!order) return null

  const estimatedDelivery = new Date()
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5)

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      
      <main className="pt-32 pb-24 max-w-4xl mx-auto px-6">
        {/* Success Header */}
        <div className="text-center space-y-6 mb-16">
          <motion.div 
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(212,175,55,0.3)]"
          >
            <CheckCircle2 size={48} className="text-primary-foreground" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Your Order is Confirmed</h1>
            <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">
              Artifact Registry ID: <span className="text-primary">#{order.id.toString().padStart(6, '0')}</span>
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Logistics Summary */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-neutral-900/50 backdrop-blur-md border border-white/5 p-8 space-y-8"
          >
             <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center shrink-0">
                   <Calendar className="text-primary" size={20} />
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Arrival Protocol</p>
                   <p className="text-sm font-bold uppercase tracking-tight">Est: {estimatedDelivery.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
             </div>

             <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center shrink-0">
                   <MapPin className="text-primary" size={20} />
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Deployment Sector</p>
                   <p className="text-sm font-bold uppercase tracking-tight leading-relaxed">{order.shippingAddress}</p>
                </div>
             </div>
          </motion.div>

          {/* Value Summary */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-primary p-8 space-y-8 shadow-2xl shadow-primary/20 relative overflow-hidden"
          >
             <div className="absolute right-0 top-0 opacity-10">
                <ShoppingBag size={120} className="-mr-10 -mt-10 rotate-12" />
             </div>
             
             <div className="space-y-1 relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary-foreground/60">Registry Value</p>
                <p className="text-4xl font-black font-mono text-primary-foreground">₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}</p>
             </div>

             <Link 
                href="/account/orders"
                className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-widest bg-black text-white px-6 py-4 hover:scale-105 transition-all relative z-10"
             >
                View Full Receipt <ArrowRight size={14} />
             </Link>
          </motion.div>
        </div>

        {/* Artifacts Overview */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.6 }}
           className="space-y-8"
        >
           <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground border-b border-white/5 pb-4">Artifacts in this Deployment</h3>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {order.items?.map((item: any) => (
                <div key={item.id} className="space-y-3 group">
                   <div className="aspect-square bg-white border border-white/5 p-4 relative overflow-hidden">
                      <Image 
                        src={item.product?.imageUrl || '/placeholder.jpg'} 
                        alt={item.product?.title} 
                        fill 
                        className="object-contain group-hover:scale-110 transition-transform duration-500" 
                      />
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase truncate">{item.product?.title}</p>
                      <p className="text-[9px] text-muted-foreground font-mono">QTY: {item.quantity}</p>
                   </div>
                </div>
              ))}
           </div>
        </motion.div>

        {/* Actions */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-20 flex flex-col items-center gap-6"
        >
           <Link 
              href="/shop" 
              className="w-full md:w-auto bg-foreground text-background px-12 py-5 text-xs font-black uppercase tracking-[0.3em] hover:scale-105 transition-all text-center"
           >
              Continue Exploring the Catalog
           </Link>
           <p className="text-[10px] text-muted-foreground/40 uppercase tracking-widest text-center max-w-xs">
              A copy of your deployment summary has been transmitted to your registered uplink (email).
           </p>
        </motion.div>
      </main>
    </div>
  )
}
