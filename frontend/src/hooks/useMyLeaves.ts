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
        const mockLeaves: LeaveItem[] = [
          {
            id: 1,
            date: fmt(new Date(), { day: "2-digit", month: "short" }),
            type: "Day Leave",
            category: "08:00 - 16:00",
            state: "PENDING",
            requestDate: new Date().toISOString(),
            startTime: "2025-09-25T08:00:00",
            endTime: "2025-09-25T16:00:00",
            reason: "Personal appointment"
          },
          {
            id: 2,
            date: fmt(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), { day: "2-digit", month: "short" }),
            type: "Day Leave",
            category: "16:00 - 00:00",
            state: "APPROVED",
            requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            startTime: "2025-09-23T16:00:00",
            endTime: "2025-09-24T00:00:00",
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
      const convertedLeaves: LeaveItem[] = data.map((leave: LeaveRequest) => {
        const requestDate = new Date(leave.requestDate);
        const startTime = new Date(leave.startTime);
        const endTime = new Date(leave.endTime);
        
        // Map status to display format
        const statusMap: Record<string, string> = {
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
        
        return {
          id: leave.id,
          date: fmt(startTime, { day: "2-digit", month: "short" }), // Use start time date, not request date
          type: leave.leaveType,
          category: category,
          state: statusMap[leave.status] || leave.status,
          requestDate: leave.requestDate,
          startTime: leave.startTime,
          endTime: leave.endTime,
          reason: leave.reason
        };
      });
      
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
