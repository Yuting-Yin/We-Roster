// src/hooks/useRequests.ts
import { useState, useEffect } from "react";
import { RequestCardData, RequestStatus } from "@/types/request";
import { getAwaitingRequests, getHistoryRequests } from "@/api/request";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function useRequests(month?: number, year?: number) {
  const [awaitingRequests, setAwaitingRequests] = useState<RequestCardData[]>([]);
  const [historyRequests, setHistoryRequests] = useState<RequestCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useCurrentUser();

  const loadAwaitingRequests = async (monthParam?: number, yearParam?: number) => {
    try {
      setError(null);
      const requests = await getAwaitingRequests(monthParam, yearParam);
      setAwaitingRequests(requests);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load awaiting requests");
      console.error("Error loading awaiting requests:", err);
    }
  };

  const loadHistoryRequests = async (monthParam?: number, yearParam?: number) => {
    try {
      setError(null);
      const requests = await getHistoryRequests(monthParam, yearParam);
      setHistoryRequests(requests);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history requests");
      console.error("Error loading history requests:", err);
    }
  };

  const loadAllRequests = async (monthParam?: number, yearParam?: number) => {
    setLoading(true);
    try {
      await Promise.all([loadAwaitingRequests(monthParam, yearParam), loadHistoryRequests(monthParam, yearParam)]);
    } finally {
      setLoading(false);
    }
  };

  const refreshRequests = async () => {
    await loadAllRequests(month, year);
  };

  useEffect(() => {
    if (user?.id) {
      loadAllRequests(month, year);
    }
  }, [user?.id, month, year]);

  return {
    awaitingRequests,
    historyRequests,
    loading,
    error,
    refreshRequests,
    loadAwaitingRequests,
    loadHistoryRequests,
  };
}

export function useRequestByStatus(status: RequestStatus, month?: number, year?: number) {
  const [requests, setRequests] = useState<RequestCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useCurrentUser();

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (status === "AWAITING") {
        const data = await getAwaitingRequests(month, year);
        setRequests(data);
      } else {
        // For history, we need to get both APPROVED and DECLINED requests
        // The getHistoryRequests API should return both types
        const data = await getHistoryRequests(month, year);
        setRequests(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to load ${status.toLowerCase()} requests`);
      console.error(`Error loading ${status.toLowerCase()} requests:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadRequests();
    }
  }, [status, user?.id, month, year]);

  const refresh = async () => {
    await loadRequests();
  };

  return {
    requests,
    loading,
    error,
    refresh,
  };
}
