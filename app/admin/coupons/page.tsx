'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api-client'
import { motion, AnimatePresence } from 'framer-motion'
import { Ticket, Search, Plus, Trash2, Loader2, Tag, Calendar, Percent } from 'lucide-react'
import { toast } from 'sonner'
import { AdminLayout } from '@/components/admin/layout'
import { ConfirmModal } from '@/components/admin/confirm-modal'

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [isRevoking, setIsRevoking] = useState(false)

  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'PERCENTAGE',
    value: '',
    minOrderAmount: '',
    expiryDate: '',
    usageLimit: '',
  })

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const res = await api.get<any>('/admin/coupons')
      const list = Array.isArray(res?.coupons) ? res.coupons : []
      setCoupons(list)
    } catch (error) {
      console.error('Failed to fetch coupons', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = {
        code: newCoupon.code,
        discountType: newCoupon.type,
        discountValue: Number(newCoupon.value),
        expiresAt: newCoupon.expiryDate || null,
        usageLimit: newCoupon.usageLimit ? Number(newCoupon.usageLimit) : null,
      }
      
      if (editingId) {
        await api.patch(`/admin/coupons/${editingId}`, payload)
        toast.success('Coupon updated successfully')
      } else {
        await api.post('/admin/coupons', payload)
        toast.success('Coupon deployed to marketing channels')
      }
      
      setShowAddModal(false)
      fetchCoupons()
    } catch (error: any) {
      toast.error(error.message || 'Deployment failure')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditModal = (c: any) => {
    setEditingId(c.id)
    setNewCoupon({
      code: c.code,
      type: c.discountType,
      value: String(c.discountValue),
      minOrderAmount: '',
      expiryDate: c.expiresAt ? new Date(c.expiresAt).toISOString().split('T')[0] : '',
      usageLimit: c.usageLimit ? String(c.usageLimit) : '',
    })
    setShowAddModal(true)
  }

  const openCreateModal = () => {
    setEditingId(null)
    setNewCoupon({
      code: '',
      type: 'PERCENTAGE',
      value: '',
      minOrderAmount: '',
      expiryDate: '',
      usageLimit: '',
    })
    setShowAddModal(true)
  }

  const handleDelete = (id: number) => {
    setConfirmDeleteId(id)
  }

  const confirmDelete = async () => {
    if (!confirmDeleteId) return
    setIsRevoking(true)
    try {
      await api.delete(`/admin/coupons/${confirmDeleteId}`)
      toast.success('Coupon revoked')
      setConfirmDeleteId(null)
      fetchCoupons()
    } catch (error: any) {
      toast.error('Revocation failed')
    } finally {
      setIsRevoking(false)
    }
  }

  const filteredCoupons = Array.isArray(coupons) ? coupons.filter(c => 
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  ) : []

  return (
    <AdminLayout>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-px bg-primary" />
              <span className="text-primary text-[10px] font-mono tracking-[0.3em] uppercase">Marketing</span>
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">COUPON REGISTRY</h1>
          </div>
          <button 
            onClick={openCreateModal}
            className="px-6 py-4 bg-primary text-black text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <Plus size={14} />
            Generate New
          </button>
        </div>

        {/* Toolbar */}
        <div className="relative group max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search Active Coupons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-white/5 px-12 py-4 text-[10px] font-black uppercase tracking-[0.2em] focus:outline-none focus:border-primary/30 transition-all text-white"
          />
        </div>

        {/* Table */}
        <div className="bg-zinc-900/30 border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-zinc-950/50">
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Code</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Benefit</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Expiry</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Usage</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 text-right">Control</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-20 text-center">
                      <Loader2 className="animate-spin text-primary mx-auto" size={32} />
                    </td>
                  </tr>
                ) : filteredCoupons.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <Tag className="text-primary" size={14} />
                        <span className="text-sm font-black font-mono tracking-wider text-white">{c.code}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="text-sm font-black text-white">
                        {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest">
                        <Calendar size={12} />
                        {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}
                      </div>
                    </td>
                    <td className="p-6 text-[10px] text-white/40 uppercase tracking-widest font-mono">
                      {c.usedCount} / {c.usageLimit || '∞'}
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(c)}
                          className="p-2 text-white/20 hover:text-primary hover:bg-primary/10 transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(c.id)}
                          className="p-2 text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {!loading && filteredCoupons.length === 0 && (
            <div className="py-20 text-center text-white/20 border-t border-white/5">
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">No marketing codes active.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-zinc-900 border border-white/10 p-8 shadow-2xl space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-black uppercase tracking-tighter">{editingId ? 'Edit Coupon' : 'Generate Coupon'}</h2>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">{editingId ? 'Modify existing discount artifact' : 'Create a new discount artifact'}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Code Designation</label>
                    <input
                      type="text"
                      required
                      placeholder="CRAZZZY50"
                      value={newCoupon.code}
                      onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                      className="w-full bg-black border border-white/10 px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:border-primary/40 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Value Type</label>
                    <select
                      value={newCoupon.type}
                      onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })}
                      className="w-full bg-black border border-white/10 px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:border-primary/40 outline-none transition-all"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED">Fixed Amount (₹)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Benefit Value</label>
                    <input
                      type="number"
                      required
                      value={newCoupon.value}
                      onChange={(e) => setNewCoupon({ ...newCoupon, value: e.target.value })}
                      className="w-full bg-black border border-white/10 px-4 py-3 text-[10px] font-mono font-bold focus:border-primary/40 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Expiry Date</label>
                    <input
                      type="date"
                      value={newCoupon.expiryDate}
                      onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                      className="w-full bg-black border border-white/10 px-4 py-3 text-[10px] font-bold uppercase focus:border-primary/40 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Usage Limit (Optional)</label>
                    <input
                      type="number"
                      value={newCoupon.usageLimit}
                      onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: e.target.value })}
                      className="w-full bg-black border border-white/10 px-4 py-3 text-[10px] font-mono font-bold focus:border-primary/40 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-6 py-4 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-4 bg-primary text-black text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={16} /> : (editingId ? 'Update Code' : 'Deploy Code')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={confirmDelete}
        isLoading={isRevoking}
        title="Revoke Artifact"
        description="Are you sure you want to revoke this coupon code? This action will immediately deactivate the discount artifact and prevent further usage across all universe nodes."
        confirmText="Yes, Revoke"
        cancelText="Abort"
        isDestructive={true}
      />
    </AdminLayout>
  )
}
