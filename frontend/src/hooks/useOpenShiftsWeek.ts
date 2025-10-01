import { useState, useEffect } from "react";
import { getOpenShiftsForWeek } from "@/api/openshift";
import type { OpenShiftDto } from "@/api/openshift";

/**
 * Hook to fetch open shifts for a specific week
 */
export function useOpenShiftsWeek(weekStartDate: Date, userEmail?: string) {
  const [openShifts, setOpenShifts] = useState<OpenShiftDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Format date as YYYY-MM-DD
      const startDateStr = weekStartDate.toISOString().split('T')[0];
      
      const response = await getOpenShiftsForWeek(startDateStr, userEmail);
      
      // Flatten the grouped shifts into a single array
      const allShifts = Object.values(response.openShifts).flat();
      
      // Only include AVAILABLE shifts (exclude CANCELLED, APPROVED_FOR_FORMAL, etc.)
      const availableShifts = allShifts.filter(shift => 
        shift.status === "AVAILABLE" || shift.status === "READY_TO_RUN"
      );
      
      setOpenShifts(availableShifts);
    } catch (err) {
      console.error("Failed to fetch open shifts for week:", err);
      setError(err instanceof Error ? err.message : "Failed to load open shifts");
      setOpenShifts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [weekStartDate, userEmail]);

  return {
    openShifts,
    loading,
    error,
    refresh: fetchData,
  };
}

