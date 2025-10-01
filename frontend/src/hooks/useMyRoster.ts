// frontend/src/hooks/useMyRoster.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { 
  getDayRoster, 
  getDayView, 
  refreshRoster, 
  getCalendarRange,
  type DayRosterDto,
  type DayViewDto,
  type CalendarDayDto,
  type RefreshResponse
} from "@/api/myroster";
import { fetchJson } from "@/lib/api";
import { dayKey } from "@/lib/date";
import type { EventItem, ShiftType } from "@/types/roster";

type Options = {
  /** Force mock mode (otherwise uses EXPO_PUBLIC_MOCK_ROSTER env flag). */
  mock?: boolean;
  /** Optional artificial delay when returning mock data. */
  delayMs?: number;
};

export function useMyRosterData(anchorDate: Date, opts: Options = {}) {
  const envMock = process.env.EXPO_PUBLIC_MOCK_ROSTER === "1";
  const useMock = opts.mock ?? envMock;
  const delayMs = opts.delayMs ?? 300;

  const [shiftMap, setShiftMap] = useState<Record<string, ShiftType | ShiftType[]>>({});
  const [eventsByDate, setEventsByDate] = useState<Record<string, EventItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert raw shift data to EventItem format
  const convertShiftToEvent = useCallback((shift: any): EventItem => {
    const startTime = new Date(shift.startTs).toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const endTime = new Date(shift.endTs).toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // Show teammate count
    const teammateCount = shift.teammates ? shift.teammates.length : 0;
    const teammatesString = teammateCount > 0 
      ? `working with ${teammateCount} others`
      : 'working alone';

    // Convert teammates to coworkers format
    const coworkers = shift.teammates ? shift.teammates.map((t: any) => ({
      id: t.staffId.toString(),
      name: t.staffName,
      initials: t.staffInitials
    })) : undefined;

    // Location should be campus + room
    const locationString = shift.campus && shift.room 
      ? `${shift.campus} - ${shift.room}`
      : shift.location || 'Location';

    return {
      id: shift.id.toString(),
      start: startTime,
      end: endTime,
      title: `${shift.dept || 'Shift'} - ${locationString}`,
      type: shift.type as ShiftType,
      location: locationString,
      role: shift.role,
      teammates: teammatesString,
      coworkers: coworkers,
      action: "arrow",
      campus: shift.campus,
      room: shift.room,
      campusAddress: shift.campusAddress,
    };
  }, []);

  const loadData = useCallback(async () => {
    if (useMock) {
      setLoading(true);
      setError(null);
      
      // Simulate API delay
      setTimeout(() => {
        // Mock data for Sarah Johnson's shifts this week
        const today = new Date();
        const mockEventsByDate: Record<string, EventItem[]> = {};
        const mockShiftMap: Record<string, ShiftType | ShiftType[]> = {};
        
        // Generate mock shifts for the current week
        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() - today.getDay() + i); // Start of week + i days
          const dateKey = date.toISOString().split('T')[0];
          
          // Add some shifts for certain days
          if (i === 1 || i === 3 || i === 5) { // Tuesday, Thursday, Saturday
            const shiftType = i === 1 ? 'AM' : i === 3 ? 'PM' : 'AH';
            mockEventsByDate[dateKey] = [{
              id: `mock-shift-${i}`,
              start: i === 1 ? '08:00' : i === 3 ? '16:00' : '00:00',
              end: i === 1 ? '16:00' : i === 3 ? '00:00' : '08:00',
              title: `${shiftType} Shift - Emergency Department`,
              type: shiftType as ShiftType,
              location: 'Emergency Department - ED Room 1',
              role: 'Registered Nurse',
              teammates: 'working with 2 others',
              action: 'arrow',
              campus: 'Main Campus',
              room: 'ED Room 1',
              campusAddress: '123 Hospital St, City'
            }];
            mockShiftMap[dateKey] = shiftType as ShiftType;
          } else {
            mockEventsByDate[dateKey] = [];
            // No shift = no entry in mockShiftMap (undefined)
          }
        }
        
        setShiftMap(mockShiftMap);
        setEventsByDate(mockEventsByDate);
        setLoading(false);
      }, delayMs);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use the same approach as useRosterData - load data for multiple months
      const monthAnchorDate = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
      const params = new URLSearchParams({
        month: monthAnchorDate.toISOString().slice(0, 7), // YYYY-MM format
        months: '2', // Load 2 months of data
      });
      
      
      const res = await fetchJson<{
        events?: Record<string, EventItem[] | undefined>;
        shiftMap?: Record<string, ShiftType | ShiftType[]>;
      }>(`/api/v1/myroster/roster?${params.toString()}`);

      // Normalize and set the data
      const normalizedEvents: Record<string, EventItem[]> = {};
      Object.entries(res.events || {}).forEach(([date, shifts]) => {
        if (shifts && Array.isArray(shifts)) {
          normalizedEvents[date] = shifts.map(convertShiftToEvent);
        }
      });
      const normalizedShiftMap = res.shiftMap || {};
      
      setEventsByDate(normalizedEvents);
      setShiftMap(normalizedShiftMap);

    } catch (err: any) {
      setError(err?.message ?? "Failed to load roster data");
    } finally {
      setLoading(false);
    }
  }, [useMock, delayMs]);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  const getEventsForDate = useCallback(
    (d: Date) => {
      const key = dayKey(d);
      return eventsByDate[key] || [];
    },
    [eventsByDate]
  );

  // Load initial data
  useEffect(() => {
    loadData();
  }, [loadData]);

  return useMemo(
    () => ({ 
      shiftMap, 
      eventsByDate,
      loading, 
      error, 
      refresh, 
      getEventsForDate,
      loadData 
    }),
    [shiftMap, eventsByDate, loading, error, refresh, getEventsForDate, loadData]
  );
}
