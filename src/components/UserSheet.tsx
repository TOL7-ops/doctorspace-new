"use client";

import { useState, useEffect } from 'react';
import { User, Settings, LogOut, Mail, Calendar, Shield, HelpCircle } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";

import { toast } from 'react-hot-toast';

interface UserData {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
}

interface UserSheetProps {
  user: UserData | null;
  onLogout: () => void;
  onProfile: () => void;
  onSettings: () => void;
  onMessages?: () => void;
  onAppointments?: () => void;
}

export function UserSheet({
  user,
  onLogout,
  onProfile,
  onSettings,
  onMessages,
  onAppointments,
}: UserSheetProps) {
  const [open, setOpen] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('👤 UserSheet rendered with:', {
      user: user ? { id: user.id, email: user.email, name: user.full_name } : null,
      open
    });
  }, [user, open]);

  const handleLogout = async () => {
    console.log('🚪 Logging out user:', user?.email);
    try {
      await onLogout();
      setOpen(false);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    }
  };

  const handleProfile = () => {
    console.log('👤 Navigating to profile');
    onProfile();
    setOpen(false);
  };

  const handleSettings = () => {
    console.log('⚙️ Navigating to settings');
    onSettings();
    setOpen(false);
  };

  const handleMessages = () => {
    console.log('📧 Navigating to messages/inbox');
    if (onMessages) {
      onMessages();
      setOpen(false);
    }
  };

  const handleAppointments = () => {
    console.log('📅 Navigating to appointments');
    if (onAppointments) {
      onAppointments();
      setOpen(false);
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  console.log('🎯 Rendering UserSheet component');

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="User profile"
          onClick={() => console.log('👤 User icon clicked!')}
        >
          <User className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          {/* VISIBLE SIGN - NEW USER SHEET */}
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border border-white" title="NEW USER SHEET"></div>
        </Button>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-[400px] sm:w-[400px] p-0">
        <SheetHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <SheetTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            User Profile
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* User Info Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.avatar_url} alt={user?.full_name || user?.email} />
                <AvatarFallback className="text-lg font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  {getInitials(user?.full_name, user?.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {user?.full_name || 'User'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
                <div className="flex items-center mt-2 space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Member since {formatDate(user?.created_at)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="flex-1 p-6 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={handleProfile}
            >
              <User className="mr-3 h-4 w-4" />
              Profile Settings
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={handleSettings}
            >
              <Settings className="mr-3 h-4 w-4" />
              App Settings
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={handleMessages}
            >
              <Mail className="mr-3 h-4 w-4" />
              Messages
              <span className="ml-auto text-xs text-gray-500">Inbox</span>
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={handleAppointments}
            >
              <Calendar className="mr-3 h-4 w-4" />
              Appointments
              <span className="ml-auto text-xs text-gray-500">Manage</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <HelpCircle className="mr-3 h-4 w-4" />
              Help & Support
            </Button>
          </div>

          {/* Bottom Section */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Theme
              </span>
              <ThemeToggle />
            </div>

            <Separator />

            {/* Logout Button */}
            <Button
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
} 