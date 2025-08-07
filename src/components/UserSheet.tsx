"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { supabase } from '@/lib/supabase'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  User,
  Settings,
  LogOut,
  Calendar,
  MessageSquare,
  HelpCircle,
  Moon,
  Sun,
  UserIcon,
  ChevronDownIcon
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface UserSheetProps {
  user: {
    id: string
    email: string
    full_name?: string
  }
}

export function UserSheet({ user }: UserSheetProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success('Signed out successfully')
      setOpen(false)
      router.replace('/login')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Failed to sign out')
    }
  }

  const handleNavigation = (path: string) => {
    setOpen(false)
    router.push(path)
  }

  const toggleDarkMode = (enabled: boolean) => {
    setTheme(enabled ? 'dark' : 'light')
    toast.success(`${enabled ? 'Dark' : 'Light'} mode enabled`)
  }

  const menuItems = [
    {
      icon: User,
      label: 'Profile Settings',
      action: () => handleNavigation('/dashboard/profile'),
      description: 'Manage your personal information'
    },
    {
      icon: Settings,
      label: 'App Settings',
      action: () => handleNavigation('/dashboard/settings'),
      description: 'Configure your preferences'
    },
    {
      icon: Calendar,
      label: 'Appointments',
      action: () => handleNavigation('/dashboard/appointments'),
      description: 'View and manage appointments'
    },
    {
      icon: MessageSquare,
      label: 'Messages',
      action: () => handleNavigation('/dashboard/inbox'),
      description: 'Your inbox and conversations'
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      action: () => handleNavigation('/help'),
      description: 'Get help and contact support'
    }
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center space-x-2 h-auto p-2 rounded-lg hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Open user menu"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt={user.full_name || user.email} />
            <AvatarFallback className="bg-primary/10">
              <UserIcon className="h-4 w-4 text-primary" />
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:block text-sm font-medium text-foreground max-w-[120px] truncate">
            {user.full_name || user.email}
          </span>
          <ChevronDownIcon className="h-4 w-4 text-muted-foreground hidden sm:block" />
        </Button>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-[350px] sm:w-[400px]">
        <SheetHeader className="text-left">
          <div className="flex items-center space-x-3 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" alt={user.full_name || user.email} />
              <AvatarFallback className="bg-primary/10 text-lg">
                <UserIcon className="h-8 w-8 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg font-semibold truncate">
                {user.full_name || 'User'}
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground truncate">
                {user.email}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-6">
          {/* Theme Toggle */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Appearance</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {theme === 'dark' ? (
                  <Moon className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Sun className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">Dark Mode</span>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={toggleDarkMode}
                aria-label="Toggle dark mode"
                className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-200"
              />
            </div>
          </div>

          <Separator />

          {/* Menu Items */}
          <div className="space-y-1">
            {menuItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start h-auto p-3 text-left"
                onClick={item.action}
              >
                <item.icon className="mr-3 h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">
                    {item.label}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {item.description}
                  </div>
                </div>
              </Button>
            ))}
          </div>

          <Separator />

          {/* Sign Out */}
          <Button
            variant="ghost"
            className="w-full justify-start h-auto p-3 text-left text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={handleSignOut}
          >
            <LogOut className="mr-3 h-4 w-4" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">Sign Out</div>
              <div className="text-xs text-muted-foreground">
                End your current session
              </div>
            </div>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default UserSheet 