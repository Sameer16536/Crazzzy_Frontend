'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
        <div className="absolute inset-0 backdrop-blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md z-10"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/50 hover:text-primary transition-colors mb-8 text-sm font-mono uppercase tracking-widest group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Store
        </Link>

        <div className="bg-zinc-900/50 backdrop-blur-md border border-white/10 p-8 sm:p-12 space-y-8 relative overflow-hidden">
          {/* Gold Corner Accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/30" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/30" />
          
          {children}
        </div>

        <p className="mt-8 text-center text-white/30 text-xs font-mono uppercase tracking-[0.2em]">
          © {new Date().getFullYear()} Crazzzy Store • Premium Aesthetic
        </p>
      </motion.div>
    </div>
  )
}
