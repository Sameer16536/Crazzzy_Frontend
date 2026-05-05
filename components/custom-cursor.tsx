/**
 * Custom Cursor Component
 * Replaces default cursor with premium animated dot + expanding ring on hover.
 *
 * Fixes applied:
 * - Always starts visible (no waiting for mouseenter)
 * - Uses document-level listeners, not window (more reliable)
 * - pointer-events: none on ALL cursor elements so clicks pass through
 * - No stale closure issues — position tracked via ref to avoid re-render loops
 * - Graceful SSR guard (only mounts on client)
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

/**
 * CustomCursor - Smooth spring-animated cursor that expands on interactive elements.
 * All cursor divs use pointer-events:none so underlying buttons/links are fully clickable.
 */
export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  // Raw mouse coordinates (updated on every mousemove, no re-render)
  const rawX = useMotionValue(-100)
  const rawY = useMotionValue(-100)

  // Spring-smoothed versions for the outer ring (lags slightly behind)
  const springX = useSpring(rawX, { stiffness: 300, damping: 28, mass: 0.5 })
  const springY = useSpring(rawY, { stiffness: 300, damping: 28, mass: 0.5 })

  useEffect(() => {
    setMounted(true)
    const checkDevice = () => {
      setIsDesktop(window.innerWidth >= 1024 && window.matchMedia('(pointer: fine)').matches)
    }
    
    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  useEffect(() => {
    if (!isDesktop) {
      document.documentElement.style.cursor = ''
      return
    }

    /**
     * Track mouse position via MotionValues to avoid triggering React re-renders
     * on every mouse-move — keeps the cursor perfectly smooth.
     */
    const onMove = (e: MouseEvent) => {
      rawX.set(e.clientX)
      rawY.set(e.clientY)

      // Determine hover state without re-rendering on every pixel
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
      const interactive =
        el?.tagName === 'A' ||
        el?.tagName === 'BUTTON' ||
        el?.closest('a') !== null ||
        el?.closest('button') !== null ||
        el?.classList.contains('cursor-interactive') ||
        el?.closest('[data-cursor-interactive]') !== null

      setIsHovering(!!interactive)
    }

    // Hide the native cursor globally
    document.documentElement.style.cursor = 'none'

    document.addEventListener('mousemove', onMove, { passive: true })

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.documentElement.style.cursor = ''
    }
  }, [rawX, rawY, isDesktop])

  // Don't render on server or mobile devices
  if (!mounted || !isDesktop) return null

  return (
    <>
      {/* ─── Outer expanding ring (spring-smoothed, lags slightly) ─── */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[99999]"
        style={{
          x: springX,
          y: springY,
          translateX: isHovering ? '-24px' : '-6px',
          translateY: isHovering ? '-24px' : '-6px',
        }}
      >
        <motion.div
          animate={{
            width:   isHovering ? 48 : 12,
            height:  isHovering ? 48 : 12,
            opacity: isHovering ? 0.8 : 0,
            borderWidth: isHovering ? 2 : 0,
          }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="rounded-full border-primary border-solid"
          style={{ borderColor: '#d4af37' }}
        />
      </motion.div>

      {/* ─── Inner dot (tracks raw position instantly — no spring) ─── */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[99999]"
        style={{
          x: rawX,
          y: rawY,
          translateX: '-5px',
          translateY: '-5px',
        }}
      >
        <motion.div
          animate={{
            scale:           isHovering ? 0.5 : 1,
            backgroundColor: isHovering ? '#d4af37' : '#f0f0eb',
          }}
          transition={{ duration: 0.15 }}
          className="w-[10px] h-[10px] rounded-full shadow-[0_0_8px_rgba(212,175,55,0.6)]"
        />
      </motion.div>
    </>
  )
}
