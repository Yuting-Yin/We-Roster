import { useState, useEffect, useCallback, useMemo } from 'react';
import { getMyLeaves, LeaveRequest } from '@/api/leave';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to fetch approved leaves and convert them to a date map
 * Returns a Record<string, boolean> where keys are YYYY-MM-DD dates
 * and values are true if the date has an approved leave
 */
export function useApprovedLeaves(month?: string) {
  const { isAuthenticated, token } = useAuth();
  
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    // Don't make API calls if not authenticated
    if (!isAuthenticated || !token) {
      setLoading(false);
      return;
    }

    // Add a small delay to ensure token is properly set in the API layer
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      setLoading(true);
      setError(null);
      
      const data = await getMyLeaves(month);
      
      // Filter only approved leaves
      const approvedLeaves = data.filter((leave: LeaveRequest) => 
        leave.status === 'APPROVED'
      );
      
      setLeaves(approvedLeaves);
    } catch (err: any) {
      console.error('useApprovedLeaves - Error:', err);
      setError(err?.message ?? "Failed to load approved leaves");
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  }, [month, isAuthenticated, token]);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  // Convert leaves to a date map (YYYY-MM-DD -> true)
  const leaveMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    
    leaves.forEach((leave) => {
      const startTime = new Date(leave.startTime);
      const endTime = new Date(leave.endTime);
      
      console.log('🔍 Leave processing:', {
        leaveId: leave.id,
        originalStartTime: leave.startTime,
        originalEndTime: leave.endTime,
        parsedStartTime: startTime.toISOString(),
        parsedEndTime: endTime.toISOString(),
        startTimeLocal: startTime.toDateString(),
        endTimeLocal: endTime.toDateString()
      });
      
      // Normalize both dates to midnight for proper date-only comparison
      const startDate = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate());
      const endDate = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate());
      
      console.log('🔍 Normalized dates:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        startDateLocal: startDate.toDateString(),
        endDateLocal: endDate.toDateString()
      });
      
      // Add all dates in the leave range (inclusive)
      const currentDate = new Date(startDate);
      const datesAdded: string[] = [];
      
      while (currentDate <= endDate) {
        const dateKey = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
        map[dateKey] = true;
        datesAdded.push(dateKey);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      console.log('🔍 Dates added to map:', datesAdded);
    });
    
    console.log('🔍 Final leaveMap:', map);
    return map;
  }, [leaves]);

  return {
    leaveMap,
    loading,
    error,
    refresh,
  };
}

