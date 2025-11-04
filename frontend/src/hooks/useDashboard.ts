// src/hooks/useDashboard.ts
import { useEffect, useMemo, useRef, useState } from "react";
import { fetchJson } from "@/lib/api";
import type { DashboardPayload, DutyItem, ShiftItem, LeaveItem } from "@/types/dashboard";
import { dashboardFixtures, amplifyFixtures } from "@/fixtures/dashboard";

type Options = {
  /** Explicitly enable local Mock; if not provided, reads from environment variable EXPO_PUBLIC_MOCK_DASHBOARD */
  mock?: boolean;
  /** Simulated loading delay (milliseconds), useful for observing skeleton screens */
  delayMs?: number;
  /** Amplification factor, useful for checking horizontal scrolling and breakpoints (default 1) */
  amplifyTimes?: number;
};

export function useDashboardData(opts: Options = {}) {
  const envMock = process.env.EXPO_PUBLIC_MOCK_DASHBOARD === "1";
  const useMock = opts.mock ?? envMock;
  const delayMs = opts.delayMs ?? 400;
  const amplifyTimes = Math.max(1, opts.amplifyTimes ?? 1);

  const [duty, setDuty] = useState<DutyItem[]>([]);
  const [myShifts, setMyShifts] = useState<ShiftItem[]>([]);
  const [openShifts, setOpenShifts] = useState<ShiftItem[]>([]);
  const [leaves, setLeaves] = useState<LeaveItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = async () => {
    // Mock mode: use local data directly + artificial delay
    if (useMock) {
      setLoading(true);
      setError(null);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const fx = amplifyFixtures(amplifyTimes);
        setDuty([...fx.duty]);
        setMyShifts([...fx.myShifts]);
        setOpenShifts([...fx.openShifts]);
        setLeaves([...fx.leaves]);
        setLoading(false);
      }, delayMs);
      return;
    }

    // Production mode
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      // Try aggregated endpoint first
      const data = await fetchJson<DashboardPayload>("/api/v1/dashboard", {
        signal: controller.signal,
      });
      setDuty(safeArray<DutyItem>(data.duty));
      setMyShifts(safeArray<ShiftItem>(data.myShifts));
      setOpenShifts(safeArray<ShiftItem>(data.openShifts));
      setLeaves(safeArray<LeaveItem>(data.leaves));
    } catch {
      try {
        const [d, ms, os, ls] = await Promise.all([
          fetchJson<DutyItem[]>("/api/v1/duty", { signal: controller.signal }),
          fetchJson<ShiftItem[]>("/api/v1/my-shifts", { signal: controller.signal }),
          fetchJson<ShiftItem[]>("/api/v1/open-shifts", { signal: controller.signal }),
          fetchJson<LeaveItem[]>("/api/v1/leaves", { signal: controller.signal }),
        ]);
        setDuty(safeArray<DutyItem>(d));
        setMyShifts(safeArray<ShiftItem>(ms));
        setOpenShifts(safeArray<ShiftItem>(os));
        setLeaves(safeArray<LeaveItem>(ls));
      } catch (e2: any) {
        setError(e2?.message ?? "Failed to load dashboard data");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    return () => {
      abortRef.current?.abort();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useMock, amplifyTimes, delayMs]);

  const refresh = async () => {
    await load();
  };

  return useMemo(
    () => ({ duty, myShifts, openShifts, leaves, loading, error, refresh }),
    [duty, myShifts, openShifts, leaves, loading, error]
  );
}

function safeArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}
