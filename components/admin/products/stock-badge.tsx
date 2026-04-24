/**
 * StockBadge Component
 * 
 * Visual indicator for product stock levels
 * Color coding:
 * - Red: Out of stock (0 items)
 * - Yellow: Low stock (1-10 items)
 * - Green: In stock (11+ items)
 */

interface StockBadgeProps {
  stock: number
}

export function StockBadge({ stock }: StockBadgeProps) {
  let bgColor = 'bg-green-100/50 text-green-700'
  let label = `${stock} in stock`

  if (stock === 0) {
    bgColor = 'bg-red-100/50 text-red-700'
    label = 'Out of stock'
  } else if (stock <= 10) {
    bgColor = 'bg-yellow-100/50 text-yellow-700'
    label = `${stock} low stock`
  }

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${bgColor}`}>
      {label}
    </span>
  )
}
