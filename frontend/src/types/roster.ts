/**
 * Shift Type Definitions (based on start time):
 * 
 * - AM: Shifts that START between 8:00-13:00
 * - PM: Shifts that START between 13:00-18:00
 * - AH: After Hours - Shifts that START outside 8:00-18:00 range
 * - ON_CALL: Standby shifts (can start anytime)
 * 
 * Note: The shift type is determined by when the shift STARTS, not when it ends.
 * For example, a shift starting at 16:00 and ending at 00:00 is a PM shift.
 */
export type ShiftType = "AM" | "PM" | "AH" | "ON_CALL";

// Legacy alias for backward compatibility
export type ShiftSlot = ShiftType;

export type Coworker = { id: string; name: string; initials?: string };


export type EventItem = {
  id: string;
  title: string;
  type?: ShiftType; // Only actual shift types, not status types
  location?: string; // legacy combined field (e.g., "PMCC Theatre 1")
  role?: string;
  teammates?: string;
  coworkers?: Coworker[];
  start: string; // "08:00"
  end: string;   // "13:00"
  color?: string;
  action?: "arrow" | "plus";
  campus?: string;          // e.g., "PMCC"
  room?: string;            // e.g., "Theatre 1"
  campusAddress?: string;   // e.g., address of the campus
  isTaken?: boolean;        // True if this assigned shift has a matching open shift at the same time
  hasOpenShift?: boolean;   // True if this shift has a matching open shift merged into one card
  openShiftInfo?: {         // Open shift details for merged events
    location?: string;
    role?: string;
    teammates?: string;
    color?: string;
  };
  hasDualAction?: boolean;  // True if card has both arrow (shift details) and plus (open shift) actions
  originalOpenShift?: any;  // Store original OpenShiftDto for merged events
  multipleOpenShifts?: number; // Number of open shifts at this time slot (if > 1, show "view more")
  openShiftDate?: string;   // Date string for navigation to Open Shifts page
};

export type Slot = { start: string; end: string };
