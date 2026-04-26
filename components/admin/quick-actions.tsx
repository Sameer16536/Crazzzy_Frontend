'use client'

import Link from 'next/link'
import { Plus, Package, Users, BarChart3, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

export function QuickActions() {
  const actions = [
    {
      title: 'Deploy Artifact',
      description: 'Upload and list a new product',
      icon: Plus,
      href: '/admin/products/new',
      color: 'text-primary',
    },
    {
      title: 'Registry Control',
      description: 'Manage all store orders',
      icon: Package,
      href: '/admin/orders',
      color: 'text-blue-500',
    },
    {
      title: 'Agent Database',
      description: 'User profiles and activity',
      icon: Users,
      href: '/admin/customers',
      color: 'text-purple-500',
    },
    {
      title: 'System Intel',
      description: 'Deep analytics and traffic',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'text-green-500',
    },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Rapid Response</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {actions.map((action, i) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link 
              href={action.href}
              className="group block bg-zinc-900/30 border border-white/5 p-8 space-y-6 hover:border-white/20 transition-all relative overflow-hidden"
            >
              <div className={action.color}>
                 <action.icon size={24} />
              </div>
              <div className="space-y-2">
                <h3 className="font-black text-sm uppercase tracking-widest group-hover:text-primary transition-colors">{action.title}</h3>
                <p className="text-[10px] text-white/30 uppercase tracking-widest">{action.description}</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                Execute <ChevronRight size={14} />
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 -rotate-45 translate-x-12 -translate-y-12 group-hover:bg-primary/5 transition-colors" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
