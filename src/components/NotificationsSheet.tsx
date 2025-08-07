"use client";
import { useState, useEffect } from 'react';
import { Bell, Trash2, AlertTriangle, Info } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from 'react-hot-toast';

type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  date: string;
  created_at?: string;
};

interface NotificationsSheetProps {
  notifications: Notification[];
  onMarkAllRead: () => void;
  onClear: () => void;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function NotificationsSheet({
  notifications,
  onMarkAllRead,
  onClear,
  onDelete,
}: NotificationsSheetProps) {
  const [open, setOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      if (onDelete) {
        await onDelete(id);
        toast.success('Notification removed');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to remove notification');
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    try {
      if (onClear) {
        await onClear();
        setOpen(false);
        toast.success('All notifications cleared');
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error('Failed to clear notifications');
    }
  };

  const getNotificationIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('urgent') || lowerTitle.includes('cancelled')) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    if (lowerTitle.includes('reminder') || lowerTitle.includes('upcoming')) {
      return <Info className="h-4 w-4 text-blue-500" />;
    }
    return <Info className="h-4 w-4 text-gray-500" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center space-x-2 h-auto p-2 rounded-lg hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring relative"
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        >
          <div className="relative">
            <Bell className="h-6 w-6 text-muted-foreground" />
            {unreadCount > 0 && (
              <span 
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-600 text-white text-xs font-medium rounded-full flex items-center justify-center border-2 border-background"
                aria-label={`${unreadCount} unread notifications`}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          <span className="hidden sm:block text-sm font-medium text-foreground">
            Notifications
          </span>
        </Button>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-[400px] sm:w-[400px] p-0">
        <SheetHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({unreadCount} unread)
                </span>
              )}
            </SheetTitle>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMarkAllRead}
                  className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Clear all
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="p-4">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Bell className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  You&apos;re all caught up 🎉
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No new notifications at the moment
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    data-testid="notification-item"
                    className={cn(
                      "group relative p-4 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-sm",
                      !notification.read 
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700" 
                        : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.title)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={cn(
                              "text-sm font-medium mb-1",
                              !notification.read 
                                ? "text-gray-900 dark:text-white" 
                                : "text-gray-700 dark:text-gray-300"
                            )}>
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {notification.message}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 ml-2">
                            <span className="text-xs text-gray-400 whitespace-nowrap">
                              {formatDate(notification.created_at || notification.date)}
                            </span>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Delete button - appears on hover */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(notification.id)}
                      disabled={deletingId === notification.id}
                      className={cn(
                        "absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                        "h-6 w-6 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      )}
                      aria-label="Delete notification"
                    >
                      {deletingId === notification.id ? (
                        <div className="h-3 w-3 animate-spin rounded-full border border-gray-400 border-t-transparent" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
} 