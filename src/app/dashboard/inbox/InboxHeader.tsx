'use client'

import { Button } from '@/components/ui/button'

interface InboxHeaderProps {
  hasUnreadMessages: boolean
  onMarkAllAsRead?: () => void
}

export function InboxHeader({ hasUnreadMessages, onMarkAllAsRead }: InboxHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Inbox</h1>
        <p className="text-muted-foreground">
          Your messages and notifications
        </p>
      </div>
      {hasUnreadMessages && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={onMarkAllAsRead}
        >
          Mark all as read
        </Button>
      )}
    </div>
  )
} 