"use client"

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database.types'
import { toast } from 'react-hot-toast'

type Notification = Database['public']['Tables']['notifications']['Row']

export interface EnhancedNotification extends Notification {
  formattedDate: string
  priority: 'low' | 'medium' | 'high'
  type: 'appointment' | 'message' | 'system' | 'reminder'
}

export function useEnhancedNotifications(userId: string) {
  const [notifications, setNotifications] = useState<EnhancedNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3')
      audio.volume = 0.5
      audio.play().catch(err => {
        console.log('Could not play notification sound:', err)
      })
    } catch (err) {
      console.log('Audio not supported:', err)
    }
  }

  // Determine notification priority and type
  const getNotificationMetadata = (notification: Notification): { priority: 'low' | 'medium' | 'high', type: 'appointment' | 'message' | 'system' | 'reminder' } => {
    const title = notification.title?.toLowerCase() || ''
    const message = notification.message?.toLowerCase() || ''
    
    // Determine priority
    let priority: 'low' | 'medium' | 'high' = 'low'
    if (title.includes('urgent') || message.includes('urgent')) {
      priority = 'high'
    } else if (title.includes('reminder') || title.includes('upcoming') || title.includes('cancelled')) {
      priority = 'medium'
    }

    // Determine type
    let type: 'appointment' | 'message' | 'system' | 'reminder' = 'system'
    if (title.includes('appointment') || message.includes('appointment')) {
      type = 'appointment'
    } else if (title.includes('message') || message.includes('message')) {
      type = 'message'
    } else if (title.includes('reminder') || title.includes('upcoming')) {
      type = 'reminder'
    }

    return { priority, type }
  }

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  // Transform notification data
  const transformNotification = useCallback((notification: Notification): EnhancedNotification => {
    const { priority, type } = getNotificationMetadata(notification)
    return {
      ...notification,
      formattedDate: formatDate(notification.created_at),
      priority,
      type
    }
  }, [])

  // Fetch notifications using the API endpoint
  const fetchNotifications = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/notifications?userId=${userId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      const enhancedNotifications = (result.data || []).map(transformNotification)
      
      setNotifications(enhancedNotifications)
      setUnreadCount(enhancedNotifications.filter(n => !n.read).length)
      
    } catch (err: unknown) {
      console.error('API fetch failed, trying direct supabase query:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      
      // Fallback to direct supabase query
      try {
        const { data, error: supabaseError } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (supabaseError) throw supabaseError

        const enhancedNotifications = (data || []).map(transformNotification)
        setNotifications(enhancedNotifications)
        setUnreadCount(enhancedNotifications.filter(n => !n.read).length)
        
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }, [userId, transformNotification])

  // Real-time subscription
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('enhanced-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Real-time notification update:', payload)
          
          if (payload.eventType === 'INSERT') {
            const newNotification = transformNotification(payload.new as Notification)
            setNotifications(prev => [newNotification, ...prev])
            setUnreadCount(prev => prev + 1)
            
            // Play notification sound
            playNotificationSound()
            
            // Show toast notification
            toast(`New notification: ${newNotification.title}`, {
              icon: '🔔',
              duration: 4000,
            })
            
          } else if (payload.eventType === 'UPDATE') {
            const updatedNotification = transformNotification(payload.new as Notification)
            setNotifications(prev => 
              prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
            )
            
            // Update unread count if read status changed
            if (updatedNotification.read && !notifications.find(n => n.id === updatedNotification.id)?.read) {
              setUnreadCount(prev => Math.max(0, prev - 1))
            }
            
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old?.id
            if (deletedId) {
              const wasUnread = notifications.find(n => n.id === deletedId)?.read === false
              setNotifications(prev => prev.filter(n => n.id !== deletedId))
              if (wasUnread) {
                setUnreadCount(prev => Math.max(0, prev - 1))
              }
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, transformNotification, notifications])

  // Initial fetch
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Mark notification as read using API
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: notificationId,
          read: true
        })
      })

      if (!response.ok) {
        throw new Error('Failed to mark notification as read')
      }

      // Optimistically update the notification
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Error marking notification as read:', err)
      toast.error('Failed to mark notification as read')
    }
  }, [])

  // Mark all notifications as read using API
  const markAllAsRead = useCallback(async () => {
    try {
      // Update all unread notifications
      const unreadNotifications = notifications.filter(n => !n.read)
      
      for (const notification of unreadNotifications) {
        await markAsRead(notification.id)
      }
      
      toast.success('All notifications marked as read')
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
      toast.error('Failed to mark all notifications as read')
    }
  }, [notifications, markAsRead])

  // Delete single notification using API
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete notification')
      }

      // Optimistically remove the notification
      const wasUnread = notifications.find(n => n.id === notificationId)?.read === false
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
      
      toast.success('Notification deleted')
    } catch (err) {
      console.error('Error deleting notification:', err)
      toast.error('Failed to delete notification')
    }
  }, [notifications])

  // Clear all notifications using API
  const clearAllNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications?clearAll=true', {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to clear all notifications')
      }

      setNotifications([])
      setUnreadCount(0)
      toast.success('All notifications cleared')
    } catch (err) {
      console.error('Error clearing all notifications:', err)
      toast.error('Failed to clear all notifications')
    }
  }, [])

  // Get notifications by type
  const getNotificationsByType = useCallback((type: 'appointment' | 'message' | 'system' | 'reminder') => {
    return notifications.filter(n => n.type === type)
  }, [notifications])

  // Get notifications by priority
  const getNotificationsByPriority = useCallback((priority: 'low' | 'medium' | 'high') => {
    return notifications.filter(n => n.priority === priority)
  }, [notifications])

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getNotificationsByType,
    getNotificationsByPriority,
    refetch: fetchNotifications
  }
} 