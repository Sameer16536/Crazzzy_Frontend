'use client'

import { useParams } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { useComboDeals } from '@/hooks/use-combo-deals'
import { useCatalog } from '@/lib/catalog/catalog-context'
import { ProductCard } from '@/components/product-card'
import { Button } from '@/components/ui/button'
import { useAppDispatch } from '@/lib/store/hooks'
import { addBundle } from '@/lib/store/slices/cart-slice'
import { motion } from 'framer-motion'
import { Gift, Zap, ArrowLeft, CheckCircle2, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function DealPage() {
  const params = useParams()
  const dispatch = useAppDispatch()
  const { deals, mounted, isLoading } = useComboDeals()
  const { data: catalogData } = useCatalog()
  
  const dealId = params.id as string
  const deal = deals.find(d => String(d.id) === dealId)
  const allProducts = catalogData?.products ?? []
  const dealProducts = allProducts.filter(p => deal?.eligibleProductIds.includes(p.id))

  if (!mounted || isLoading) return <div className="min-h-screen bg-black" />
  if (!deal) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-black text-white uppercase tracking-widest">Deal Not Found</h1>
        <Link href="/" className="text-primary text-sm uppercase mt-4 block">Back to home</Link>
      </div>
    </div>
  )

  const handleClaim = () => {
    dispatch(addBundle({
      bundleId: deal.id,
      price: deal.bundlePrice,
      items: dealProducts.map(p => ({
        productId: p.id,
        name: p.name,
        price: p.price,
        image: p.imageUrl,
        categorySlug: p.categorySlug
      }))
    }))
    toast.success(`${deal.title} added to cart!`, {
      icon: <CheckCircle2 className="text-primary" size={16} />
    })
  }

  const originalTotal = dealProducts.reduce((sum, p) => sum + p.price, 0)
  const savings = originalTotal - deal.bundlePrice

  return (
    <div className="min-h-screen bg-[#080808]">
      <Navbar />
      <div className="pt-20" />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 blur-[120px] -z-10 pointer-events-none translate-y-[-50%]" />
        
        <div className="max-w-7xl mx-auto">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-[10px] font-black text-white/40 hover:text-primary uppercase tracking-[0.2em] transition-colors mb-8"
          >
            <ArrowLeft size={14} /> Back to explore
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-2xl">
                  <Gift className="text-primary" size={32} />
                </div>
                <div className="bg-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full border border-primary/30">
                  Exclusive Bundle
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-4xl sm:text-7xl font-black text-white uppercase tracking-tighter leading-tight">
                  {deal.title}
                </h1>
                <p className="text-white/60 text-lg sm:text-xl max-w-2xl leading-relaxed font-medium">
                  {deal.description || "Grab this hand-picked collection at a fraction of its original price."}
                </p>
              </div>
            </div>

            <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl min-w-[320px] shadow-2xl relative overflow-hidden group">
              <Zap className="absolute -right-6 -top-6 w-32 h-32 text-white/5 -rotate-12 group-hover:text-primary/10 transition-colors duration-500" />
              
              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-end border-b border-white/5 pb-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Original Price</p>
                    <p className="text-lg font-bold text-white/40 line-through uppercase tracking-tighter">₹{originalTotal}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] font-mono text-primary uppercase tracking-widest font-black">Bundle Offer</p>
                    <p className="text-5xl font-black text-primary font-mono leading-none tracking-tighter">₹{deal.bundlePrice}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-xl border border-white/10">
                  <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">You Save</span>
                  <span className="text-xl font-black text-primary uppercase tracking-tighter">₹{savings}</span>
                </div>

                <button 
                  onClick={handleClaim}
                  className="w-full py-5 bg-primary text-black font-black text-sm uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_30px_rgba(212,175,55,0.4)] flex items-center justify-center gap-3"
                >
                  <ShoppingBag size={18} />
                  Claim Entire Bundle
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-8 h-px bg-primary" />
          <span className="text-primary text-xs font-mono tracking-[0.25em] uppercase font-bold">Included Products ({dealProducts.length})</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
          {dealProducts.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}
