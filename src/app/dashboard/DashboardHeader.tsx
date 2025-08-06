"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Search, Bell, User, X, Settings, LogOut, Mail, Calendar, Check, Trash2, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { useNotifications } from '@/lib/hooks/useNotifications'
import { NotificationsSheet } from '@/components/NotificationsSheet'
import { UserSheet } from '@/components/UserSheet'
import { Database } from '@/types/database.types'

// type Notification = Database['public']['Tables']['notifications']['Row']

export function DashboardHeader() {
  const router = useRouter()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  
  const searchRef = useRef<HTMLInputElement>(null)

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
    getCurrentUser()
  }, [])

  // Use real notifications hook
  const {
    notifications,
    loading: notificationsLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
  } = useNotifications(currentUser?.id || '')

  // Ensure component is mounted before rendering interactive elements
  useEffect(() => {
    setMounted(true)
  }, [])

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus()
    }
  }, [searchOpen])

  const handleSearch = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSearchOpen(!searchOpen)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Searching for:', searchQuery)
    // Implement search functionality here
    setSearchOpen(false)
  }

  const handleLogout = async () => {
    try {
      console.log('Logging out...')
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
      toast.error('Failed to log out')
    }
  }

  const handleProfile = () => {
    console.log('Navigating to profile...')
    router.push('/dashboard/profile')
  }

  const handleSettings = () => {
    console.log('Navigating to settings...')
    router.push('/dashboard/settings')
  }

  const handleMessages = () => {
    console.log('Navigating to messages/inbox...')
    router.push('/dashboard/inbox')
  }

  const handleAppointments = () => {
    console.log('Navigating to appointments...')
    router.push('/dashboard/appointments')
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getNotificationIcon = (title: string) => {
    const lowerTitle = title.toLowerCase()
    if (lowerTitle.includes('urgent') || lowerTitle.includes('cancelled')) {
      return '🔴'
    }
    if (lowerTitle.includes('reminder') || lowerTitle.includes('upcoming')) {
      return '🔵'
    }
    return '⚪'
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-foreground">DoctorSpace</h1>
          
          {/* Search */}
          <div className="relative">
            {searchOpen && (
              <div className="absolute left-0 top-0 w-80 z-50">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Input
                    ref={searchRef}
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-10"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    className="absolute right-0 top-0 h-full px-3"
                    aria-label="Search"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search Button */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Search"
            className={cn(
              "hidden sm:flex hover:bg-accent hover:text-accent-foreground",
              searchOpen && "bg-accent text-accent-foreground"
            )}
            onClick={handleSearch}
            type="button"
          >
            {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </Button>

          {/* NEW NOTIFICATIONS SHEET - WITH VISIBLE SIGN */}
          <div className="relative">
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white z-10" title="NEW SHEET COMPONENT"></div>
            <NotificationsSheet
              notifications={notifications.map(n => ({
                id: n.id,
                title: n.title,
                message: n.message,
                read: n.read,
                date: formatTime(n.created_at),
                created_at: n.created_at
              }))}
              onMarkAllRead={markAllAsRead}
              onClear={clearAllNotifications}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
            />
          </div>

          {/* NEW USER SHEET - WITH VISIBLE SIGN */}
          <div className="relative">
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white z-10" title="NEW USER SHEET"></div>
            <UserSheet
              user={currentUser}
              onLogout={handleLogout}
              onProfile={handleProfile}
              onSettings={handleSettings}
              onMessages={handleMessages}
              onAppointments={handleAppointments}
            />
          </div>
        </div>
      </div>
    </header>
  )
} 