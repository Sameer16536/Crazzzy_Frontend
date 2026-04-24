/**
 * Kinetic Typography Component
 * Animates text with a mask-up reveal effect
 * Each letter reveals from bottom to top with staggered timing
 * Creates dynamic, engaging hero text animations
 */

'use client'

import { motion } from 'framer-motion'

interface KineticTypographyProps {
  text: string
  className?: string
  delay?: number
}

/**
 * animationVariants - Framer Motion variants for mask-up animation
 * Uses opacity and translateY to create smooth letter reveal
 * Each letter starts below its final position and fades in
 */
const charVariants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.8,
      ease: 'easeOut' as const,
    },
  }),
}

export function KineticTypography({ text, className = '', delay = 0 }: KineticTypographyProps) {
  const chars = text.split('')

  return (
    <motion.span
      className={className}
      initial="hidden"
      animate="visible"
    >
      {chars.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          custom={i}
          variants={charVariants}
          className="inline-block"
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.span>
  )
}

/**
 * MultiLineKineticTypography - Version that maintains line breaks
 * Useful for multi-line headers
 */
export function MultiLineKineticTypography({
  text,
  className = '',
}: Omit<KineticTypographyProps, 'delay'>) {
  // Split by newline character and filter empty lines
  const lines = text.split('\n').filter(line => line.length > 0)
  let charIndex = 0

  return (
    <div className="leading-tight">
      {lines.map((line, lineIdx) => (
        <motion.div
          key={`line-${lineIdx}`}
          initial="hidden"
          animate="visible"
          className={className}
        >
          {line.split('').map((char) => {
            const idx = charIndex
            charIndex++
            return (
              <motion.span
                key={`${char}-${idx}`}
                custom={idx}
                variants={charVariants}
                className="inline-block"
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            )
          })}
        </motion.div>
      ))}
    </div>
  )
}
