/**
 * TrendIcon Component
 * 
 * Simple upward/downward arrow indicator
 * Used in metric cards to show trend direction
 */

import { TrendingUp, TrendingDown } from 'lucide-react'

interface TrendIconProps {
  trend: 'up' | 'down'
}

export function TrendIcon({ trend }: TrendIconProps) {
  return trend === 'up' ? (
    <TrendingUp size={16} className="text-emerald-600" />
  ) : (
    <TrendingDown size={16} className="text-red-600" />
  )
}
