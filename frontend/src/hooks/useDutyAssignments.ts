import { useState, useEffect, useCallback } from 'react';
import { getTodayDutyAssignments, type DutyAssignmentData } from '@/api/duty';

export function useDutyAssignments() {
  const [assignments, setAssignments] = useState<DutyAssignmentData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getTodayDutyAssignments();
      setAssignments(data);
    } catch (err: any) {
      console.error('🔍 useDutyAssignments - Error loading duty assignments:', err);
      setError(err?.message ?? 'Failed to load duty assignments');
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadAssignments();
  }, [loadAssignments]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  return {
    assignments,
    loading,
    error,
    refresh,
  };
}
