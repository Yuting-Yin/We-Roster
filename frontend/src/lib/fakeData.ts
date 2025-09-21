import { ShiftType, EventItem } from "@/types/roster";
import { dayKey } from "./date";

// two type of slots for shifts
export const SLOTS = [
  { id: "am", title: "AM shift", start: "08:00", end: "13:00" },
  { id: "pm", title: "PM shift", start: "13:00", end: "18:00" },
] as const;

// dummy data for my roster page (all shifts for current user within 2 month)
export function makeDemoShiftMap(): Record<string, ShiftType> {
  const keyOf = (y: number, m0: number, d: number) =>
    new Date(y, m0, d).toISOString().slice(0, 10);

  return {
    [keyOf(2025, 4, 11)]: "not-working",
    [keyOf(2025, 4, 12)]: "both-shifts",
    [keyOf(2025, 4, 13)]: "day-shift",
    [keyOf(2025, 4, 14)]: "night-shift",
    [keyOf(2025, 4, 15)]: "unallocated",
    [keyOf(2025, 4, 16)]: "day-shift",
    [keyOf(2025, 4, 17)]: "night-shift",
    [keyOf(2025, 4, 1)]: "day-shift",
    [keyOf(2025, 4, 2)]: "night-shift",
    [keyOf(2025, 4, 3)]: "both-shifts",
    [keyOf(2025, 4, 4)]: "not-working",
    [keyOf(2025, 4, 5)]: "unallocated",
    [keyOf(2025, 4, 18)]: "both-shifts",
    [keyOf(2025, 4, 25)]: "day-shift",
    [keyOf(2025, 4, 28)]: "night-shift",
  };
}

// function that export dummy data for each shift
export function buildEventsFor(date: Date, shiftMap: Record<string, ShiftType>): EventItem[] {
  const t = shiftMap[dayKey(date)] ?? "unallocated";
  const isScheduled = (slotId: "am" | "pm") =>
    t === "both-shifts" ||
    (t === "day-shift" && slotId === "am") ||
    (t === "night-shift" && slotId === "pm");

  return SLOTS.map((slot) =>
    isScheduled(slot.id)
      ? {
          id: `ev-${slot.id}`,
          title: slot.title,
          location: "PMCC",
          role: "Anaes Coordinator",
          teammates: "Working with 3 others",
          start: slot.start,
          end: slot.end,
          action: "arrow",
        }
      : {
          id: `ev-${slot.id}`,
          title: "Unallocated",
          location: "Unallocated",
          start: slot.start,
          end: slot.end,
          action: "plus",
        }
  );
}
