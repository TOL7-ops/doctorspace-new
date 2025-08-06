'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Rating } from '@/components/ui/rating'

interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (rating: number, comment?: string) => Promise<void>
  doctorName: string
  isLoading?: boolean
}

export function RatingModal({
  isOpen,
  onClose,
  onSubmit,
  doctorName,
  isLoading = false
}: RatingModalProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  const handleSubmit = async () => {
    if (rating === 0) {
      return
    }

    try {
      await onSubmit(rating, comment.trim() || undefined)
      onClose()
      // Reset form
      setRating(0)
      setComment('')
    } catch (error) {
      console.error('Error submitting rating:', error)
    }
  }

  const handleClose = () => {
    onClose()
    // Reset form
    setRating(0)
    setComment('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Rate Your Experience</DialogTitle>
          <DialogDescription>
            How was your appointment with Dr. {doctorName}? Your feedback helps us improve our services.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Rating</Label>
            <Rating
              value={rating}
              onChange={setRating}
              size="lg"
              showValue
              className="justify-center"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Additional Comments (optional)</Label>
            <Textarea
              id="comment"
              placeholder="Share your experience, suggestions, or any other feedback..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 