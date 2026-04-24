/**
 * Animation Hooks
 * Reusable hooks for premium animation effects used throughout the app
 * Includes magnetic button effect, scroll animations, parallax, etc.
 */

import { useRef, useEffect, useState } from 'react'
import { useMotionValue, useTransform, animate } from 'framer-motion'

/**
 * useMagneticButton - Creates magnetic effect where element pulls toward cursor
 * Returns x and y motion values to apply to Framer Motion component
 * Useful for call-to-action buttons and interactive elements
 *
 * Usage:
 * const { x, y } = useMagneticButton()
 * <motion.button style={{ x, y }} />
 */
export function useMagneticButton(strength: number = 0.3) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return

      const rect = ref.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const distX = e.clientX - centerX
      const distY = e.clientY - centerY
      const distance = Math.sqrt(distX ** 2 + distY ** 2)

      // Only apply magnetic effect within 150px radius
      if (distance < 150) {
        x.set(distX * strength)
        y.set(distY * strength)
      } else {
        x.set(0)
        y.set(0)
      }
    }

    const handleMouseLeave = () => {
      x.set(0)
      y.set(0)
    }

    window.addEventListener('mousemove', handleMouseMove)
    ref.current?.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      ref.current?.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [x, y, strength])

  return { ref, x, y }
}

/**
 * useScrollDirection - Detects scroll direction (up/down)
 * Returns current scroll direction and normalized scroll position
 * Useful for hide-on-scroll navbar effects
 */
export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null)
  const [scrollY, setScrollY] = useState(0)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY.current) {
        setScrollDirection('down')
      } else {
        setScrollDirection('up')
      }

      setScrollY(currentScrollY)
      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return { scrollDirection, scrollY }
}

/**
 * useParallax - Simple parallax effect based on scroll position
 * offset - how far the element moves relative to scroll (0-1, where 0.5 = half speed of scroll)
 */
export function useParallax(offset: number = 0.5) {
  const ref = useRef<HTMLDivElement>(null)
  const [elementTop, setElementTop] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!ref.current) return

    const handleScroll = () => {
      const scrollY = window.scrollY
      const elementTop = ref.current!.getBoundingClientRect().top + scrollY

      // Only apply parallax when element is visible
      if (scrollY + window.innerHeight > elementTop && scrollY < elementTop + window.innerHeight * 2) {
        const yPos = (scrollY - elementTop) * offset
        if (ref.current) {
          ref.current.style.transform = `translateY(${yPos}px)`
        }
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [offset])

  return { ref, isVisible }
}

/**
 * useCountAnimation - Animate counter from 0 to target value
 * duration - animation duration in milliseconds
 * Useful for stats, product counts, etc.
 */
export function useCountAnimation(target: number, duration: number = 1000) {
  const [displayValue, setDisplayValue] = useState(0)
  const countRef = useRef(target)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      const currentValue = Math.floor(progress * target)
      setDisplayValue(currentValue)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrame)
  }, [target, duration])

  return displayValue
}

/**
 * useInViewAnimation - Trigger animation when element comes into view
 * Returns ref to attach to element
 */
export function useInViewAnimation() {
  const [isInView, setIsInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [])

  return { ref, isInView }
}
