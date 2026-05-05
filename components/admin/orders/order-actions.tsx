'use client'

import { useState } from 'react'
import { MoreVertical, Eye, Printer, Edit, X, RotateCcw, Truck, Loader2, Check } from 'lucide-react'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ConfirmModal } from '@/components/admin/confirm-modal'

interface OrderActionsProps {
  orderId: string
  onUpdate?: () => void
}

export function OrderActions({ orderId, onUpdate }: OrderActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showShipModal, setShowShipModal] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  const [shipData, setShipData] = useState({
    status: 'SHIPPED',
    trackingNumber: '',
    courierName: '',
    estimatedDelivery: '',
  })

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.patch(`/admin/orders/${orderId}/status`, shipData)
      toast.success('Order status updated and customer notified')
      setShowShipModal(false)
      if (onUpdate) onUpdate()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update order status')
    } finally {
      setIsSubmitting(false)
    }
  }
  const handleCancelOrder = async () => {
    setIsCancelling(true)
    try {
      await api.post(`/admin/orders/${orderId}/cancel`)
      toast.success('Order cancelled and stock restored')
      setShowCancelConfirm(false)
      if (onUpdate) onUpdate()
    } catch (error: any) {
      toast.error(error.message || 'Cancellation failed')
    } finally {
      setIsCancelling(false)
    }
  }
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-white/5 border border-white/10 rounded-lg transition-all text-white/40 hover:text-white hover:bg-white/10 active:scale-95"
      >
        <MoreVertical size={18} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-950 border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden">
            <button
              onClick={() => {
                setIsOpen(false)
                setShowShipModal(true)
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all text-white/60"
            >
              <Truck size={14} />
              <span>Ship / Update</span>
            </button>

            <Link
              href={`/account/orders/${orderId}`}
              className="w-full flex items-center space-x-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all text-white/60"
            >
              <Eye size={14} />
              <span>View Detail</span>
            </Link>

            <div className="border-t border-white/5" />

            <button
              onClick={() => {
                setIsOpen(false)
                setShowCancelConfirm(true)
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all text-red-500/60"
            >
              <X size={14} />
              <span>Cancel Order</span>
            </button>
          </div>
        </>
      )}

      {/* Ship Order Modal */}
      <AnimatePresence>
        {showShipModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
              onClick={() => setShowShipModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-zinc-900 border border-white/10 p-8 shadow-2xl space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-black uppercase tracking-tighter">Logistics Update</h2>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">Order ID: #{orderId.toString().padStart(6, '0')}</p>
              </div>

              <form onSubmit={handleStatusUpdate} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Fulfillment Status</label>
                    <select
                      value={shipData.status}
                      onChange={(e) => setShipData({ ...shipData, status: e.target.value })}
                      className="w-full bg-black border border-white/10 px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:border-primary/40 outline-none transition-all"
                    >
                      <option value="PAID">Paid</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  {['SHIPPED', 'DELIVERED'].includes(shipData.status) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4 pt-4 border-t border-white/5"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Carrier Name</label>
                          <input
                            type="text"
                            placeholder="e.g. BlueDart"
                            value={shipData.courierName}
                            onChange={(e) => setShipData({ ...shipData, courierName: e.target.value })}
                            className="w-full bg-black border border-white/10 px-4 py-3 text-[10px] font-bold uppercase focus:border-primary/40 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Tracking ID</label>
                          <input
                            type="text"
                            placeholder="TRK-XXXX-XXXX"
                            value={shipData.trackingNumber}
                            onChange={(e) => setShipData({ ...shipData, trackingNumber: e.target.value })}
                            className="w-full bg-black border border-white/10 px-4 py-3 text-[10px] font-mono font-bold uppercase focus:border-primary/40 outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Est. Delivery Date</label>
                        <input
                          type="date"
                          value={shipData.estimatedDelivery}
                          onChange={(e) => setShipData({ ...shipData, estimatedDelivery: e.target.value })}
                          className="w-full bg-black border border-white/10 px-4 py-3 text-[10px] font-bold uppercase focus:border-primary/40 outline-none transition-all"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowShipModal(false)}
                    className="flex-1 px-6 py-4 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-4 bg-primary text-black text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Update Status'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancelOrder}
        isLoading={isCancelling}
        title="Cancel Order"
        description="Are you sure you want to cancel this order? This action will immediately terminate the fulfillment process, restore inventory supply, and initiate refund protocols if applicable."
        confirmText="Yes, Cancel Order"
        cancelText="Abort"
        isDestructive={true}
      />
    </div>
  )
}

