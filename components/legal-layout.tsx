'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Navbar } from './navbar'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface LegalLayoutProps {
  title: string
  lastUpdated?: string
  children: React.ReactNode
}

export function LegalLayout({ title, lastUpdated, children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-12"
        >
          <div className="space-y-4">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group text-sm font-mono uppercase tracking-widest"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
            <h1 className="text-4xl sm:text-6xl font-black text-foreground tracking-tight leading-none uppercase">
              {title}
            </h1>
            {lastUpdated && (
              <p className="text-muted-foreground text-xs font-mono uppercase tracking-widest">
                Last Updated: {lastUpdated}
              </p>
            )}
          </div>

          <div className="prose prose-invert prose-primary max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground">
            {children}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
