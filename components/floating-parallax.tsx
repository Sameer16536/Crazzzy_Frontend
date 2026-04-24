/**
 * Floating Parallax Component
 * Creates 3D parallax effect where images float and react to mouse movement
 * Uses Framer Motion for smooth animations and mouse tracking
 * Perfect for hero sections with dynamic visual interest
 */

'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import Image from 'next/image'

interface FloatingParallaxProps {
  imageUrl: string
  alt: string
  className?: string
  rotationAmount?: number
  positionOffset?: { x: number; y: number }
}

/**
 * FloatingParallaxImage - Single floating image with mouse parallax
 * Calculates 3D rotation based on cursor position relative to viewport
 * Creates subtle floating animation for continuous visual interest
 */
export function FloatingParallaxImage({
  imageUrl,
  alt,
  className = '',
  rotationAmount = 20,
  positionOffset = { x: 0, y: 0 },
}: FloatingParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-100, 100], [rotationAmount, -rotationAmount])
  const rotateY = useTransform(x, [-100, 100], [-rotationAmount, rotationAmount])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || !isClient) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    // Clamp values to prevent extreme rotations
    const moveX = Math.max(-100, Math.min(100, event.clientX - centerX))
    const moveY = Math.max(-100, Math.min(100, event.clientY - centerY))

    x.set(moveX * 0.5)
    y.set(moveY * 0.5)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative perspective ${className}`}
    >
      <motion.div
        animate={{
          y: [0, -20, 0],
          x: [-5, 5, -5],
        }}
        transition={{
          duration: 6,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
        style={
          isClient
            ? {
                rotateX,
                rotateY,
                transformPerspective: 1000,
              }
            : {}
        }
      >
        <Image
          src={imageUrl}
          alt={alt}
          width={300}
          height={300}
          className="w-full h-full object-cover rounded-lg shadow-2xl"
          quality={75}
          loading="lazy"
        />
      </motion.div>
    </div>
  )
}

/**
 * FloatingParallaxGrid - Container for multiple floating images
 * Positions images asymmetrically around a central area
 */
interface FloatingParallaxGridProps {
  images: Array<{
    url: string
    alt: string
  }>
}

export function FloatingParallaxGrid({ images }: FloatingParallaxGridProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null // Don't render on server to avoid hydration mismatch
  }

  const positions = [
    { x: -120, y: -80, size: 'w-48 h-48' },
    { x: 120, y: -100, size: 'w-64 h-64' },
    { x: 0, y: 100, size: 'w-56 h-56' },
  ]

  return (
    <div className="relative h-96 flex items-center justify-center">
      {images.slice(0, 3).map((img, idx) => (
        <div
          key={idx}
          className="absolute"
          style={{
            transform: `translate(${positions[idx].x}px, ${positions[idx].y}px)`,
          }}
        >
          <FloatingParallaxImage
            imageUrl={img.url}
            alt={img.alt}
            className={positions[idx].size}
          />
        </div>
      ))}
    </div>
  )
}
