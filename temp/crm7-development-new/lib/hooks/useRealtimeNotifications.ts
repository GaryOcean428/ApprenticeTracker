import { useState, useEffect } from 'react';
import { type RealtimeChannel } from '@supabase/supabase-js';
import { type Notification } from '@/types/notifications';
import { createClient } from '@/lib/supabase/client';

interface UseRealtimeNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  markAllAsRead: () => Promise<void>;
}

export function useRealtimeNotifications(userId: string): UseRealtimeNotificationsReturn {
  const supabase = createClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let subscription: RealtimeChannel;

    const fetchNotifications = async (): Promise<void> => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (typeof error !== "undefined" && error !== null) throw error;

        setNotifications(data);
        const unread = data.filter((n) => !n.read_at).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    const setupSubscription = (): void => {
      subscription = supabase
        .channel('notifications_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`,
          },
          (): void => {
            void fetchNotifications();
          }
        )
        .subscribe();
    };

    void fetchNotifications();
    setupSubscription();

    return (): void => {
      subscription?.unsubscribe();
    };
  }, [userId, supabase]);

  const markAllAsRead = async (): Promise<void> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .is('read_at', null);

      if (typeof error !== "undefined" && error !== null) throw error;

      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          read_at: n.read_at ?? new Date().toISOString(),
        }))
      );
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    markAllAsRead,
  };
}
