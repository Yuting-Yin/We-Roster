// src/lib/rosterPeriods.ts
// Roster Period System for Staff App

export interface RosterPeriod {
  id: string;
  name: string;
  startMonth: number; // 0-11 (JavaScript month index)
  startYear: number;
  endMonth: number;   // 0-11 (JavaScript month index)
  endYear: number;
}

// Predefined roster periods - configured by admin in backend
const ROSTER_PERIODS: RosterPeriod[] = [
  {
    id: '2025-q3',
    name: 'Q3 2025',
    startMonth: 8,  // September (0-indexed)
    startYear: 2025,
    endMonth: 9,    // October (0-indexed)
    endYear: 2025,
  },
  {
    id: '2025-q4',
    name: 'Q4 2025',
    startMonth: 10, // November (0-indexed)
    startYear: 2025,
    endMonth: 11,   // December (0-indexed)
    endYear: 2025,
  },
  {
    id: '2026-q1',
    name: 'Q1 2026',
    startMonth: 0,  // January (0-indexed)
    startYear: 2026,
    endMonth: 1,    // February (0-indexed)
    endYear: 2026,
  },
  {
    id: '2026-q2',
    name: 'Q2 2026',
    startMonth: 2,  // March (0-indexed)
    startYear: 2026,
    endMonth: 3,    // April (0-indexed)
    endYear: 2026,
  },
];

/**
 * Find which roster period a given date belongs to
 */
export function getRosterPeriodForDate(date: Date): RosterPeriod | null {
  for (const period of ROSTER_PERIODS) {
    const startDate = new Date(period.startYear, period.startMonth, 1);
    const endDate = new Date(period.endYear, period.endMonth + 1, 0); // Last day of end month
    
    if (date >= startDate && date <= endDate) {
      return period;
    }
  }
  
  return null;
}

/**
 * Get the roster period that contains the current date
 */
export function getCurrentRosterPeriod(): RosterPeriod | null {
  return getRosterPeriodForDate(new Date());
}

/**
 * Get the months that should be displayed for a given date
 * Returns an array of month objects for the calendar
 */
export function getRosterPeriodMonths(date: Date): Array<{
  title: string;
  first: Date;
  firstWeekdayMon0: number;
  days: Date[];
}> {
  const period = getRosterPeriodForDate(date);
  
  if (!period) {
    // Fallback: use the date's month and next month
    const startMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    return buildMonthsFromStart(startMonth, 2);
  }
  
  // Use the period's start month
  const startMonth = new Date(period.startYear, period.startMonth, 1);
  return buildMonthsFromStart(startMonth, 2);
}

/**
 * Helper function to build months from a start date
 */
function buildMonthsFromStart(startDate: Date, count: number) {
  const fmt = (d: Date, opt: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-US", opt).format(d);
  
  const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
  const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
  
  return Array.from({ length: count }, (_, k) => {
    const first = startOfMonth(new Date(startDate.getFullYear(), startDate.getMonth() + k, 1));
    const last = endOfMonth(first);
    const firstWeekdayMon0 = (first.getDay() + 6) % 7; // 0..6 => Mon..Sun

    const days: Date[] = [];
    for (let d = 1; d <= last.getDate(); d++) {
      days.push(new Date(first.getFullYear(), first.getMonth(), d));
    }

    return {
      title: fmt(first, { month: "long" }),
      first,
      firstWeekdayMon0,
      days,
    };
  });
}

/**
 * Get the next roster period after a given date
 */
export function getNextRosterPeriod(date: Date): RosterPeriod | null {
  const currentPeriod = getRosterPeriodForDate(date);
  if (!currentPeriod) return null;
  
  const currentIndex = ROSTER_PERIODS.findIndex(p => p.id === currentPeriod.id);
  if (currentIndex === -1 || currentIndex >= ROSTER_PERIODS.length - 1) return null;
  
  return ROSTER_PERIODS[currentIndex + 1];
}

/**
 * Get the previous roster period before a given date
 */
export function getPreviousRosterPeriod(date: Date): RosterPeriod | null {
  const currentPeriod = getRosterPeriodForDate(date);
  if (!currentPeriod) return null;
  
  const currentIndex = ROSTER_PERIODS.findIndex(p => p.id === currentPeriod.id);
  if (currentIndex <= 0) return null;
  
  return ROSTER_PERIODS[currentIndex - 1];
}
