'use client'

import { motion } from 'framer-motion'
import { Sparkles, Zap, Star, Gift } from 'lucide-react'

const PROMOTIONS = [
  { text: "Poster: buy 2 get 1 free", icon: <Star size={14} className="fill-blue-600 text-blue-600" /> },
  { text: "Davidoff Coffee candy : buy 1 get 1 free", icon: <Gift size={14} className="fill-red-600 text-red-600" /> },
  { text: "Keychain: buy 1 get 1 free", icon: <Sparkles size={14} className="fill-purple-600 text-purple-600" /> },
  { text: "Buy 5 posters at 500", icon: <Zap size={14} className="fill-orange-600 text-orange-600" /> },
]

export function PromotionTicker() {
  // Multiply items to ensure the track is long enough for the loop
  const items = [...PROMOTIONS, ...PROMOTIONS, ...PROMOTIONS, ...PROMOTIONS]

  return (
    <div className="w-full bg-primary border-y border-black/10 overflow-hidden py-2 z-40 relative">
      <motion.div
        className="flex whitespace-nowrap gap-12 w-max"
        animate={{ x: [0, "-33.33%"] }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {items.map((promo, idx) => (
          <div key={idx} className="flex items-center gap-3 px-4">
            {promo.icon}
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] text-black font-black">
              {promo.text}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
