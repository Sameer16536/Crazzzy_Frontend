/**
 * Bento Grid Categories — v4
 *
 * Shows ALL 9 categories:
 *  - First 6: asymmetric CSS grid-template-areas (4-col desktop)
 *  - Last 3: "break row" — a full-width 3-col strip with a distinct
 *    glassmorphism aesthetic so it feels intentional, not like overflow
 *
 * Glassmorphism cards:
 *  - bg: rgba(255,255,255,0.03)
 *  - backdrop-filter: blur(20px)
 *  - border: 1px solid rgba(255,255,255,0.10)
 *
 * Staggered entrance: container variants → staggerChildren: 0.09s
 * GPU-accelerated: will-change: transform on every card
 *
 * Perfume (white studio bg) fix: object-contain + dark fill bg
 */

'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useCatalog } from '@/lib/catalog/use-catalog'
import Image from 'next/image'
import { ArrowUpRight, Layers } from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

type AreaName = 'tall' | 'sm1' | 'sm2' | 'wide' | 'sm3' | 'sm4'

interface AreaConfig {
  area: AreaName
  aspectRatio: string
}

const AREA_MAP: AreaConfig[] = [
  { area: 'tall', aspectRatio: '1 / 2' },
  { area: 'sm1',  aspectRatio: '1 / 1' },
  { area: 'sm2',  aspectRatio: '1 / 1' },
  { area: 'wide', aspectRatio: '2 / 1' },
  { area: 'sm3',  aspectRatio: '1 / 1' },
  { area: 'sm4',  aspectRatio: '1 / 1' },
]

/**
 * Desktop 4-col grid-template-areas.
 * `display` is intentionally omitted — Tailwind `hidden md:grid` controls it
 * so the inline style doesn't override `display: none` from `hidden`.
 */
const GRID_STYLE: React.CSSProperties = {
  gridTemplateColumns: 'repeat(4, 1fr)',
  gridTemplateRows: 'auto',
  gridTemplateAreas: `
    "tall sm1  sm2  sm2"
    "tall wide wide wide"
    "tall sm3  sm4  sm4"
  `,
  gap: '12px',
}

/** Mobile 2-col style. `display` omitted — Tailwind `md:hidden` controls it. */
const GRID_STYLE_MOBILE: React.CSSProperties = {
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '10px',
}

// ─── Animation Variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
}

const cardVariants = {
  hidden:  { opacity: 0, y: 32, scale: 0.96 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] },
  },
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CONTAIN_CATEGORIES = new Set(['perfumes'])

// ─── Glassmorphism panel style ────────────────────────────────────────────────

const glassPanel: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.10)',
}

// ─── Shared Card Inner ───────────────────────────────────────────────────────

interface CardInnerProps {
  href: string
  category: {
    name: string
    image?: string
    color: string
    description: string
  }
  useContain?: boolean
  sizes?: string
}

function CardInner({ href, category, useContain = false, sizes = '25vw' }: CardInnerProps) {
  return (
    <Link href={href} className="absolute inset-0 z-20 block" aria-label={`Shop ${category.name}`}>
      {/* Background Image */}
      <div className="absolute inset-0" style={useContain ? { backgroundColor: '#0d0d12' } : undefined}>
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            className={[
              'transition-transform duration-700 group-hover:scale-110',
              useContain ? 'object-contain' : 'object-cover',
            ].join(' ')}
            quality={75}
            sizes={sizes}
          />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: `radial-gradient(ellipse 80% 60% at 50% 30%, ${category.color}50 0%, ${category.color}15 60%, transparent 100%)` }}
          />
        )}
      </div>

      {/* Glass sheen overlay */}
      <div className="absolute inset-0" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'inherit' }} />

      {/* Dark gradient scrim */}
      <div className={['absolute inset-0',
        useContain ? 'bg-gradient-to-t from-black/80 via-black/40 to-black/20'
                   : 'bg-gradient-to-t from-black/75 via-black/20 to-black/5',
      ].join(' ')} />

      {/* Always-visible name pill */}
      <div className="absolute bottom-4 left-4 z-10 transition-all duration-300 group-hover:opacity-0 group-hover:translate-y-2">
        <span
          className="text-[10px] sm:text-xs font-bold text-white tracking-wider uppercase drop-shadow-md"
        >
          {category.name}
        </span>
      </div>

      {/* Hover detail panel (glassmorphism) */}
      <div className="absolute inset-x-0 bottom-0 z-10 translate-y-full group-hover:translate-y-0 transition-transform duration-[400ms] ease-out">
        <div className="mx-2.5 mb-2.5 p-3 sm:p-4 rounded-xl" style={glassPanel}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-white leading-tight truncate">{category.name}</h3>
              <p className="text-[10px] sm:text-xs text-white/60 mt-0.5 line-clamp-1">{category.description}</p>
            </div>
            <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: category.color }}>
              <ArrowUpRight size={12} className="text-black" />
            </div>
          </div>
        </div>
      </div>

      {/* Corner colour glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${category.color}30, transparent 60%)` }}
      />
    </Link>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonCard({ area, aspectRatio }: AreaConfig) {
  return <div style={{ gridArea: area, aspectRatio }} className="rounded-2xl bg-muted/30 animate-pulse" />
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function BentoGridCategories() {
  const { data, isLoading } = useCatalog()
  const categories = data?.categories ?? []

  if (isLoading) {
    return (
      <div className="space-y-3">
        {/* Desktop skeleton */}
        <div style={GRID_STYLE} className="hidden md:grid w-full">
          {AREA_MAP.map((cfg) => <SkeletonCard key={cfg.area} {...cfg} />)}
        </div>
        {/* Break-row skeleton */}
        <div className="hidden md:grid grid-cols-3 gap-3 w-full">
          {[0, 1, 2].map((i) => <div key={i} className="rounded-2xl bg-muted/30 animate-pulse aspect-[4/3]" />)}
        </div>
        {/* Mobile skeleton */}
        <div style={GRID_STYLE_MOBILE} className="md:hidden w-full">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-muted/30 animate-pulse aspect-square" />
          ))}
        </div>
      </div>
    )
  }

  // Split: first 6 go into the bento, rest (3) go into the break-row
  const bentoCategories = categories.slice(0, 6)
  const breakCategories = categories.slice(6)

  return (
    <div className="space-y-3">

      {/* ══════════════════════════════════════════════════════
          DESKTOP BENTO (md+) — asymmetric 4-col grid
          ══════════════════════════════════════════════════════ */}
      <motion.div
        style={GRID_STYLE}
        className="hidden md:grid w-full"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
      >
        {bentoCategories.map((category, idx) => {
          const cfg = AREA_MAP[idx]
          return (
            <motion.div
              key={category.id}
              style={{ gridArea: cfg.area, willChange: 'transform' }}
              variants={cardVariants}
              className="group relative overflow-hidden rounded-2xl cursor-pointer"
            >
              <div style={{ aspectRatio: cfg.aspectRatio }} className="relative w-full h-full">
                <CardInner
                  href={`/shop/${category.slug}`}
                  category={category}
                  useContain={CONTAIN_CATEGORIES.has(category.id)}
                  sizes="(max-width: 1024px) 33vw, 20vw"
                />
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* ══════════════════════════════════════════════════════
          DESKTOP BREAK ROW — remaining categories (3)
          A visual "break" from the bento: full-width 3-col
          strip with a slightly different card treatment.
          ══════════════════════════════════════════════════════ */}
      {breakCategories.length > 0 && (
        <motion.div
          className="hidden md:grid w-full"
          style={{ gridTemplateColumns: `repeat(${breakCategories.length}, 1fr)`, gap: '12px' }}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {breakCategories.map((category) => (
            <motion.div
              key={category.id}
              style={{ willChange: 'transform' }}
              variants={cardVariants}
              className="group relative overflow-hidden rounded-2xl cursor-pointer"
            >
              {/* Taller aspect ratio for the break row items */}
              <div
                className="relative w-full"
                style={{ aspectRatio: '4 / 3' }}
              >
                <CardInner
                  href={`/shop/${category.slug}`}
                  category={category}
                  useContain={CONTAIN_CATEGORIES.has(category.id)}
                  sizes="33vw"
                />
                {/* Gold top-border accent — signals this is a distinct row */}
                <div
                  className="absolute top-0 inset-x-0 h-[2px] z-30 pointer-events-none"
                  style={{ background: `linear-gradient(90deg, transparent, ${category.color}80, transparent)` }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════
          MOBILE — simple 2-col grid, all 9 categories
          ══════════════════════════════════════════════════════ */}
      <motion.div
        style={GRID_STYLE_MOBILE}
        className="md:hidden w-full"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        {categories.map((category) => (
          <motion.div
            key={category.id}
            style={{ willChange: 'transform' }}
            variants={cardVariants}
            className="group relative overflow-hidden rounded-2xl cursor-pointer aspect-square"
          >
            <CardInner
              href={`/shop/${category.slug}`}
              category={category}
              useContain={CONTAIN_CATEGORIES.has(category.id)}
              sizes="50vw"
            />
          </motion.div>
        ))}
      </motion.div>

    </div>
  )
}
