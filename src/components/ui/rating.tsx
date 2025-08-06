'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingProps {
  value: number
  onChange: (rating: number) => void
  max?: number
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  showValue?: boolean
  className?: string
}

export function Rating({
  value,
  onChange,
  max = 5,
  size = 'md',
  disabled = false,
  showValue = false,
  className
}: RatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  const handleMouseEnter = (rating: number) => {
    if (!disabled) {
      setHoverValue(rating)
    }
  }

  const handleMouseLeave = () => {
    if (!disabled) {
      setHoverValue(null)
    }
  }

  const handleClick = (rating: number) => {
    if (!disabled) {
      onChange(rating)
    }
  }

  const displayValue = hoverValue !== null ? hoverValue : value

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex items-center gap-1">
        {Array.from({ length: max }, (_, index) => {
          const rating = index + 1
          const isFilled = rating <= displayValue
          
          return (
            <button
              key={rating}
              type="button"
              className={cn(
                'transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm',
                disabled && 'cursor-not-allowed',
                !disabled && 'cursor-pointer hover:scale-110'
              )}
              onMouseEnter={() => handleMouseEnter(rating)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(rating)}
              disabled={disabled}
              aria-label={`Rate ${rating} out of ${max} stars`}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  isFilled
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300 dark:text-gray-600'
                )}
              />
            </button>
          )
        })}
      </div>
      {showValue && (
        <span className="text-sm text-muted-foreground">
          {displayValue} out of {max}
        </span>
      )}
    </div>
  )
} 