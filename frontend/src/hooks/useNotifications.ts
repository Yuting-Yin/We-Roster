// src/hooks/useNotifications.ts
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, getUnreadCount } from "@/api/notification";
import type { Notification, NotificationFilter } from "@/types/notification";

type Options = {
  mock?: boolean;
  delayMs?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
};

export function useNotifications(opts: Options = {}) {
  const envMock = process.env.EXPO_PUBLIC_MOCK_NOTIFICATIONS === "1";
  const useMock = opts.mock ?? envMock;
  const delayMs = opts.delayMs ?? 300;
  const autoRefresh = opts.autoRefresh ?? false;
  const refreshInterval = opts.refreshInterval ?? 60000; // 60 seconds

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<NotificationFilter>("Direct");
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);

  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async (currentFilter: NotificationFilter = filter) => {
    if (useMock) {
      setLoading(true);
      setError(null);
      if (timerRef.current) clearTimeout(timerRef.current);
      
      timerRef.current = setTimeout(async () => {
        try {
          const response = await getNotifications(currentFilter);
          setNotifications(response.notifications);
          setUnreadCount(response.unreadCount);
          setTotalCount(response.totalCount);
        } catch (err: any) {
          setError(err?.message ?? "Failed to load notifications");
        } finally {
          setLoading(false);
        }
      }, delayMs);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const response = await getNotifications(currentFilter);
      if (!controller.signal.aborted) {
        setNotifications(response.notifications);
        setUnreadCount(response.unreadCount);
        setTotalCount(response.totalCount);
      }
    } catch (err: any) {
      if (!controller.signal.aborted) {
        setError(err?.message ?? "Failed to load notifications");
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [useMock, delayMs, filter]);

  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await getUnreadCount();
      setUnreadCount(response.count);
    } catch (err: any) {
      console.warn("Failed to load unread count:", err?.message);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error("Failed to mark notification as read:", err?.message);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await markAllNotificationsAsRead();
      
      if (response.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, isRead: true }))
        );
        
        // Update unread count
        setUnreadCount(0);
      }
    } catch (err: any) {
      console.error("Failed to mark all notifications as read:", err?.message);
    }
  }, []);

  const changeFilter = useCallback((newFilter: NotificationFilter) => {
    setFilter(newFilter);
    load(newFilter);
  }, [load]);

  const refresh = useCallback(async () => {
    await load();
    await loadUnreadCount();
  }, [load, loadUnreadCount]);

  // Initial load
  useEffect(() => {
    load();
    loadUnreadCount();
    
    return () => {
      abortRef.current?.abort();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [load, loadUnreadCount]);

  // Auto refresh
  useEffect(() => {
    if (autoRefresh) {
      refreshTimerRef.current = setInterval(() => {
        // Only refresh unread count, not the full notification list
        loadUnreadCount();
      }, refreshInterval);
      
      return () => {
        if (refreshTimerRef.current) {
          clearInterval(refreshTimerRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, loadUnreadCount]);

  // Derived state
  const unreadNotifications = useMemo(() => 
    notifications.filter(n => !n.isRead), 
    [notifications]
  );

  const hasUnread = useMemo(() => unreadCount > 0, [unreadCount]);

  return useMemo(
    () => ({
      notifications,
      unreadNotifications,
      loading,
      error,
      filter,
      unreadCount,
      totalCount,
      hasUnread,
      markAsRead,
      markAllAsRead,
      changeFilter,
      refresh,
    }),
    [
      notifications,
      unreadNotifications,
      loading,
      error,
      filter,
      unreadCount,
      totalCount,
      hasUnread,
      markAsRead,
      markAllAsRead,
      changeFilter,
      refresh,
    ]
  );
}
