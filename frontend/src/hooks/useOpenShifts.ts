import { useState, useCallback, useEffect } from "react";
import { getOpenShiftsForWeek, getOpenShiftDetails, applyForOpenShift, OpenShiftDto, CreateOpenShiftRequestInput } from "@/api/openshift";
import { useCurrentUser } from "./useCurrentUser";

type Options = {
  mock?: boolean;
  delayMs?: number;
};

export function useOpenShiftsData(weekStart: Date, opts: Options = {}) {
  const envMock = process.env.EXPO_PUBLIC_MOCK_OPENSHIFTS === "1";
  const useMock = opts.mock ?? envMock;
  const delayMs = opts.delayMs ?? 300;
  
  const { user } = useCurrentUser();
  const [openShifts, setOpenShifts] = useState<Record<string, OpenShiftDto[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOpenShifts = useCallback(async () => {
    if (useMock) {
      // Mock data - return empty for now, frontend will handle this
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      setOpenShifts({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const startDate = weekStart.toISOString().split('T')[0]; // YYYY-MM-DD format
      const response = await getOpenShiftsForWeek(startDate, user?.email || undefined);
      setOpenShifts(response.openShifts);
    } catch (err) {
      console.error("Failed to load open shifts:", err);
      setError(err instanceof Error ? err.message : "Failed to load open shifts");
      setOpenShifts({});
    } finally {
      setLoading(false);
    }
  }, [weekStart, user?.email, useMock, delayMs]);

  useEffect(() => {
    loadOpenShifts();
  }, [loadOpenShifts]);

  const refresh = useCallback(() => {
    loadOpenShifts();
  }, [loadOpenShifts]);

  return {
    openShifts,
    loading,
    error,
    refresh,
  };
}

export function useOpenShiftDetails(openShiftId: number | null) {
  const { user } = useCurrentUser();
  const [openShift, setOpenShift] = useState<OpenShiftDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDetails = useCallback(async () => {
    if (!openShiftId || !user?.email) {
      setOpenShift(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await getOpenShiftDetails(openShiftId, user.email);
      setOpenShift(response.openShift);
    } catch (err) {
      console.error("Failed to load open shift details:", err);
      setError(err instanceof Error ? err.message : "Failed to load open shift details");
      setOpenShift(null);
    } finally {
      setLoading(false);
    }
  }, [openShiftId, user?.email]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  return {
    openShift,
    loading,
    error,
    refresh: loadDetails,
  };
}

export function useOpenShiftApplication() {
  const { user } = useCurrentUser();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyForShift = useCallback(async (input: CreateOpenShiftRequestInput) => {
    if (!user?.email) {
      setError("User not authenticated");
      return { success: false, error: "User not authenticated" };
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const response = await applyForOpenShift(input, user.email);
      
      return { success: true, data: response };
    } catch (err: any) {
      // Don't log validation errors to console - they're expected user behavior
      // Extract error message from API response
      let errorMessage = "Failed to apply for open shift";
      
      if (err?.message) {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed.details && Array.isArray(parsed.details) && parsed.details.length > 0) {
            errorMessage = parsed.details[0]; // First validation error
          } else if (parsed.error) {
            errorMessage = parsed.error;
          }
        } catch {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSubmitting(false);
    }
  }, [user?.email]);

  return {
    applyForShift,
    submitting,
    error,
  };
}
