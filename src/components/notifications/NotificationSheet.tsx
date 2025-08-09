"use client"

import React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import { Trash2, Check } from "lucide-react"

export interface NotificationItem {
  id: string
  title?: string
  message?: string
  read?: boolean
  created_at?: string
}

interface NotificationSheetProps {
  notifications: NotificationItem[]
  unreadCount: number
  onMarkAllRead: () => Promise<void> | void
  onClear: () => Promise<void> | void
  onMarkAsRead: (id: string) => Promise<void> | void
  onDelete: (id: string) => Promise<void> | void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function NotificationSheet({ notifications, unreadCount, onMarkAllRead, onClear, onMarkAsRead, onDelete, open: controlledOpen, onOpenChange }: NotificationSheetProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
  const setOpen = onOpenChange || setUncontrolledOpen

  const handleClearAll = async () => {
    await onClear()
    toast.success("All notifications cleared")
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open notifications">
          {unreadCount > 0 && <Badge className="absolute -right-1 -top-1">{unreadCount}</Badge>}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[92vw] sm:w-[420px] p-0">
        <div className="flex items-center justify-between p-4">
          <SheetHeader>
            <SheetTitle>Notifications</SheetTitle>
          </SheetHeader>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={async () => { await onMarkAllRead(); toast.success("Marked all as read") }} aria-label="Mark all as read">
                <Check className="h-4 w-4 mr-1" /> Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClearAll} aria-label="Clear all notifications">
                <Trash2 className="h-4 w-4 mr-1" /> Clear all
              </Button>
            )}
          </div>
        </div>
        <Separator />
        <ScrollArea className="max-h-[75vh]">
          <div className="p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center text-muted-foreground py-16">
                <div className="mb-2">📭</div>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="rounded-lg border p-3 bg-card hover:bg-accent transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{n.title || "Notification"}</p>
                      <p className="text-sm text-muted-foreground break-words">{n.message || n.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{n.created_at ? new Date(n.created_at).toLocaleString() : ""}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!n.read && (
                        <Button size="sm" variant="outline" onClick={() => onMarkAsRead(n.id)} aria-label="Mark as read">Mark read</Button>
                      )}
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => onDelete(n.id)} aria-label="Delete notification">Delete</Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
} 