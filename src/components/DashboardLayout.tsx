"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { NotificationSheet } from "@/components/notifications/NotificationSheet";
import { BottomNavigation } from "@/app/dashboard/BottomNavigation";
import { toast } from "react-hot-toast";
import { Header } from "@/components/Header";
import { UserMenuSheet } from "@/components/UserMenuSheet";
import { useAuth } from "@/context/AuthContext";

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
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [notifOpen, setNotifOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const { profile } = useAuth()

  // Debug logging
  console.log('🏗️ DashboardLayout rendering with:', {
    user: !!user,
    notificationsCount: notifications.length,
    loading,
    pathname
  });

  useEffect(() => {
    console.log('🔍 DashboardLayout mounted/updated:', {
      user: !!user,
      notificationsCount: notifications.length,
      loading,
      pathname
    });
  }, [user, notifications.length, loading, pathname]);

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

  useEffect(() => {
    if (!user || profile?.role !== 'doctor') return
    let cancelled = false

    const fetchPending = async () => {
      const { count, error } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', user.id)
        .eq('status', 'pending')
      if (!cancelled) setPendingCount(error ? 0 : (count || 0))
    }

    fetchPending()

    const channel = supabase
      .channel('doctor-pending-count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `doctor_id=eq.${user.id}` }, async () => {
        await fetchPending()
      })
      .subscribe()

    return () => { cancelled = true; supabase.removeChannel(channel) }
  }, [user, profile?.role])

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("realtime:notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => {
            if (prev.some((n) => n.id === newNotification.id)) return prev;
            if (audioRef.current) { audioRef.current.play().catch(console.error); }
            toast.success(`🔔 ${newNotification.title || newNotification.message}`);
            return [
              { ...newNotification, title: newNotification.title || 'Notification', message: newNotification.message || newNotification.title || 'Notification', read: newNotification.read || false, date: new Date(newNotification.created_at).toLocaleDateString() },
              ...prev,
            ];
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const updatedNotification = payload.new as Notification;
          setNotifications((prev) => prev.map((n) => n.id === updatedNotification.id ? { ...n, ...updatedNotification, title: updatedNotification.title || 'Notification', message: updatedNotification.message || updatedNotification.title || 'Notification', read: updatedNotification.read || false } : n));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const deletedNotification = payload.old as Notification;
          setNotifications((prev) => prev.filter((n) => n.id !== deletedNotification.id));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    if (unreadNotifications > 0 && user) {
      try {
        const response = await fetch('/api/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markAllRead: true }) });
        if (response.ok) { setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))); toast.success('All notifications marked as read'); }
        else { const errorData = await response.json(); throw new Error(errorData.error || 'Failed to mark notifications as read'); }
      } catch (error) { console.error('Error marking all notifications as read:', error); toast.error('Failed to mark notifications as read'); }
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: notificationId, read: true }) });
      if (response.ok) { setNotifications((prev) => prev.map((n) => n.id === notificationId ? { ...n, read: true } : n)); }
      else { const errorData = await response.json(); throw new Error(errorData.error || 'Failed to mark notification as read'); }
    } catch (error) { console.error('Error marking notification as read:', error); toast.error('Failed to mark notification as read'); }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, { method: 'DELETE' });
      if (response.ok) { setNotifications((prev) => prev.filter((n) => n.id !== notificationId)); toast.success('Notification deleted'); }
      else { const errorData = await response.json(); throw new Error(errorData.error || 'Failed to delete notification'); }
    } catch (error) { console.error('Error deleting notification:', error); toast.error('Failed to delete notification'); }
  };

  const handleClearAll = async () => {
    try {
      const response = await fetch('/api/notifications?clearAll=true', { method: 'DELETE' });
      if (response.ok) { setNotifications([]); toast.success('All notifications cleared'); }
      else { const errorData = await response.json(); throw new Error(errorData.error || 'Failed to clear notifications'); }
    } catch (error) { console.error('Error clearing notifications:', error); toast.error('Failed to clear notifications'); }
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

  if (!user) { return null; }

  return (
    <div className="min-h-screen bg-background">
      <audio ref={audioRef} preload="auto"><source src="/notification.mp3" type="audio/mpeg" /></audio>

      <Header
        user={user}
        unreadCount={unreadNotifications}
        onOpenNotifications={() => setNotifOpen(true)}
        onRefresh={() => location.reload()}
        onOpenUserMenu={() => setUserMenuOpen(true)}
      />

      <UserMenuSheet open={userMenuOpen} onOpenChange={setUserMenuOpen} onLogout={async () => { await supabase.auth.signOut(); router.push('/login') }} user={{ email: user.email, full_name: user.full_name }} pendingCount={pendingCount} role={profile?.role || null} />

      <NotificationSheet
        notifications={notifications}
        unreadCount={unreadNotifications}
        onMarkAllRead={handleMarkAllRead}
        onClear={handleClearAll}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDeleteNotification}
        open={notifOpen}
        onOpenChange={setNotifOpen}
      />

      <main className="flex-1">{children}</main>
      <BottomNavigation />
    </div>
  );
} 