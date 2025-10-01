// src/api/notification.ts
import { fetchJson } from "@/lib/api";
import type { 
  Notification, 
  NotificationListResponse, 
  MarkAsReadRequest, 
  MarkAllAsReadResponse 
} from "@/types/notification";

const USE_MOCK = false; // Now connected to backend

// Mock data for development
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "Event",
    title: "Event Assignment",
    message: "Event Urology on Tue, 20 May 2025 - PM has been assigned to you by Floor Coordinators NURSE",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
    isRead: false,
    initials: "TV",
    metadata: {
      eventId: "event_1",
      assignedBy: "Floor Coordinators NURSE",
      date: "2025-05-20",
      shift: "PM"
    }
  },
  {
    id: "2",
    type: "Leave",
    title: "Leave Approved",
    message: "Your leave on Fri, 16 May 2025 - PM has been approved by RM",
    timestamp: new Date("2025-05-13T17:00:00Z").toISOString(),
    isRead: false,
    initials: "RM",
    metadata: {
      leaveId: "leave_1",
      approvedBy: "RM",
      date: "2025-05-16",
      shift: "PM"
    }
  },
  {
    id: "3",
    type: "Swap",
    title: "Swap Request Declined",
    message: "Your swap request on Wed, 14 May 2025 - PM has been declined by MJ",
    timestamp: new Date("2025-05-10T08:00:00Z").toISOString(),
    isRead: true,
    initials: "MJ",
    metadata: {
      swapId: "swap_1",
      declinedBy: "MJ",
      date: "2025-05-14",
      shift: "PM"
    }
  },
  {
    id: "4",
    type: "Leave",
    title: "Leave Approved",
    message: "Your leave on Fri, 16 May 2025 - PM has been approved by RM",
    timestamp: new Date("2025-05-13T17:00:00Z").toISOString(),
    isRead: true,
    initials: "RM",
    metadata: {
      leaveId: "leave_2",
      approvedBy: "RM",
      date: "2025-05-16",
      shift: "PM"
    }
  },
  {
    id: "5",
    type: "Swap",
    title: "Swap Request Declined",
    message: "Your swap request on Wed, 14 May 2025 - PM has been declined by MJ",
    timestamp: new Date("2025-05-10T08:00:00Z").toISOString(),
    isRead: true,
    initials: "MJ",
    metadata: {
      swapId: "swap_2",
      declinedBy: "MJ",
      date: "2025-05-14",
      shift: "PM"
    }
  },
  {
    id: "6",
    type: "Leave",
    title: "Leave Approved",
    message: "Your leave on Fri, 16 May 2025 - PM has been approved by RM",
    timestamp: new Date("2025-05-13T17:00:00Z").toISOString(),
    isRead: true,
    initials: "RM",
    metadata: {
      leaveId: "leave_3",
      approvedBy: "RM",
      date: "2025-05-16",
      shift: "PM"
    }
  },
  {
    id: "7",
    type: "Swap",
    title: "Swap Request Declined",
    message: "Your swap request on Wed, 14 May 2025 - PM has been declined by M.J",
    timestamp: new Date("2025-05-10T08:00:00Z").toISOString(),
    isRead: true,
    initials: "MJ",
    metadata: {
      swapId: "swap_3",
      declinedBy: "M.J",
      date: "2025-05-14",
      shift: "PM"
    }
  }
];

export async function getNotifications(
  filter?: "Direct" | "Overall",
  limit?: number,
  offset?: number
): Promise<NotificationListResponse> {
  if (USE_MOCK) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filteredNotifications = [...mockNotifications];
    
    // Apply filter logic (for now, both filters return the same data)
    if (filter === "Direct") {
      // In a real app, this would filter for direct notifications
      filteredNotifications = mockNotifications;
    } else if (filter === "Overall") {
      // In a real app, this would include team/overall notifications
      filteredNotifications = mockNotifications;
    }
    
    // Apply pagination
    const startIndex = offset || 0;
    const endIndex = limit ? startIndex + limit : filteredNotifications.length;
    const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);
    
    const unreadCount = mockNotifications.filter(n => !n.isRead).length;
    
    return {
      notifications: paginatedNotifications,
      totalCount: filteredNotifications.length,
      unreadCount
    };
  }

  const params = new URLSearchParams();
  if (filter) params.append('filter', filter);
  if (limit) params.append('limit', limit.toString());
  if (offset) params.append('offset', offset.toString());

  const queryString = params.toString();
  const url = `/api/v1/notifications${queryString ? `?${queryString}` : ''}`;
  
  return fetchJson<NotificationListResponse>(url);
}

export async function markNotificationAsRead(notificationId: string): Promise<{ success: boolean }> {
  if (USE_MOCK) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Find and mark as read in mock data
    const notification = mockNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
    
    return { success: true };
  }

  return fetchJson<{ success: boolean }>(`/api/v1/notifications/${notificationId}/read`, {
    method: 'PATCH'
  });
}

export async function markAllNotificationsAsRead(): Promise<MarkAllAsReadResponse> {
  if (USE_MOCK) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const unreadNotifications = mockNotifications.filter(n => !n.isRead);
    unreadNotifications.forEach(n => n.isRead = true);
    
    return {
      success: true,
      markedCount: unreadNotifications.length
    };
  }

  return fetchJson<MarkAllAsReadResponse>('/api/v1/notifications/mark-all-read', {
    method: 'PATCH'
  });
}

export async function getUnreadCount(): Promise<{ count: number }> {
  if (USE_MOCK) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const unreadCount = mockNotifications.filter(n => !n.isRead).length;
    return { count: unreadCount };
  }

  return fetchJson<{ count: number }>('/api/v1/notifications/unread-count');
}
