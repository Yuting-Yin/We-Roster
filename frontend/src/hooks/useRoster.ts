// src/hooks/useRoster.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchJson } from "@/lib/api";
import { dayKey } from "@/lib/date";
import { buildEventsFor, buildEventsMap, makeDemoAssignments, makeDemoShiftMap } from "@/lib/fakeData";
import type { EventItem, ShiftType } from "@/types/roster";

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

type Options = {
  /** Force mock mode (otherwise uses EXPO_PUBLIC_MOCK_ROSTER env flag). */
  mock?: boolean;
  /** Optional artificial delay when returning mock data. */
  delayMs?: number;
  /** Number of consecutive months to request (starting from anchor month). */
  months?: number;
};

type RosterPayload = {
  shiftMap?: Record<string, ShiftType>;
  events?: Record<string, EventItem[] | undefined>;
};

export function useRosterData(anchorDate: Date, opts: Options = {}) {
  const envMock = process.env.EXPO_PUBLIC_MOCK_ROSTER === "1";
  // TODO: Switch to live API when backend ready.
  const useMock = opts.mock ?? envMock;
  const delayMs = opts.delayMs ?? 300;
  const months = Math.max(1, opts.months ?? 2);

  const [shiftMap, setShiftMap] = useState<Record<string, ShiftType>>({});
  const [eventsByDate, setEventsByDate] = useState<Record<string, EventItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const monthAnchorDate = useMemo(() => new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1), [anchorDate]);
  const fetchKey = useMemo(() => monthKey(monthAnchorDate), [monthAnchorDate]);

  const load = useCallback(
    async (base: Date) => {
      if (useMock) {
        setLoading(true);
        setError(null);
        if (timerRef.current) clearTimeout(timerRef.current);
        // TODO: Remove mock delay hook once network is hooked up.
        timerRef.current = setTimeout(() => {
          const assignments = makeDemoAssignments();
          setShiftMap(makeDemoShiftMap(assignments));
          setEventsByDate(buildEventsMap(assignments));
          setLoading(false);
        }, delayMs);
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        month: monthKey(base),
        months: String(months),
      });

      try {
        const res = await fetchJson<RosterPayload>(`/api/roster?${params.toString()}`, {
          signal: controller.signal,
        });

        setShiftMap(normalizeShiftMap(res.shiftMap));
        setEventsByDate(normalizeEvents(res.events));
      } catch (err: any) {
        setError(err?.message ?? "Failed to load roster data");
      } finally {
        setLoading(false);
      }
    },
    [useMock, delayMs, months]
  );

  useEffect(() => {
    load(monthAnchorDate);
    return () => {
      abortRef.current?.abort();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [load, monthAnchorDate, fetchKey]);

  const refresh = useCallback(async () => {
    await load(monthAnchorDate);
  }, [load, monthAnchorDate]);

  const getEventsForDate = useCallback(
    (d: Date) => {
      const key = dayKey(d);
      if (eventsByDate[key]) return eventsByDate[key];
      // TODO: Drop demo fallback once backend data is reliable.
      return buildEventsFor(d);
    },
    [eventsByDate]
  );

  return useMemo(
    () => ({ shiftMap, loading, error, refresh, getEventsForDate }),
    [shiftMap, loading, error, refresh, getEventsForDate]
  );
}

function normalizeShiftMap(map?: Record<string, ShiftType>): Record<string, ShiftType> {
  if (!map) return {};
  const next: Record<string, ShiftType> = {};
  for (const [key, value] of Object.entries(map)) {
    if (value) next[key] = value;
  }
  return next;
}

function normalizeEvents(source?: Record<string, EventItem[] | undefined>): Record<string, EventItem[]> {
  if (!source) return {};
  const next: Record<string, EventItem[]> = {};
  for (const [key, value] of Object.entries(source)) {
    if (Array.isArray(value)) {
      next[key] = value.filter(Boolean) as EventItem[];
    }
  }
  return next;
}


