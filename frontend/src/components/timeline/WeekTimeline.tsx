import React from "react";
import type { ComponentProps } from "react";

import { View, Text, Pressable, StyleSheet, ScrollView, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { sx, sy } from "@/theme/metrics";
import { COLOR } from "@/theme/colors";
import { fmt } from "@/lib/date";
import { isDateInPast } from "@/lib/dateValidation";
import type { EventItem, ShiftSlot } from "@/types/roster";

type IconName = ComponentProps<typeof Ionicons>["name"];
type Slot = { start: string; end: string };
const dayAt = (d0: Date, i: number) => {
  const d = new Date(d0);
  d.setDate(d0.getDate() + i);
  return d;
};
const slotFromEvent = (ev: EventItem): Slot => ({ start: ev.start, end: ev.end });
const locationOf = (ev: EventItem) => ev.location ?? "Unassigned";
const roleOf = (ev: EventItem) => ev.role ?? null;
const teammatesOf = (ev: EventItem) => ev.teammates ?? null;
const SHIFT_BADGES: Record<ShiftSlot | "DEFAULT", { icon: IconName; label: string }> = {
  AM: { icon: "sunny-outline", label: "AM" },
  PM: { icon: "moon-outline", label: "PM" },
  AH: { icon: "partly-sunny-outline", label: "AH" },
  ON_CALL: { icon: "call-outline", label: "On Call" },
  DEFAULT: { icon: "calendar-outline", label: "Shift" },
};

function badgeMetaFor(ev: EventItem): { icon: IconName; label: string } {
  // Use the shift type directly from the event
  if (ev.type && SHIFT_BADGES[ev.type]) {
    return SHIFT_BADGES[ev.type];
  }
  
  // Fallback to title parsing if type is not available
  if (ev.title) {
    const lower = ev.title.toLowerCase();
    if (lower.includes("on-call")) return SHIFT_BADGES["ON_CALL"];
    else if (lower.includes("after")) return SHIFT_BADGES["AH"];
    else if (lower.includes("ah")) return SHIFT_BADGES["AH"];
    else if (lower.includes("pm")) return SHIFT_BADGES["PM"];
    else if (lower.includes("am")) return SHIFT_BADGES["AM"];
  }
  
  return SHIFT_BADGES.DEFAULT;
}

export default function WeekTimeline({
  weekStart,
  selectedDate,
  getEventsFor,
  onOpenDetails,
  onOpenRequest,
}: {
  weekStart: Date;
  selectedDate?: Date;
  getEventsFor: (day: Date) => EventItem[];
  onOpenDetails: (ev: EventItem) => void;
  onOpenRequest: (day: Date, slot: Slot) => void;
}) {
  const scrollRef = React.useRef<ScrollView>(null);
  const dayOffsetsRef = React.useRef<number[]>(Array(7).fill(0));
  const [showTop, setShowTop] = React.useState(false);
  const fade = React.useRef(new Animated.Value(0)).current;

  const setFabVisible = (visible: boolean) => {
    if (visible === showTop) return;
    setShowTop(visible);
    Animated.timing(fade, { toValue: visible ? 1 : 0, duration: 160, useNativeDriver: true }).start();
  };

  const indexForDate = (base: Date, target: Date) => {
    const startBase = new Date(base); startBase.setHours(0, 0, 0, 0);
    const startTarget = new Date(target); startTarget.setHours(0, 0, 0, 0);
    const diffDays = Math.round((startTarget.getTime() - startBase.getTime()) / 86400000);
    return Math.max(0, Math.min(6, diffDays));
  };

  // Scroll to selected day when date changes
  React.useEffect(() => {
    const base = weekStart instanceof Date ? weekStart : new Date(weekStart);
    const sel = (selectedDate instanceof Date ? selectedDate : undefined) ?? base;
    const idx = indexForDate(base, sel);
    const y = dayOffsetsRef.current[idx] ?? 0;
    scrollRef.current?.scrollTo({ y: Math.max(0, y - sy(8)), animated: true });
  }, [selectedDate, weekStart]);

  const handleScroll = (e: any) => {
    const y = e.nativeEvent.contentOffset.y as number;
    const viewportH = e.nativeEvent.layoutMeasurement.height as number;

    // Today's index within this week (clamped)
    const base = weekStart instanceof Date ? weekStart : new Date(weekStart);
    const today = new Date();
    const todayIdx = indexForDate(base, today);
    const todayY = dayOffsetsRef.current[todayIdx] ?? 0;

    // Consider header pill height margin
    const margin = sy(6);
    const topVisible = y + margin;
    const bottomVisible = y + viewportH - margin;

    const isOutOfView = todayY < topVisible || todayY > bottomVisible;
    setFabVisible(isOutOfView);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: sy(16) }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {Array.from({ length: 7 }).map((_, idx) => {
          const day = dayAt(weekStart, idx);
          const events = getEventsFor(day);
          return (
            <View
              key={idx}
              style={styles.dayBlock}
              onLayout={(e) => {
                dayOffsetsRef.current[idx] = e.nativeEvent.layout.y;
              }}
            >
              <View style={styles.dayTitleWrap}>
                <Text style={styles.dayTitle}>
                  {fmt(day, { weekday: "short" })} {fmt(day, { day: "2-digit", month: "short" })}
                </Text>
              </View>
              {events.length === 0 ? (
                <View style={styles.noShiftsContainer}>
                  <Text style={styles.noShiftsText}>No shifts scheduled</Text>
                </View>
              ) : (
                events.map((ev) => {
                const filled = ev.action === "arrow";
                const slot = slotFromEvent(ev);
                const badge = badgeMetaFor(ev);
                const infoLines: Array<{ icon: IconName; text: string }> = [
                  { icon: "pin-outline", text: locationOf(ev) },
                ];
                const role = roleOf(ev);
                if (role) infoLines.push({ icon: "briefcase-outline", text: role });
                const teammates = teammatesOf(ev);
                if (teammates) infoLines.push({ icon: "people-outline", text: teammates });
                const isOpenShift = ev.action === 'plus';
                const isPastEvent = isDateInPast(ev.date);
                
                const handlePress = () => {
                  if (isPastEvent) return; // Disable for past events
                  if (filled || isOpenShift) {
                    onOpenDetails(ev);
                  } else {
                    onOpenRequest(day, slot);
                  }
                };
                
                return (
                  <Pressable
                    key={ev.id}
                    onPress={handlePress}
                    disabled={isPastEvent}
                    style={[
                      styles.row, 
                      isOpenShift ? styles.rowOpenShift : filled ? styles.rowOn : styles.rowOff,
                      isPastEvent && styles.pastEventRow
                    ]}
                  >
                    <View style={[styles.badge, isOpenShift && styles.badgeOpenShift]}>
                      <Ionicons name={badge.icon} size={sx(18)} color={COLOR.brand} style={styles.badgeIcon} />
                      <Text style={styles.badgeLabel}>{badge.label}</Text>
                    </View>
                    <View style={styles.infoColumn}>
                      {/* Show "taken" badge for assigned shifts that have matching open shift */}
                      {ev.action === 'arrow' && (ev as any).isTaken && (
                        <View style={styles.takenBadge}>
                          <Text style={styles.takenBadgeText}>taken</Text>
                        </View>
                      )}
                      {/* Show "OPEN SHIFT" badge for open shifts */}
                      {isOpenShift && (
                        <View style={styles.openShiftBadge}>
                          <Ionicons name="megaphone-outline" size={sx(10)} color={COLOR.success} style={{ marginRight: sx(4) }} />
                          <Text style={styles.openShiftBadgeText}>OPEN SHIFT</Text>
                        </View>
                      )}
                      <View style={styles.line}>
                        <Ionicons name="time-outline" size={sx(14)} color={COLOR.ink} style={styles.ic} />
                        <Text style={styles.mainText}>{`${ev.start} - ${ev.end}`}</Text>
                      </View>
                      {infoLines.map((line, lineIdx) => (
                        <View key={`${ev.id}-${line.icon}-${lineIdx}`} style={styles.line}>
                          <Ionicons name={line.icon} size={sx(14)} color={COLOR.ink} style={styles.ic} />
                          <Text style={styles.subText}>{line.text}</Text>
                        </View>
                      ))}
                    </View>

                    <Ionicons
                      name={filled ? "arrow-forward-circle" : isOpenShift ? "add-circle" : "add-circle"}
                      size={sx(24)}
                      color={isPastEvent ? COLOR.label : (isOpenShift ? COLOR.success : COLOR.brand)}
                    />
                  </Pressable>
                );
                })
              )}
            </View>
          );
        })}
      </ScrollView>

      {showTop && (
        <Animated.View style={[styles.fabWrap, { opacity: fade }]}> 
          <Pressable
            onPress={() => {
              const base = weekStart instanceof Date ? weekStart : new Date(weekStart);
              const today = new Date();
              const idx = indexForDate(base, today);
              const y = dayOffsetsRef.current[idx] ?? 0;
              scrollRef.current?.scrollTo({ y: Math.max(0, y - sy(8)), animated: true });
            }}
            style={styles.todayBtn}
            hitSlop={10}
          >
            <Ionicons name="return-up-back-outline" size={sx(18)} color={COLOR.brand} style={{ marginRight: sx(6) }} />
            <Text style={{ color: COLOR.brand, fontSize: sx(14), fontWeight: "700" }}>Today</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dayBlock: { paddingHorizontal: sx(16), paddingTop: sy(10), },
  dayTitleWrap: { 
    alignSelf: "flex-start", 
    backgroundColor: COLOR.brand, 
    borderRadius: sx(12), 
    paddingHorizontal: sx(12), 
    paddingVertical: sy(4), 
    marginBottom: sy(8), 
    justifyContent: "center" 
  },
  dayTitle: { color: "#fff", fontSize: sx(12), fontWeight: "700" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: sx(12),
    borderRadius: sx(12),
    borderWidth: 1,
    marginBottom: sy(10),
    minHeight: sy(120), // Increased height for better readability
    paddingVertical: sy(10),
  },
  rowOn: { backgroundColor: "#F6FAFF", borderColor: "#DCE9F9" },
  rowOff: { backgroundColor: "#F8FBFF", borderColor: "#E6EEF8" },
  rowOpenShift: { 
    backgroundColor: "rgba(232, 245, 233, 0.5)", // Very light green
    borderColor: "rgba(76, 175, 80, 0.3)", // Subtle green border
    borderStyle: 'dashed', // Dashed border to indicate open shift
  },
  pastEventRow: {
    opacity: 0.6, // Make past events appear dimmed
  },
  badge: {
    width: sx(52),
    height: sy(58),
    borderRadius: sx(10),
    backgroundColor: "#EAF3FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: sx(10),
    paddingVertical: sy(6),
    gap: sy(4),
  },
  badgeOpenShift: {
    backgroundColor: "rgba(76, 175, 80, 0.15)", // Light green for open shifts
  },
  takenBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 120, 212, 0.08)',
    paddingHorizontal: sx(6),
    paddingVertical: sy(2),
    borderRadius: sx(4),
    marginBottom: sy(4),
  },
  takenBadgeText: {
    color: COLOR.brand,
    fontSize: sx(9),
    fontWeight: '400',
  },
  openShiftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(76, 175, 80, 0.12)',
    paddingHorizontal: sx(6),
    paddingVertical: sy(2),
    borderRadius: sx(4),
    marginBottom: sy(4),
  },
  openShiftBadgeText: {
    color: COLOR.success,
    fontSize: sx(9),
    fontWeight: '700',
  },
  badgeIcon: { marginBottom: sy(2) },
  badgeLabel: { color: COLOR.ink, fontSize: sx(11), fontWeight: "700" },
  infoColumn: { flex: 1, gap: sy(4), justifyContent: "center" },
  line: { flexDirection: "row", alignItems: "center" },
  ic: { marginRight: sx(6) },
  mainText: { color: COLOR.ink, fontSize: sx(14), fontWeight: "700" },
  subText: { color: COLOR.ink, fontSize: sx(12) },
  fabWrap: { position: "absolute", right: sx(16), bottom: sy(20) },
  todayBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: sx(22), paddingHorizontal: sx(14), paddingVertical: sy(10), shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 8 },
  noShiftsContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: sx(12),
    paddingHorizontal: sx(16),
    paddingVertical: sy(20),
    marginBottom: sy(10),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderStyle: "dashed",
  },
  noShiftsText: {
    color: COLOR.label,
    fontSize: sx(14),
    fontWeight: "500",
    textAlign: "center",
  },
});
