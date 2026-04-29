'use client'

import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'

interface ReviewFormProps {
  productId: number
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialRating?: number
  initialComment?: string
}

export function ReviewForm({ productId, isOpen, onClose, onSuccess, initialRating = 0, initialComment = '' }: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating)
  const [comment, setComment] = useState(initialComment)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hoveredRating, setHoveredRating] = useState(0)

  // Reset/set initial values when modal opens
  useEffect(() => {
    if (isOpen) {
      setRating(initialRating)
      setComment(initialComment)
    }
  }, [isOpen, initialRating, initialComment])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    try {
      setIsSubmitting(true)
      await api.post(`/products/${productId}/reviews`, { rating, comment })
      toast.success('Review saved successfully')
      onSuccess()
      onClose()
      setRating(0)
      setComment('')
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-background border-border p-8">
        <DialogHeader className="space-y-4 mb-6">
          <DialogTitle className="text-3xl font-black uppercase tracking-tighter">Write a Review</DialogTitle>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Share your experience with the community</p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i)}
                  onMouseEnter={() => setHoveredRating(i)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform active:scale-90"
                >
                  <Star
                    size={28}
                    className={`
                      transition-colors duration-200
                      ${(hoveredRating || rating) >= i ? 'fill-primary text-primary' : 'text-muted-foreground/20'}
                    `}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Your Thoughts</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What do you think about this piece?"
              required
              className="w-full bg-muted/30 border border-border p-4 text-sm focus:outline-none focus:border-primary transition-colors min-h-[120px] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-primary-foreground font-black py-4 uppercase tracking-[0.2em] text-xs hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? 'Transmitting...' : 'Submit Review'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
