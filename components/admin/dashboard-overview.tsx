'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api-client'
import { motion } from 'framer-motion'
import { DollarSign, ShoppingCart, Users, TrendingUp, TrendingDown, Activity, Loader2 } from 'lucide-react'

export function DashboardOverview() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        const res = await api.get<any>('/admin/stats')
        setStats(res?.data || res)
      } catch (error) {
        console.error('Failed to fetch admin stats', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    )
  }

  const metrics = [
    {
      label: 'Total Revenue',
      value: `₹${parseFloat(stats?.totalRevenue || 0).toLocaleString('en-IN')}`,
      change: stats?.revenueChange || 0,
      icon: DollarSign,
      color: 'text-green-500',
    },
    {
      label: 'Orders',
      value: stats?.totalOrders || 0,
      change: stats?.ordersChange || 0,
      icon: ShoppingCart,
      color: 'text-blue-500',
    },
    {
      label: 'Customers',
      value: stats?.totalUsers || 0,
      change: stats?.usersChange || 0,
      icon: Users,
      color: 'text-purple-500',
    },
    {
      label: 'Avg Order Value',
      value: `₹${parseFloat(stats?.avgOrderValue || 0).toLocaleString('en-IN')}`,
      change: stats?.avgValueChange || 0,
      icon: Activity,
      color: 'text-primary',
    },
  ]

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-px bg-primary" />
            <span className="text-primary text-[10px] font-mono tracking-[0.3em] uppercase">Intelligence</span>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">COMMAND OVERVIEW</h1>
        </div>
        <div className="flex items-center gap-4 bg-zinc-900/50 border border-white/5 px-6 py-4">
           <div className="flex flex-col">
             <span className="text-[8px] text-white/40 uppercase tracking-widest mb-1">System Status</span>
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-widest text-green-500">All Systems Operational</span>
             </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-zinc-900/30 border border-white/5 p-8 space-y-6 relative group overflow-hidden"
          >
            <div className="flex justify-between items-start">
               <div className="p-3 bg-white/5 border border-white/5 text-white/40 group-hover:text-white transition-colors">
                 <m.icon size={20} />
               </div>
               <div className={`flex items-center gap-1 text-[10px] font-black ${m.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                 {m.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                 {Math.abs(m.change)}%
               </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black font-mono">{m.value}</p>
              <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">{m.label}</p>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
