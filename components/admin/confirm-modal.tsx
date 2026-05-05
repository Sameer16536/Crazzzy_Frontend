'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, Loader2 } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
  isLoading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Proceed',
  cancelText = 'Abort',
  isDestructive = true,
  isLoading = false
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={isLoading ? undefined : onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-zinc-950 border border-white/10 p-8 shadow-2xl space-y-6 overflow-hidden"
          >
            {/* Techy scanning line animation */}
            <motion.div 
              animate={{ 
                top: ['0%', '100%', '0%'] 
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="absolute left-0 right-0 h-px bg-primary/20 pointer-events-none"
            />

            <div className="flex items-start gap-5">
              <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-none border ${isDestructive ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                <AlertTriangle size={24} />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black uppercase tracking-tighter leading-none text-white">{title}</h2>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-px ${isDestructive ? 'bg-red-500/40' : 'bg-primary/40'}`} />
                  <span className={`text-[8px] font-mono tracking-[0.3em] uppercase ${isDestructive ? 'text-red-500/60' : 'text-primary/60'}`}>System Authorization Required</span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-widest font-medium border-l border-white/5 pl-4 ml-6">
              {description}
            </p>

            <div className="flex gap-3 pt-4 ml-6">
              <button
                type="button"
                disabled={isLoading}
                onClick={onClose}
                className="px-6 py-3 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/5 transition-all text-white/60 hover:text-white"
              >
                {cancelText}
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={onConfirm}
                className={`flex-1 px-6 py-3 text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 ${
                  isDestructive 
                    ? 'bg-red-600 text-white hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.2)]' 
                    : 'bg-primary text-black hover:bg-primary/90 shadow-[0_0_20px_rgba(var(--primary),0.2)]'
                }`}
              >
                {isLoading ? <Loader2 className="animate-spin" size={14} /> : confirmText}
              </button>
            </div>

            {/* Corner tech details */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-20">
                <div className="w-1 h-1 bg-white/20" />
                <div className="w-1 h-1 bg-white/40" />
                <div className="w-1 h-1 bg-white/60" />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
