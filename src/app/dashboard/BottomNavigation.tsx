"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, Inbox, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

const navigation = [
  { 
    name: 'Home', 
    href: '/dashboard', 
    icon: Home,
    ariaLabel: 'Go to dashboard home'
  },
  { 
    name: 'Appointments', 
    href: '/dashboard/appointments', 
    icon: Calendar,
    ariaLabel: 'View appointments'
  },
  { 
    name: 'Inbox', 
    href: '/dashboard/inbox', 
    icon: Inbox,
    ariaLabel: 'View messages'
  },
  { 
    name: 'Settings', 
    href: '/dashboard/settings', 
    icon: Settings,
    ariaLabel: 'Open settings'
  },
]

export function BottomNavigation() {
  const pathname = usePathname()
  const { profile } = useAuth()

  const items = [...navigation]
  if (profile?.role === 'doctor') {
    // ensure doctor-specific view appears instead of patient appointments
    const idx = items.findIndex(i => i.name === 'Appointments')
    if (idx !== -1) items.splice(idx, 1)
    items.splice(1, 0, { name: 'Requests', href: '/dashboard/doctor-appointments', icon: Calendar, ariaLabel: 'View appointment requests' })
  }

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex justify-around">
        {items.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center py-3 px-4 transition-colors duration-200",
                "hover:bg-accent hover:text-accent-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground"
              )}
              aria-label={item.ariaLabel}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
} 