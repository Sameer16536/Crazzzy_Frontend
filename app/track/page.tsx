/**
 * Track Order Page
 * Allows customers to track their Crazzzy Store orders by order ID
 */

'use client'

import { Navbar } from '@/components/navbar'
import { motion } from 'framer-motion'
import { Package, Search, Truck, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

/** Order status steps for display */
const TRACKING_STEPS = [
  { icon: CheckCircle, label: 'Order Confirmed',   desc: 'We received your order' },
  { icon: Package,      label: 'Processing',        desc: 'Your items are being packed' },
  { icon: Truck,        label: 'Out for Delivery',  desc: 'On the way to you' },
  { icon: CheckCircle, label: 'Delivered',          desc: 'Enjoy your purchase!' },
]

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('')
  const [searched, setSearched] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (orderId.trim()) setSearched(true)
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
        {searched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-card border border-border/50 rounded-2xl p-8 space-y-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Order ID</p>
                <p className="font-mono font-bold text-foreground text-lg">{orderId}</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <Clock size={14} className="text-primary" />
                <span className="text-primary text-sm font-semibold">In Transit</span>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="space-y-6">
              {TRACKING_STEPS.map((step, i) => {
                const Icon = step.icon
                const isComplete = i < 2 // Demo: first 2 steps complete
                const isCurrent = i === 2

                return (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div
                      className={`p-2 rounded-full flex-shrink-0 mt-0.5 ${
                        isComplete
                          ? 'bg-primary text-primary-foreground'
                          : isCurrent
                            ? 'bg-primary/20 text-primary'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <p
                        className={`font-semibold ${
                          isComplete || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {step.label}
                        {isCurrent && (
                          <span className="ml-2 text-xs text-primary font-normal">● Active</span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">{step.desc}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <p className="text-xs text-muted-foreground border-t border-border/30 pt-4">
              For real-time updates, please contact{' '}
              <a href="mailto:info@crazzzy.com" className="text-primary hover:underline">
                info@crazzzy.com
              </a>{' '}
              with your order ID.
            </p>
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
