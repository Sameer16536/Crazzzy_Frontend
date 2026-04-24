/**
 * Mesh Gradient Background
 * Animated gradient background with slow-moving, organic morph effect
 * Uses CSS gradients with animation for a premium, AI-generated aesthetic
 * Perfect for hero sections with minimal performance impact
 */

'use client'

import { motion } from 'framer-motion'

export function MeshGradient() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-background via-background to-background -z-10">
      {/* Primary gradient blob */}
      <motion.div
        className="absolute -top-1/2 -left-1/4 w-96 h-96 rounded-full mix-blend-screen filter blur-3xl opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, transparent 70%)',
        }}
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -100, 50, 0],
        }}
        transition={{
          duration: 15,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
      />

      {/* Secondary gradient blob */}
      <motion.div
        className="absolute top-1/4 -right-1/4 w-96 h-96 rounded-full mix-blend-screen filter blur-3xl opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.2) 0%, transparent 70%)',
        }}
        animate={{
          x: [0, -80, 50, 0],
          y: [0, 80, -50, 0],
        }}
        transition={{
          duration: 18,
          ease: 'easeInOut',
          repeat: Infinity,
          delay: 1,
        }}
      />

      {/* Tertiary gradient blob */}
      <motion.div
        className="absolute bottom-0 left-1/3 w-96 h-96 rounded-full mix-blend-screen filter blur-3xl opacity-10"
        style={{
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
        }}
        animate={{
          x: [0, 60, -70, 0],
          y: [0, -60, 80, 0],
        }}
        transition={{
          duration: 20,
          ease: 'easeInOut',
          repeat: Infinity,
          delay: 2,
        }}
      />
    </div>
  )
}
