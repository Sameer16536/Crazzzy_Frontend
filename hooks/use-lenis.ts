/**
 * useLenis - Hook for Lenis smooth scrolling integration
 * Initializes Lenis on mount and cleans up on unmount
 * Perfect for premium scroll experiences without blocking
 */

'use client'

import { useEffect } from 'react'

/**
 * Initialize Lenis smooth scrolling
 * Configuration:
 * - duration: 1.2 - Smooth scroll duration in seconds
 * - easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) - Custom easing function
 * - smooth: true - Enable smooth scrolling
 * - direction: vertical - Scrolling direction
 * - gestureOrientation: vertical - Gesture detection
 * - syncTouch: false - Prevent touch conflicts
 */
export function useLenis() {
  useEffect(() => {
    // ✓ LENIS DISABLED: Using native browser scroll for stability
    // Lenis was causing scroll blocking due to initialization issues
    console.log('✓ Using native browser scrolling')
    return
  }, [])
}

