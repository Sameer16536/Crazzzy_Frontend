/**
 * LenisProvider — Premium smooth scroll powered by Lenis.
 *
 * Behaviour:
 * - Wheel: gentle eased glide (lerp 0.08) — not sluggish, not jarring
 * - Trackpad: feels like a premium site (two-finger glide has momentum)
 * - Touch (mobile): disabled intentionally — native iOS/Android inertia
 *   scroll is already best-in-class; Lenis smooth touch can interfere
 * - Click-dragging the scrollbar still works normally
 *
 * The RAF loop is properly cancelled on unmount to prevent memory leaks.
 */

'use client'

import Lenis from 'lenis'
import { useEffect } from 'react'

export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      /** How quickly the scroll catches up — 0.08 = smooth but responsive */
      lerp: 0.08,
      /** Apply easing to wheel scroll events */
      smoothWheel: true,
      /** Multiplier for touch velocity */
      touchMultiplier: 2,
      /** Keep wheel multiplier at 1:1 */
      wheelMultiplier: 1,
    })

    let rafId: number

    /** RAF loop — drives Lenis on every animation frame */
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }

    rafId = requestAnimationFrame(raf)

    /** Cleanup: cancel RAF and destroy Lenis instance on unmount */
    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
