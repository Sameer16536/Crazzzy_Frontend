/**
 * useMouseParallax — rAF-throttled mouse-tracking hook for floating parallax effects.
 *
 * Returns normalised x/y offsets in the range [-1, 1] relative to the viewport centre.
 * Uses requestAnimationFrame to throttle updates to ~60fps so the main thread is
 * never overloaded, and wraps values in Framer Motion MotionValues for smooth
 * GPU-accelerated transforms without causing React re-renders.
 *
 * Usage:
 *   const { x, y } = useMouseParallax(0.02)
 *   <motion.div style={{ x, y }} />
 */

'use client'

import { useEffect } from 'react'
import { useMotionValue, useSpring } from 'framer-motion'

/**
 * @param strength - multiplier applied to the raw offset (e.g. 0.02 = subtle float).
 *                   Positive values move WITH the cursor; negative values move AGAINST it.
 * @param stiffness - spring stiffness (lower = more lag / dreaminess)
 * @param damping   - spring damping (higher = less oscillation)
 */
export function useMouseParallax(
  strength: number = 0.02,
  stiffness: number = 80,
  damping: number = 20,
) {
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)

  // Spring-smooth the raw values so movement feels physical, not mechanical
  const x = useSpring(rawX, { stiffness, damping })
  const y = useSpring(rawY, { stiffness, damping })

  useEffect(() => {
    let rafId: number | null = null

    const handleMove = (e: MouseEvent) => {
      // Cancel any pending frame — only process the latest position per frame
      if (rafId !== null) cancelAnimationFrame(rafId)

      rafId = requestAnimationFrame(() => {
        // Normalise to [-0.5, 0.5] then apply strength
        const nx = (e.clientX / window.innerWidth - 0.5) * strength * window.innerWidth
        const ny = (e.clientY / window.innerHeight - 0.5) * strength * window.innerHeight

        rawX.set(nx)
        rawY.set(ny)
        rafId = null
      })
    }

    window.addEventListener('mousemove', handleMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMove)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [rawX, rawY, strength])

  return { x, y }
}
