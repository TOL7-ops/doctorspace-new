"use client"

import React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface UserMenuSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLogout: () => void
  user: { email: string; full_name?: string }
  pendingCount?: number
  role?: string | null
}

export function UserMenuSheet({ open, onOpenChange, onLogout, user, pendingCount = 0, role }: UserMenuSheetProps) {
  const initials = (user.full_name || user.email || "").split(" ").map(s => s[0]).join("").slice(0,2).toUpperCase()
  const displayName = user.full_name && user.full_name.trim().length > 0 ? user.full_name : user.email?.split("@")[0]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[92vw] sm:w-[380px]">
        <SheetHeader>
          <SheetTitle>User Menu</SheetTitle>
        </SheetHeader>

        {/* User identity block */}
        <div className="mt-4 mb-3 flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{initials || "U"}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        <Separator className="mb-4" />

        <nav className="grid gap-2">
          {role === 'doctor' && (
            <Link href="/dashboard/doctor-appointments" className="px-3 py-2 rounded hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring flex items-center justify-between" aria-label="Appointment Requests">
              <span>Appointment Requests</span>
              {pendingCount > 0 && <Badge variant="default">{pendingCount > 99 ? '99+' : pendingCount}</Badge>}
            </Link>
          )}
          <Link href="/inbox" className="px-3 py-2 rounded hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring" aria-label="Messages">Messages</Link>
          <Link href="/dashboard/settings" className="px-3 py-2 rounded hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring" aria-label="App Settings">App Settings</Link>
          <Link href="/dashboard/profile" className="px-3 py-2 rounded hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring" aria-label="Profile Settings">Profile Settings</Link>
          <Link href="/help" className="px-3 py-2 rounded hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring" aria-label="Help & Support">Help & Support</Link>
          <Separator className="my-2" />
          <Button variant="destructive" onClick={onLogout} aria-label="Logout">Logout</Button>
        </nav>
      </SheetContent>
    </Sheet>
  )
} 