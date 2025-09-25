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

  const [shiftMap, setShiftMap] = useState<Record<string, ShiftType>>({});
  const [eventsByDate, setEventsByDate] = useState<Record<string, EventItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert backend data to frontend format
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

    // Show coworker count instead of teammate names
    const coworkerCount = shift.coworkers || 0;
    const teammatesString = coworkerCount > 1 
      ? `working with ${coworkerCount - 1} others`
      : undefined;

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
      type: shift.code as ShiftType,
      location: locationString,
      role: shift.role, // This will be the designation from backend
      teammates: teammatesString,
      coworkers: coworkers,
      action: "arrow", // Allocated shifts show arrow (for details)
      campus: shift.campus,
      room: shift.room,
      campusAddress: shift.campusAddress,
    };
  }, []);

  const convertDayRosterToEvents = useCallback((dayRoster: DayRosterDto): EventItem[] => {
    return dayRoster.shifts.map(convertShiftToEvent);
  }, [convertShiftToEvent]);

  const convertToShiftMap = useCallback((dayRoster: DayRosterDto): Record<string, ShiftType> => {
    const shiftMap: Record<string, ShiftType> = {};
    
    // Group shifts by date to determine the correct DateType
    const shiftsByDate: Record<string, string[]> = {};
    dayRoster.shifts.forEach(shift => {
      const shiftDate = shift.startTs.split('T')[0]; // "2025-09-25T08:00:00" -> "2025-09-25"
      if (!shiftsByDate[shiftDate]) {
        shiftsByDate[shiftDate] = [];
      }
      shiftsByDate[shiftDate].push(shift.code);
    });
    
    // Convert shift codes to DateType for each date - use actual shift types directly
    Object.entries(shiftsByDate).forEach(([date, shiftCodes]) => {
      const types = new Set(shiftCodes);
      let dateType: ShiftType;
      
      // Priority order: ON_CALL > AH > PM > AM
      if (types.has("ON_CALL")) {
        dateType = "ON_CALL"; // ○●
      } else if (types.has("AH")) {
        dateType = "AH"; // ○●
      } else if (types.has("PM")) {
        dateType = "PM"; // ○●
      } else if (types.has("AM")) {
        dateType = "AM"; // ●○
      } else {
        dateType = "unallocated"; // ○○
      }
      
      shiftMap[date] = dateType;
    });
    
    return shiftMap;
  }, []);

  const groupEventsByDate = useCallback((events: EventItem[], shifts: any[]): Record<string, EventItem[]> => {
    const grouped: Record<string, EventItem[]> = {};
    events.forEach((event, index) => {
      // Extract date from startTs string directly to avoid timezone issues
      const shiftDate = shifts[index].startTs.split('T')[0]; // "2025-09-25T08:00:00" -> "2025-09-25"
      if (!grouped[shiftDate]) {
        grouped[shiftDate] = [];
      }
      grouped[shiftDate].push(event);
    });
    return grouped;
  }, []);

  const loadDayData = useCallback(async (date: Date) => {
    if (useMock) {
      setLoading(true);
      setError(null);
      
      // Simulate API delay
      setTimeout(() => {
        // Mock data - you can replace this with actual mock data
        setShiftMap({});
        setEventsByDate({});
        setLoading(false);
      }, delayMs);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Get day roster data
      const dayRoster = await getDayRoster(dateStr);
      const events = convertDayRosterToEvents(dayRoster);
      const shiftMap = convertToShiftMap(dayRoster);
      
      // Group events by their actual dates using original shift data
      const groupedEvents = groupEventsByDate(events, dayRoster.shifts);

      setEventsByDate(prev => ({
        ...prev,
        ...groupedEvents
      }));
      
      setShiftMap(prev => ({
        ...prev,
        ...shiftMap
      }));

    } catch (err: any) {
      setError(err?.message ?? "Failed to load roster data");
    } finally {
      setLoading(false);
    }
  }, [useMock, delayMs, convertDayRosterToEvents, convertToShiftMap]);

  const loadCalendarData = useCallback(async (startDate: Date, months: number = 1) => {
    if (useMock) return;

    try {
      const startStr = startDate.toISOString().split('T')[0];
      const calendarDays = await getCalendarRange(startStr, months);
      
      // Convert calendar data to shift map
      const newShiftMap: Record<string, ShiftType> = {};
      calendarDays.forEach(day => {
        if (day.assignedAM || day.assignedPM) {
          newShiftMap[day.date] = day.assignedAM ? 'AM' : 'PM';
        }
      });

      setShiftMap(prev => ({
        ...prev,
        ...newShiftMap
      }));

    } catch (err: any) {
      console.error('Failed to load calendar data:', err);
    }
  }, [useMock]);

  const refresh = useCallback(async () => {
    const today = new Date();
    await loadDayData(today);
    
    // Also load calendar data for the current month
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    await loadCalendarData(monthStart, 1);
  }, [loadDayData, loadCalendarData]);

  const getEventsForDate = useCallback(
    (d: Date) => {
      const key = dayKey(d);
      return eventsByDate[key] || [];
    },
    [eventsByDate]
  );

  // Load initial data
  useEffect(() => {
    loadDayData(anchorDate);
    
    // Load calendar data for the current month
    const monthStart = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
    loadCalendarData(monthStart, 1);
  }, [anchorDate, loadDayData, loadCalendarData]);

  return useMemo(
    () => ({ 
      shiftMap, 
      loading, 
      error, 
      refresh, 
      getEventsForDate,
      loadDayData 
    }),
    [shiftMap, loading, error, refresh, getEventsForDate, loadDayData]
  );
}
