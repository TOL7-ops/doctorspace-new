"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database.types'

type Notification = Database['public']['Tables']['notifications']['Row']

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial notifications
  useEffect(() => {
    if (!userId) return

    const fetchNotifications = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50)

        if (error) throw error
        setNotifications(data || [])
      } catch (err) {
        console.error('Error fetching notifications:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch notifications')
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [userId])

  // Real-time subscription
  useEffect(() => {
    if (!userId) return

    console.log('🔌 useNotifications: Setting up real-time subscription for user:', userId);

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('🔄 useNotifications: Real-time event received:', payload.eventType, payload);
          if (payload.eventType === 'INSERT') {
            console.log('➕ useNotifications: Adding new notification:', payload.new.id);
            setNotifications(prev => [payload.new as Notification, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            console.log('✏️ useNotifications: Updating notification:', payload.new.id);
            setNotifications(prev => 
              prev.map(notification => 
                notification.id === payload.new.id 
                  ? payload.new as Notification 
                  : notification
              )
            )
          } else if (payload.eventType === 'DELETE') {
            console.log('🗑️ useNotifications: DELETE event received, removing notification:', payload.old.id);
            setNotifications(prev => 
              prev.filter(notification => notification.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe((status) => {
        console.log('🔌 useNotifications: Real-time subscription status:', status);
      })

    return () => {
      console.log('🔌 useNotifications: Cleaning up real-time subscription');
      supabase.removeChannel(channel)
    }
  }, [userId])

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) throw error
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false)

      if (error) throw error
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
    }
  }

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    console.log('🗑️ useNotifications: Deleting notification:', notificationId);
    
    // Optimistic update - remove from UI immediately
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
    
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) {
        // If deletion failed, revert the optimistic update
        console.error('❌ useNotifications: Error deleting notification:', error);
        // Refetch to restore the correct state
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);
        setNotifications(data || []);
        throw error;
      }
      console.log('✅ useNotifications: Notification deleted successfully');
    } catch (err) {
      console.error('❌ useNotifications: Error deleting notification:', err)
      throw err; // Re-throw to let the component handle the error
    }
  }

  // Clear all notifications
  const clearAllNotifications = async () => {
    console.log('🧹 useNotifications: Clearing all notifications for user:', userId);
    
    // Optimistic update - clear UI immediately
    setNotifications([]);
    
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId)

      if (error) {
        // If deletion failed, revert the optimistic update
        console.error('❌ useNotifications: Error clearing all notifications:', error);
        // Refetch to restore the correct state
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);
        setNotifications(data || []);
        throw error;
      }
      console.log('✅ useNotifications: All notifications cleared successfully');
    } catch (err) {
      console.error('❌ useNotifications: Error clearing all notifications:', err)
      throw err; // Re-throw to let the component handle the error
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
  }
} 