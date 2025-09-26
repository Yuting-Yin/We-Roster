// Actual shift types (when staff is working)
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
};

export type Slot = { start: string; end: string };
