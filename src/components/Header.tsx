"use client"

import React from "react"
import { motion } from "framer-motion"
import { Bell, RefreshCw, Sun, Moon } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"

interface HeaderProps {
  user: { id: string; email: string; full_name?: string }
  unreadCount: number
  onOpenNotifications: () => void
  onRefresh?: () => void
  onOpenUserMenu?: () => void
}

export function Header({ user, unreadCount, onOpenNotifications, onRefresh, onOpenUserMenu }: HeaderProps) {
  const initials = (user.full_name || user.email || "").split(" ").map(s => s[0]).join("").slice(0,2).toUpperCase()
  const userName = user.full_name && user.full_name.trim().length > 0 ? user.full_name.split(" ")[0] : (user.email?.split("@")[0] || "there")
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="truncate">
            <p className="text-sm text-muted-foreground truncate">Welcome back,</p>
            <h1 className="text-base font-semibold text-foreground truncate">{userName} 👋</h1>
          </motion.div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {onRefresh && (
            <Button variant="ghost" size="icon" aria-label="Refresh" onClick={onRefresh}>
              <RefreshCw className="h-5 w-5" />
            </Button>
          )}

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            title={isDark ? 'Light Mode' : 'Dark Mode'}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <div className="relative">
            <Button variant="ghost" size="icon" aria-label="Open notifications" onClick={onOpenNotifications} className="relative">
              {unreadCount > 0 && (
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary/20 animate-ping" />
              )}
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 min-w-[1.25rem] px-1 text-[10px] flex items-center justify-center" variant="default">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Open user side sheet instead of dropdown */}
          <Button variant="ghost" size="icon" aria-label="Open user menu" className="rounded-full" onClick={onOpenUserMenu}>
            <Avatar className="h-8 w-8">
              <AvatarFallback>{initials || "U"}</AvatarFallback>
            </Avatar>
          </Button>
        </div>
      </div>
    </header>
  )
} 