import { useState, useEffect, useCallback } from 'react';
import { getMyLeaves, LeaveRequest } from '@/api/leave';
import { LeaveItem } from '@/types/dashboard';
import { fmt } from '@/lib/date';
import { useAuth } from '@/contexts/AuthContext';

interface Options {
  mock?: boolean;
  delayMs?: number;
}

export function useMyLeaves(month?: string, opts: Options = {}) {
  const { mock = false, delayMs = 0 } = opts;
  const { isAuthenticated, token } = useAuth();
  
  const [leaves, setLeaves] = useState<LeaveItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    console.log('🔍 useMyLeaves - Load called, isAuthenticated:', isAuthenticated, 'token:', token ? 'present' : 'missing');
    
    if (mock) {
      // Mock data for testing
      setTimeout(() => {
        const today = new Date();
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
        
        const mockLeaves: LeaveItem[] = [
          {
            id: 1,
            date: fmt(today, { day: "2-digit", month: "short" }), // Same day leave
            type: "Day Leave",
            category: "08:00 - 16:00",
            state: "Awaiting", // Use mapped status value
            requestDate: new Date().toISOString(),
            startTime: "2025-09-25T08:00:00",
            endTime: "2025-09-25T16:00:00",
            reason: "Personal appointment"
          },
          {
            id: 2,
            date: `${fmt(twoDaysAgo, { day: "2-digit", month: "short" })} - ${fmt(yesterday, { day: "2-digit", month: "short" })}`, // Multi-day leave
            type: "Week Leave",
            category: "",
            state: "Approved", // Use mapped status value
            requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            startTime: "2025-09-23T00:00:00",
            endTime: "2025-09-24T23:59:59",
            reason: "Medical appointment"
          }
        ];
        setLeaves(mockLeaves);
        setLoading(false);
      }, delayMs);
      return;
    }

    // Don't make API calls if not authenticated
    if (!isAuthenticated || !token) {
      console.log('🔍 useMyLeaves - Skipping API call, not authenticated or no token');
      setLoading(false);
      return;
    }

    // Add a small delay to ensure token is properly set in the API layer
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 useMyLeaves - Making API call with token:', token ? 'present' : 'missing');
      const data = await getMyLeaves(month);
      
      // Get start of current month for filtering
      const now = new Date();
      const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      
      console.log('🔍 useMyLeaves - Filtering leaves where endTime >= start of current month:', startOfCurrentMonth);
      
      const convertedLeaves: LeaveItem[] = data
        .filter((leave: LeaveRequest) => {
          // Filter: show only leaves where endTime >= start of current month
          const endTime = new Date(leave.endTime);
          const shouldInclude = endTime >= startOfCurrentMonth;
          console.log('🔍 useMyLeaves - Leave ID:', leave.id, 'endTime:', endTime, 'shouldInclude:', shouldInclude);
          return shouldInclude;
        })
        .map((leave: LeaveRequest) => {
          const requestDate = new Date(leave.requestDate);
          const startTime = new Date(leave.startTime);
          const endTime = new Date(leave.endTime);
          
          // Map status to display format
          const statusMap: Record<string, "Approved" | "Awaiting" | "Declined" | "PENDING" | "APPROVED" | "REJECTED"> = {
            'PENDING': 'Awaiting',
            'APPROVED': 'Approved',
            'REJECTED': 'Declined'
          };
          
          // Determine category based on leave type
          let category: string;
          if (leave.leaveType === 'Shift Leave') {
            // Show start-end time for Shift Leave
            const startTimeStr = startTime.toLocaleTimeString('en-US', { 
              hour12: false, 
              hour: '2-digit', 
              minute: '2-digit' 
            });
            const endTimeStr = endTime.toLocaleTimeString('en-US', { 
              hour12: false, 
              hour: '2-digit', 
              minute: '2-digit' 
            });
            category = `${startTimeStr} - ${endTimeStr}`;
          } else {
            // Show empty line for other leave types (Month Leave, Week Leave, All Day Leave)
            category = '';
          }
          
          // Format date as "Start Date - End Date"
          let dateString: string;
          if (leave.leaveType === "Day Leave" || startTime.toDateString() === endTime.toDateString()) {
            // Day Leave or same day: just show the date once
            dateString = fmt(startTime, { day: "2-digit", month: "short" });
          } else {
            // Different days: show "Start Date - End Date"
            const startDateStr = fmt(startTime, { day: "2-digit", month: "short" });
            const endDateStr = fmt(endTime, { day: "2-digit", month: "short" });
            dateString = `${startDateStr} - ${endDateStr}`;
          }

          return {
            id: leave.id,
            date: dateString, // Format as "Start Date - End Date" or just date if Day Leave or same day
            type: leave.leaveType,
            category: category,
            state: statusMap[leave.status] || (leave.status as "Approved" | "Awaiting" | "Declined" | "PENDING" | "APPROVED" | "REJECTED"),
            requestDate: leave.requestDate,
            startTime: leave.startTime,
            endTime: leave.endTime,
            reason: leave.reason
          };
        });
      
      console.log('🔍 useMyLeaves - Filtered leaves count:', convertedLeaves.length);
      setLeaves(convertedLeaves);
    } catch (err: any) {
      console.error('🔍 useMyLeaves - Error:', err);
      setError(err?.message ?? "Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  }, [mock, delayMs, month, isAuthenticated, token]);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    leaves,
    loading,
    error,
    refresh,
  };
}
