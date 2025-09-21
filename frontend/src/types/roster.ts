export type ShiftType =
  | "day-shift"
  | "night-shift"
  | "both-shifts"
  | "not-working"
  | "unallocated";

export type EventItem = {
  id: string;
  title: string;
  location?: string;
  role?: string;
  teammates?: string;
  start: string; // "08:00"
  end: string;   // "13:00"
  color?: string;
  action?: "arrow" | "plus";
};

export type Slot = { start: string; end: string };
