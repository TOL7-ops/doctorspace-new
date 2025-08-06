"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { NotificationsSheet } from "@/components/NotificationsSheet";
import { SimpleTest } from "@/components/SimpleTest";
import { BottomNavigation } from "@/app/dashboard/BottomNavigation";
import { UserIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

interface Notification {
  id: string;
  title: string;
  message: string;
  user_id?: string;
  read: boolean;
  created_at: string;
  date: string;
}

interface LocalUser {
  id: string;
  email: string;
  full_name?: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<LocalUser | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Debug logging
  console.log('🏗️ DashboardLayout rendering with:', {
    user: !!user,
    notificationsCount: notifications.length,
    loading,
    pathname
  });

  // Additional debug logging
  useEffect(() => {
    console.log('🔍 DashboardLayout mounted/updated:', {
      user: !!user,
      notificationsCount: notifications.length,
      loading,
      pathname
    });
  }, [user, notifications.length, loading, pathname]);

  // Fetch user data and notifications
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: { user: supaUser }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!supaUser) {
          router.replace("/login");
          return;
        }

        // Get user profile
        const { data: profile } = await supabase
          .from("patients")
          .select("full_name")
          .eq("id", supaUser.id)
          .single();

        setUser({
          id: supaUser.id,
          email: supaUser.email ?? "",
          full_name: profile?.full_name ?? "",
        });

        // Fetch notifications from the correct table
        const { data: notificationsData, error: notificationsError } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", supaUser.id)
          .order("created_at", { ascending: false })
          .limit(20);

        if (notificationsError) {
          console.error('Error fetching notifications:', notificationsError);
          toast.error('Failed to load notifications');
        } else {
          setNotifications(
            (notificationsData || []).map((n) => ({
              ...n,
              title: n.title || 'Notification',
              message: n.message || n.title || 'Notification',
              read: n.read || false,
              date: new Date(n.created_at).toLocaleDateString(),
            }))
          );
        }
      } catch (err) {
        console.error('Error in fetchData:', err);
        setUser(null);
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  // Real-time notification subscription
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel("realtime:notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => {
            if (prev.some((n) => n.id === newNotification.id)) return prev;
            
            // Play notification sound if available
            if (audioRef.current) {
              audioRef.current.play().catch(console.error);
            }
            
            // Show toast notification
            toast.success(`🔔 ${newNotification.title || newNotification.message}`);
            
            return [
              {
                ...newNotification,
                title: newNotification.title || 'Notification',
                message: newNotification.message || newNotification.title || 'Notification',
                read: newNotification.read || false,
                date: new Date(newNotification.created_at).toLocaleDateString(),
              },
              ...prev,
            ];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updatedNotification = payload.new as Notification;
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === updatedNotification.id
                ? {
                    ...n,
                    ...updatedNotification,
                    title: updatedNotification.title || 'Notification',
                    message: updatedNotification.message || updatedNotification.title || 'Notification',
                    read: updatedNotification.read || false,
                  }
                : n
            )
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const deletedNotification = payload.old as Notification;
          setNotifications((prev) =>
            prev.filter((n) => n.id !== deletedNotification.id)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const unreadNotifications = notifications.filter((n) => !n.read).length;
  
  const handleMarkAllRead = async () => {
    if (unreadNotifications > 0 && user) {
      try {
        const response = await fetch('/api/notifications', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            markAllRead: true
          })
        });

        if (response.ok) {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
          toast.success('All notifications marked as read');
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to mark notifications as read');
        }
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
        toast.error('Failed to mark notifications as read');
      }
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
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
      });

      if (response.ok) {
        setNotifications((prev) => 
          prev.map((n) => 
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        toast.success('Notification deleted');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleClearAll = async () => {
    try {
      const response = await fetch('/api/notifications?clearAll=true', {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications([]);
        toast.success('All notifications cleared');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to clear notifications');
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error('Failed to clear notifications');
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Audio element for notification sounds */}
      <audio ref={audioRef} preload="auto">
        <source src="/notification.mp3" type="audio/mpeg" />
      </audio>

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-foreground">DoctorSpace</h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Simple Test */}
            <SimpleTest />
            
            {/* Inline Test Button */}
            <button 
              style={{
                padding: '8px 16px',
                backgroundColor: 'green',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              onClick={() => {
                console.log('🟢 Inline test button clicked!');
                alert('Inline test button works!');
              }}
            >
              🟢 INLINE TEST
            </button>
            
            {/* Notifications Sheet */}
            <NotificationsSheet
              notifications={notifications}
              onMarkAllRead={handleMarkAllRead}
              onClear={handleClearAll}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDeleteNotification}
            />

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-primary" />
                </div>
                <span className="hidden sm:block text-sm font-medium text-foreground">
                  {user.full_name || user.email}
                </span>
                <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-medium text-foreground">
                      {user.full_name || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Bottom Navigation for Mobile */}
      <BottomNavigation />
    </div>
  );
} 