import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getUnreadCount, markNotificationAsRead, markAllNotificationsAsRead } from "@/api/notification";

interface NotificationContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  isLoading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: React.ReactNode;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function NotificationProvider({ 
  children, 
  autoRefresh = true, 
  refreshInterval = 30000 
}: NotificationProviderProps) {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshUnreadCount = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getUnreadCount();
      setUnreadCount(response.count);
    } catch (err: any) {
      console.warn("🔔 NotificationContext: Failed to load unread count:", err?.message);
      // Don't update count on error to avoid showing incorrect state
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      // Optimistically update the count immediately for instant feedback
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      await markNotificationAsRead(notificationId);
      
      // Refresh to ensure accuracy after API call completes
      refreshUnreadCount();
    } catch (err: any) {
      console.error("🔔 NotificationContext: Failed to mark notification as read:", err?.message);
      // Refresh to get accurate count on error
      refreshUnreadCount();
    }
  }, [refreshUnreadCount]);

  const markAllAsRead = useCallback(async () => {
    try {
      // Optimistically update the count immediately for instant feedback
      setUnreadCount(0);
      
      await markAllNotificationsAsRead();
      
      // Refresh to ensure accuracy after API call completes
      refreshUnreadCount();
    } catch (err: any) {
      console.error("🔔 NotificationContext: Failed to mark all notifications as read:", err?.message);
      // Refresh to get accurate count on error
      refreshUnreadCount();
    }
  }, [refreshUnreadCount]);

  // Initial load
  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  // Auto refresh
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refreshUnreadCount();
      }, refreshInterval);
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [autoRefresh, refreshInterval, refreshUnreadCount]);

  const value: NotificationContextType = {
    unreadCount,
    refreshUnreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotificationContext must be used within a NotificationProvider");
  }
  return context;
}
