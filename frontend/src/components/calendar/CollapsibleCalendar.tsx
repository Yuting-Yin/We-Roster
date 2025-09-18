// src/components/calendar/CollapsibleCalendar.tsx
import React, { useMemo, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet, Animated, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLOR } from "@/theme/colors";
import { H, sx } from "@/theme/metrics";
import { ShiftType } from "@/types/roster";

/* ===== Sizes ===== */
const CARET_SIZE = sx(28);
const CARET_ICON = sx(16);
const DOT_SIZE = sx(4);

/* =================== Helpers =================== */
const fmt = (d: Date, opt: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", opt).format(d);

const dayKey = (d: Date) => d.toISOString().slice(0, 10);
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

/* Weeks beginning on Monday */
function startOfWeekMon(d: Date) {
  const r = new Date(d);
  const day = r.getDay(); // 0 Sun .. 6 Sat
  const diff = (day + 6) % 7; // Offset with Mon=0
  r.setDate(r.getDate() - diff);
  r.setHours(0, 0, 0, 0);
  return r;
}

/* Derive the 7 days of this week (starting with Monday) from the selected date */
function getWeekDays(value: Date): Date[] {
  const start = startOfWeekMon(value);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

/** 生成从 anchor 起连续 count 个月，每月固定 6×7 网格（周一开头） */
function buildMonths(anchor: Date, count = 2) {
  return Array.from({ length: count }, (_, k) => {
    const first = startOfMonth(new Date(anchor.getFullYear(), anchor.getMonth() + k, 1));
    const last = endOfMonth(first);
    const firstWeekdayMon0 = (first.getDay() + 6) % 7; // 0..6 => Mon..Sun

    const days: Date[] = [];
    // pre
    for (let i = 0; i < firstWeekdayMon0; i++) {
      const d = new Date(first);
      d.setDate(first.getDate() - (firstWeekdayMon0 - i));
      days.push(d);
    }
    // current month
    for (let d = 1; d <= last.getDate(); d++) {
      days.push(new Date(first.getFullYear(), first.getMonth(), d));
    }
    // Pad to 6 lines (42 spaces)
    while (days.length % 7 !== 0) {
      const tail = new Date(days[days.length - 1]);
      tail.setDate(tail.getDate() + 1);
      days.push(tail);
    }
    if (days.length < 42) {
      const need = 42 - days.length;
      for (let i = 0; i < need; i++) {
        const tail = new Date(days[days.length - 1]);
        tail.setDate(tail.getDate() + 1);
        days.push(tail);
      }
    }

    return {
      title: `${fmt(first, { month: "long" })} ${first.getFullYear()}`,
      first,
      days,
    };
  });
}

/* =================== Types =================== */
type DateType = ShiftType;

type Action = { icon: "menu" | "refresh"; onPress: () => void };

type Props = {
  value: Date;                         // Currently selected date (controlled)
  onChange: (d: Date) => void;         // Selection change callback
  shiftMap?: Record<string, ShiftType>; // YYYY-MM-DD -> type
  /** The title placed in the center of the header (default display will be "Mon, May 12, 2025") */
  title?: string;
  /** Icon button on the left side of the head (menu) */
  leftAction?: Action;
  /** Icon button on the right side of the head (refresh) */
  rightAction?: Action;
};

/* =================== Visual helpers =================== */
// day:   ☀️ + ● ○
// night: 🌙 + ○ ●
/* both:  ⛅ + ● ●
   none:  null + ○ ○ */
const dotStyles = StyleSheet.create({
  filled: { width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2, backgroundColor: "#000" },
  hollow: { width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2, borderWidth: 1.5, borderColor: "#BDBDBD", backgroundColor: "transparent" },
});

function visualOf(type: DateType) {
  if (type === "day-shift")   return { icon: "sunny-outline" as const,  dots: ["filled", "hollow"] as const };
  if (type === "night-shift") return { icon: "moon-outline" as const,   dots: ["hollow", "filled"] as const };
  if (type === "both-shifts") return { icon: "partly-sunny-outline" as const, dots: ["filled", "filled"] as const };
  return { icon: null, dots: ["hollow", "hollow"] as const };
}

/** Built-in demo: default type rules when there is no shiftMap */
function getTypeForDate(d: Date): DateType {
  const weekdayMon0 = (d.getDay() + 6) % 7; // 0..6 = Mon..Sun
  if (weekdayMon0 === 0) return "night-shift";    // Mon
  if (weekdayMon0 >= 1 && weekdayMon0 <= 3) return "day-shift"; // Tue-Thu
  if (weekdayMon0 === 4) return "unallocated";    // Fri
  if (weekdayMon0 === 5) return "not-working";    // Sat
  return "night-shift";                            // Sun
}

/** Use external shiftMap first, otherwise use default rules */
function getTypeFromMapOrFallback(d: Date, shiftMap?: Props["shiftMap"]): DateType {
  const key = dayKey(d);
  const t = shiftMap?.[key];
  return (t as DateType) ?? getTypeForDate(d);
}

const iconFor = (name: Action["icon"]) => (name === "menu" ? "menu-outline" : "refresh");

/* =================== Component =================== */
export default function CollapsibleCalendar({
  value,
  onChange,
  shiftMap,
  title,
  leftAction,
  rightAction,
}: Props) {
  const selectedDate = value;
  const [expanded, setExpanded] = useState(false);

  // Lock the start month of the expansion window (set when expanding for the first time)
  const [expandBase, setExpandBase] = useState<Date | null>(null);

  const rotate = useRef(new Animated.Value(0)).current;
  const heightAnim = useRef(new Animated.Value(0)).current;

  // Use expandBase (if present) as the base for the two-month window; 
  // otherwise, use the current month of selectedDate.
  const months = useMemo(() => {
    const base = expandBase ?? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    return buildMonths(base, 2);
  }, [selectedDate, expandBase]);

  // Week cell data (read shiftMap first)
  const weekCells = useMemo(() => {
    const days = getWeekDays(selectedDate);
    return days.map((d) => ({
      fullDate: d,
      date: d.getDate(),
      type: getTypeFromMapOrFallback(d, shiftMap),
    }));
  }, [selectedDate, shiftMap]);

  const toggle = () => {
    const next = !expanded;
    if (next && !expandBase) {
      setExpandBase(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
    Animated.parallel([
      Animated.timing(rotate, { toValue: next ? 1 : 0, duration: 200, useNativeDriver: true }),
      Animated.timing(heightAnim, { toValue: next ? 1 : 0, duration: 200, useNativeDriver: false }),
    ]).start();
    setExpanded(next);
    // To reset the window when it is collapsed, turn on:
    // if (!next) setExpandBase(null);
  };

  const iconRotate = rotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });

  const expandedMaxH = Math.min(H * 0.7, 600);
  const expandedH = heightAnim.interpolate({ inputRange: [0, 1], outputRange: [0, expandedMaxH] });

  return (
    <View style={styles.container}>
      {/* Header (title / leftAction / rightAction) */}
      <View style={styles.header}>
        <View style={styles.headerSide}>
          {leftAction ? (
            <Pressable onPress={leftAction.onPress} hitSlop={10}>
              <Ionicons name={iconFor(leftAction.icon)} size={sx(22)} color={COLOR.ink} />
            </Pressable>
          ) : null}
        </View>

        <Text style={styles.headerTitle}>
          {title ?? `${fmt(selectedDate, { weekday: "short" })}, ${fmt(selectedDate, { day: "2-digit", month: "short", year: "numeric" })}`}
        </Text>

        <View style={[styles.headerSide, { alignItems: "flex-end" }]}>
          {rightAction ? (
            <Pressable onPress={rightAction.onPress} hitSlop={10}>
              <Ionicons name={iconFor(rightAction.icon)} size={sx(20)} color={COLOR.ink} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Closed */}
      {!expanded && (
        <View style={styles.calendarContent}>
          {/* Day labels */}
          <View style={styles.dayLabelsContainer}>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
              <View key={d} style={styles.dayLabelContainer}>
                <Text style={[styles.dayLabel, i >= 5 && styles.weekend]}>{d}</Text>
              </View>
            ))}
          </View>

          {/* Week strip + down open arrow */}
          <View style={styles.weekCard}>
            <View style={styles.weekWrapper}>
              <View style={styles.weekRow}>
                {weekCells.map((item, idx) => {
                  const isSelected = dayKey(item.fullDate) === dayKey(selectedDate);
                  const v = visualOf(item.type);
                  return (
                    <Pressable
                      key={idx}
                      onPress={() => onChange?.(item.fullDate)}
                      style={[styles.dateContainer, isSelected && { borderColor: COLOR.brand, borderWidth: 1 }]}
                    >
                      {!!v.icon && <Ionicons name={v.icon} size={sx(14)} color={COLOR.ink} />}
                      <Text style={styles.dateText}>{item.date}</Text>
                      <TwoDots left={v.dots[0]} right={v.dots[1]} />
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Floating round arrow: positioned on the outer layer */}
            <View style={styles.weekFooter}>
              <Pressable onPress={toggle} style={styles.inlineCaret} hitSlop={10}>
                <Animated.View style={{ transform: [{ rotate: iconRotate }] }}>
                  <Ionicons name="chevron-down" size={CARET_ICON} color={COLOR.brand} />
                </Animated.View>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* Expanded state: fixed for two months; with a collapse arrow on top */}
      <Animated.View style={[styles.expandedContainer, { height: expandedH, overflow: "hidden" }]}>
        {expanded && (
          <>
            <View style={styles.expandCaretTop}>
              <Pressable onPress={toggle} style={styles.caretTopBtn} hitSlop={10}>
                <Animated.View style={{ transform: [{ rotate: iconRotate }] }}>
                  <Ionicons name="chevron-down" size={CARET_ICON} color={COLOR.brand} />
                </Animated.View>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: sx(12) }}>
              {months.map((m, idx) => (
                <View key={`${m.title}-${idx}`} style={{ marginBottom: sx(8) }}>
                  <Text style={styles.monthTitle}>{m.title}</Text>
                  <View style={styles.gridWrap}>
                    {m.days.map((d, i) => {
                      const inMonth = d.getMonth() === m.first.getMonth();
                      const selected = dayKey(d) === dayKey(selectedDate);
                      const t = getTypeFromMapOrFallback(d, shiftMap);
                      const v = visualOf(t);
                      const tint = selected ? COLOR.brand : inMonth ? COLOR.ink : "#C7C7C7";

                      return (
                        <Pressable
                          key={`${dayKey(d)}-${i}`}
                          style={[styles.gridCell, selected && styles.gridCellSelected]}
                          onPress={() => {
                            onChange?.(d);
                            toggle(); // Collapse after selecting a date; expandBase remains unchanged → the same two months will be displayed next time
                          }}
                        >
                          <View style={{ alignItems: "center", gap: sx(2) }}>
                            {!!v.icon && <Ionicons name={v.icon} size={sx(12)} color={tint} />}
                            <Text
                              style={[
                                styles.gridText,
                                !inMonth && styles.gridTextInactive,
                                selected && styles.gridTextSelected,
                              ]}
                            >
                              {d.getDate()}
                            </Text>
                            <TwoDots left={v.dots[0]} right={v.dots[1]} />
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
            </ScrollView>
          </>
        )}
      </Animated.View>
    </View>
  );
}

/* small two dots for day cell */
const TwoDots = ({ left, right }: { left: "filled" | "hollow"; right: "filled" | "hollow" }) => (
  <View style={{ height: sx(6), flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
    <View style={left === "filled" ? dotStyles.filled : dotStyles.hollow} />
    <View style={{ width: sx(3) }} />
    <View style={right === "filled" ? dotStyles.filled : dotStyles.hollow} />
  </View>
);

/* =================== Styles =================== */
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 9.4,
    elevation: 6,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: sx(16),
    paddingVertical: sx(14),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLOR.divider,
  },
  headerSide: { width: sx(28), alignItems: "flex-start", justifyContent: "center" },
  headerTitle: { color: COLOR.ink, fontSize: sx(14), fontWeight: "600" },

  /* 收起态 */
  calendarContent: { paddingBottom: 0 },
  dayLabelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: sx(16),
    paddingTop: sx(8),
  },
  dayLabelContainer: { width: sx(40), height: sx(24), justifyContent: "center", alignItems: "center" },
  dayLabel: { color: COLOR.ink, fontSize: sx(12) },
  weekend: { color: COLOR.brand },

  // Outer positioning container (not clipped)
  weekCard: { position: "relative", overflow: "visible" },

  weekWrapper: {
    borderRadius: sx(12),
    backgroundColor: "#FFF",
    paddingHorizontal: sx(16),
    paddingTop: sx(8),
    paddingBottom: sx(6),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 0,
    overflow: "visible",
  },
  weekRow: { flexDirection: "row", justifyContent: "space-between" },

  dateContainer: {
    width: sx(40),
    height: sx(48), // Leave space for the icon + two dots
    borderRadius: sx(8),
    justifyContent: "center",
    alignItems: "center",
    gap: sx(2),
    backgroundColor: "#FFF",
    borderWidth: 0,
    borderColor: "transparent",
  },
  dateText: { fontSize: sx(12), color: COLOR.ink },

  // Floating arrow: positioned on weekCard
  weekFooter: {
    position: "absolute",
    left: "50%",
    bottom: -CARET_SIZE / 2 - sx(10),
    transform: [{ translateX: -CARET_SIZE / 2 }],
    width: CARET_SIZE,
    height: CARET_SIZE,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    elevation: 10,
  },

  inlineCaret: {
    width: CARET_SIZE,
    height: CARET_SIZE,
    borderRadius: CARET_SIZE / 2,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E3E3E3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },

  /* open status */
  expandedContainer: { backgroundColor: "#FFF", paddingHorizontal: sx(16), paddingTop: sx(8) },
  expandCaretTop: { alignItems: "center", marginBottom: sx(8) },
  caretTopBtn: {
    width: CARET_SIZE,
    height: CARET_SIZE,
    borderRadius: CARET_SIZE / 2,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E3E3E3",
  },

  monthTitle: { fontSize: sx(16), fontWeight: "600", color: COLOR.ink, marginBottom: sx(10) },

  gridWrap: { flexDirection: "row", flexWrap: "wrap" },
  gridCell: {
    width: "14.28%", // 7 colums
    height: sx(64),
    borderRadius: sx(6),
    justifyContent: "center",
    alignItems: "center",
    marginVertical: sx(2),
  },
  gridCellSelected: { backgroundColor: "#E9F4FF", borderWidth: 1, borderColor: COLOR.brand },

  gridText: { fontSize: sx(14), color: COLOR.ink },
  gridTextInactive: { color: "#C7C7C7" },
  gridTextSelected: { color: COLOR.brand, fontWeight: "700" },
});
