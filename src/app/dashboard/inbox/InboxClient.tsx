'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Inbox, User, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ServiceButtons } from './ServiceButtons'
import { InboxHeader } from './InboxHeader'
import { supabase } from '@/lib/supabase'

interface Message {
  id: string
  sender_id: string
  recipient_id: string
  sender_name: string
  content: string
  subject?: string
  read: boolean
  created_at: string
}

export function InboxClient() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !currentUser) {
          router.push('/login')
          return
        }

        setUser(currentUser)

        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('recipient_id', currentUser.id)
          .order('created_at', { ascending: false })

        if (messagesError) {
          console.error('Error fetching messages:', messagesError)
        } else {
          setMessages(messagesData || [])
        }
      } catch (error) {
        console.error('Error in fetchData:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleMarkAllAsRead = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('recipient_id', user.id)
        .eq('read', false)

      if (error) {
        console.error('Error marking messages as read:', error)
      } else {
        // Update local state
        setMessages(prev => prev.map(msg => ({ ...msg, read: true })))
      }
    } catch (error) {
      console.error('Error in handleMarkAllAsRead:', error)
    }
  }

  if (loading) {
    return <InboxSkeleton />
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <InboxHeader 
        hasUnreadMessages={messages.some(m => !m.read)}
        onMarkAllAsRead={handleMarkAllAsRead}
      />

      {/* Under Construction Banner */}
      {messages.length === 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className="text-2xl">📥</span>
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              Inbox is under construction
            </h3>
          </div>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            We&apos;re working hard to bring you a full-featured messaging experience.
            Check back soon for updates!
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="space-y-4">
        {messages.length > 0 ? (
          messages.map((message) => (
            <Card 
              key={message.id} 
              className={cn(
                "transition-all duration-200 hover:shadow-md cursor-pointer",
                !message.read && "border-primary/20 bg-primary/5"
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-foreground">
                          {message.sender_name || 'Unknown'}
                        </h3>
                        {!message.read && (
                          <Badge variant="default" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {message.subject || 'No subject'}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {message.content}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {new Date(message.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {!message.read && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-medium text-foreground">
                  No messages
                </h3>
                <p className="text-muted-foreground">
                  You don&apos;t have any messages yet.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <span>Healthcare Services</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceButtons />
        </CardContent>
      </Card>
    </div>
  )
}

function InboxSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-3 w-full" />
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 