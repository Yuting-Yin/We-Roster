// src/types/notification.ts
export type NotificationType = "Event" | "Leave" | "Swap";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string; // ISO string
  isRead: boolean;
  avatar?: string;
  initials?: string;
  // Additional context for different notification types
  metadata?: {
    eventId?: string;
    leaveId?: string;
    swapId?: string;
    assignedBy?: string;
    approvedBy?: string;
    declinedBy?: string;
    date?: string;
    shift?: string;
  };
};

export type NotificationFilter = "Direct" | "Overall";

export type NotificationListResponse = {
  notifications: Notification[];
  totalCount: number;
  unreadCount: number;
};

export type MarkAsReadRequest = {
  notificationIds: string[];
};

export type MarkAllAsReadResponse = {
  success: boolean;
  markedCount: number;
};
